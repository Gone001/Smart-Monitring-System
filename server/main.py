from fastapi import FastAPI, HTTPException, Depends, Security, WebSocket, WebSocketDisconnect
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from datetime import datetime
import os
import secrets
import hmac
from dotenv import load_dotenv
from supabase import create_client, Client
from pydantic import BaseModel, Field
import asyncio

from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")

app = FastAPI(title="IoT Student Counter API")

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

DEVICE_API_KEY = os.getenv("DEVICE_API_KEY")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "change_this_to_a_strong_password")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()


# Pydantic models for input validation
class SensorEvent(BaseModel):
    event: str = Field(..., pattern="^(entry|exit)$", description="Must be 'entry' or 'exit'")
    source: Optional[str] = Field(default="esp32-door-1", max_length=100)

class DeviceRegister(BaseModel):
    device_id: str = Field(..., min_length=1, max_length=100)
    name: Optional[str] = Field(default=None, max_length=200)

class AdminLogin(BaseModel):
    password: str = Field(..., min_length=1, max_length=200)

class CapacityUpdate(BaseModel):
    room_capacity: int = Field(..., ge=1, le=10000, description="Room capacity must be between 1 and 10000")


async def verify_api_key(api_key: str = Security(api_key_header)):
    if DEVICE_API_KEY and api_key != DEVICE_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return api_key


def _ensure_counter_exists():
    result = supabase.table("counters").select("*").eq("id", 1).execute()
    if not result.data:
        supabase.table("counters").insert({
            "id": 1,
            "entered": 0,
            "exited": 0,
            "room_capacity": 80
        }).execute()
        result = supabase.table("counters").select("*").eq("id", 1).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to initialize counter")
    return result.data[0]


def _atomic_increment(column_name: str):
    supabase.rpc("increment_counter", {"column_name": column_name, "row_id": 1}).execute()

async def broadcast_current_state():
    state = await get_state()
    await manager.broadcast({"type": "state_update", "data": state})


async def get_state():
    row = _ensure_counter_exists()
    inside = row["entered"] - row["exited"]
    occupancy = (inside / row["room_capacity"]) * 100 if row["room_capacity"] > 0 else 0
    return {
        "entered": row["entered"],
        "exited": row["exited"],
        "inside": max(inside, 0),
        "roomCapacity": row["room_capacity"],
        "occupancyPercentage": round(occupancy, 2)
    }


@app.get("/api")
async def health_check():
    return {"status": "online", "service": "IoT Student Counter API"}


@app.get("/api/state")
async def read_state():
    return await get_state()


@app.post("/api/entry")
async def record_entry(api_key: str = Depends(verify_api_key)):
    _atomic_increment("entered")
    supabase.table("events").insert({
        "type": "entry",
        "source": "manual",
        "timestamp": datetime.now().isoformat(),
        "device_id": None
    }).execute()
    await broadcast_current_state()
    return await get_state()


@app.post("/api/exit")
async def record_exit(api_key: str = Depends(verify_api_key)):
    _atomic_increment("exited")
    supabase.table("events").insert({
        "type": "exit",
        "source": "manual",
        "timestamp": datetime.now().isoformat(),
        "device_id": None
    }).execute()
    await broadcast_current_state()
    return await get_state()


@app.post("/api/sensor-event")
async def sensor_event(event: SensorEvent, api_key: str = Depends(verify_api_key)):
    device_id = event.source

    device_result = supabase.table("devices").select("status").eq("id", device_id).execute()

    if not device_result.data:
        supabase.table("devices").insert({
            "id": device_id,
            "name": f"Device {device_id}",
            "status": "active",
            "registered_at": datetime.now().isoformat(),
            "last_seen": None
        }).execute()
        device_status = "active"
    else:
        device_status = device_result.data[0]["status"]
        if device_status == "inactive":
            raise HTTPException(status_code=403, detail="Device is not active")

    if event.event == "entry":
        _atomic_increment("entered")
    else:
        _atomic_increment("exited")

    supabase.table("events").insert({
        "type": event.event,
        "source": "esp32",
        "timestamp": datetime.now().isoformat(),
        "device_id": device_id
    }).execute()

    supabase.table("devices").update({
        "last_seen": datetime.now().isoformat()
    }).eq("id", device_id).execute()
    
    await broadcast_current_state()
    return await get_state()


@app.post("/api/devices/register")
async def register_device(device: DeviceRegister, api_key: str = Depends(verify_api_key)):
    existing = supabase.table("devices").select("*").eq("id", device.device_id).execute()

    if existing.data:
        return {"message": "Device already registered", "status": existing.data[0]["status"]}

    supabase.table("devices").insert({
        "id": device.device_id,
        "name": device.name or f"Device {device.device_id}",
        "status": "pending",
        "registered_at": datetime.now().isoformat(),
        "last_seen": None
    }).execute()

    return {"message": "Device registered successfully", "status": "pending"}


@app.get("/api/devices")
async def list_devices():
    result = supabase.table("devices").select("*").execute()
    return result.data


@app.get("/api/devices/{device_id}")
async def get_device(device_id: str):
    result = supabase.table("devices").select("*").eq("id", device_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Device not found")

    return result.data[0]


@app.get("/api/devices/{device_id}/events")
async def get_device_events(device_id: str, limit: int = 100):
    result = supabase.table("events").select("*").or_(f"device_id.eq.{device_id},source.eq.{device_id}").order("timestamp", desc=True).limit(limit).execute()
    return result.data


@app.put("/api/devices/{device_id}/activate")
async def activate_device(device_id: str):
    result = supabase.table("devices").select("*").eq("id", device_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Device not found")

    supabase.table("devices").update({"status": "active"}).eq("id", device_id).execute()

    return {"message": "Device activated successfully"}


@app.put("/api/devices/{device_id}/deactivate")
async def deactivate_device(device_id: str):
    result = supabase.table("devices").select("*").eq("id", device_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Device not found")

    supabase.table("devices").update({"status": "inactive"}).eq("id", device_id).execute()

    return {"message": "Device deactivated successfully"}


@app.post("/api/admin/login")
async def admin_login(login: AdminLogin):
    if hmac.compare_digest(login.password, ADMIN_PASSWORD):
        token = secrets.token_hex(32)
        return {"message": "Login successful", "token": token}
    raise HTTPException(status_code=401, detail="Invalid password")


@app.post("/api/reset")
async def reset_counts(api_key: str = Depends(verify_api_key)):
    supabase.table("counters").update({"entered": 0, "exited": 0}).eq("id", 1).execute()
    supabase.table("events").delete().neq("id", 0).execute()
    await broadcast_current_state()
    return await get_state()


@app.get("/api/history")
async def get_history(limit: int = 100):
    result = supabase.table("events").select("*").order("timestamp", desc=True).limit(limit).execute()
    return result.data


@app.get("/api/analytics")
async def get_analytics():
    state_result = supabase.table("counters").select("*").eq("id", 1).execute()
    state = state_result.data[0] if state_result.data else {"entered": 0, "exited": 0, "room_capacity": 80}

    entries_result = supabase.table("events").select("*", count="exact").eq("type", "entry").execute()
    total_entries = entries_result.count

    exits_result = supabase.table("events").select("*", count="exact").eq("type", "exit").execute()
    total_exits = exits_result.count

    inside = state["entered"] - state["exited"]

    return {
        "currentInside": max(inside, 0),
        "totalEntries": total_entries,
        "totalExits": total_exits,
        "peakOccupancy": max(inside, 0),
        "roomCapacity": state["room_capacity"]
    }


@app.put("/api/capacity")
async def update_capacity(capacity: CapacityUpdate):
    supabase.table("counters").update({"room_capacity": capacity.room_capacity}).eq("id", 1).execute()
    return await get_state()


@app.get("/api/system/health")
async def system_health():
    import time
    start = time.time()
    backend_status = "Offline"
    wifi_status = "Poor"
    
    try:
        result = supabase.table("counters").select("id").eq("id", 1).execute()
        backend_status = "Connected" if result.data else "Error"
        
        latency = (time.time() - start) * 1000
        if latency < 300:
            wifi_status = "Excellent"
        elif latency < 800:
            wifi_status = "Good"
        else:
            wifi_status = "Poor"
    except Exception:
        backend_status = "Disconnected"
        wifi_status = "Poor"

    try:
        import datetime
        cutoff = (datetime.datetime.now() - datetime.timedelta(minutes=2)).isoformat()
        events_result = supabase.table("events").select("source").gte("timestamp", cutoff).execute()
        
        if events_result.data and any(e.get("source") in ["esp32", "manual"] for e in events_result.data):
            ir_status = "Active"
        else:
            ir_status = "Standby"
    except Exception:
        ir_status = "Unknown"

    return {
        "backend": backend_status,
        "wifi_sync": wifi_status,
        "ir_beam": ir_status
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Wait for messages from client (e.g., heartbeats) or just keep alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
