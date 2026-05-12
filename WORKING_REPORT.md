# IoT Student Counter - Working Report Manual

## Project Overview

This is a complete **IoT Student Counter** system with a React frontend dashboard and a FastAPI backend server. It tracks room occupancy using manual entry/exit buttons or IoT sensors.

---

## System Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   React UI       │ ───► │   FastAPI       │ ───► │   Supabase      │
│   (Frontend)    │      │   (Backend)     │      │   (Database)    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Components

1. **Frontend** (`src/`)
   - `App.jsx` - Main dashboard with live occupancy display
   - `Admin.jsx` - Admin panel for device management
   - TailwindCSS + Framer Motion for UI

2. **Backend** (`server/`)
   - `main.py` - FastAPI server with all REST endpoints
   - Uses Supabase as cloud database

3. **Database** (Supabase)
   - `counters` table - Stores current counts
   - `events` table - Stores entry/exit events
   - `devices` table - Stores registered IoT devices

---

## Features

### Dashboard Features
- Live occupancy counter display
- Entry (+) and Exit (-) buttons
- Reset counter functionality
- Room status indicator (Idle/Stable/Busy/Full)
- Occupancy percentage bar
- System status indicators (IR Beam, WiFi, Backend)

### Admin Panel Features
- View registered devices
- Activate/Deactivate devices
- View device events history
- View all events
- Analytics (Current Inside, Total Entries, Total Exits, Room Capacity)

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/state` | Get current counter state |
| POST | `/api/entry` | Record entry |
| POST | `/api/exit` | Record exit |
| POST | `/api/reset` | Reset counts to zero |
| POST | `/api/sensor-event` | Record sensor event |
| GET | `/api/devices` | List all devices |
| GET | `/api/history` | Get event history |
| GET | `/api/analytics` | Get analytics data |

---

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- Supabase account (free tier)

### Step 1: Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to **Settings → API**
3. Copy the **Project URL** and **Service Role Key**
4. Go to **SQL Editor** and run the following:

```sql
-- Create counters table
CREATE TABLE IF NOT EXISTS counters (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    entered INTEGER DEFAULT 0,
    exited INTEGER DEFAULT 0,
    room_capacity INTEGER DEFAULT 80,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('entry', 'exit')),
    source TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_id TEXT
);

-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    name TEXT,
    status TEXT DEFAULT 'pending',
    registered_at TIMESTAMP WITH TIME ZONE,
    last_seen TIMESTAMP WITH TIME ZONE
);

-- Insert initial counter state
INSERT INTO counters (id, entered, exited, room_capacity)
VALUES (1, 0, 0, 80)
ON CONFLICT (id) DO NOTHING;
```

### Step 2: Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Create virtual environment:
```bash
python -m venv venv
```

3. Activate venv:
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create `.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DEVICE_API_KEY=your_device_api_key
ALLOWED_ORIGINS=*
```

6. Run the server:
```bash
uvicorn main:app --reload
```

The backend will run at `http://localhost:8000`

### Step 3: Frontend Setup

1. Navigate to project root:
```bash
cd IOT-Student-counter-main
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in root:
```env
VITE_API_URL=http://localhost:8000
```

4. Run development server:
```bash
npm run dev
```

The frontend will run at `http://localhost:5173`

---

## Usage Guide

### Using the Dashboard

1. Open `http://localhost:5173` in your browser
2. Click **Entry ++** when someone enters the room
3. Click **Exit --** when someone exits the room
4. The "Currently Inside" counter updates automatically
5. Click **Reset Counter** to reset all counts to zero

### Using the Admin Panel

1. Click **Admin Panel** button on the dashboard
2. View connected devices in the Devices tab
3. Click on a device to view its events
4. Use **Activate/Deactivate** buttons to manage device status
5. View all events in the Events tab

### IoT Sensor Integration

Send sensor events to the API:

```bash
curl -X POST http://localhost:8000/api/sensor-event \
  -H "X-API-Key: your_device_api_key" \
  -H "Content-Type: application/json" \
  -d '{"event": "entry", "source": "esp32-door-1"}'
```

---

## File Structure

```
IOT-Student-counter-main/
├── src/
│   ├── App.jsx          # Main dashboard component
│   ├── Admin.jsx        # Admin panel component
│   ├── App.css         # Dashboard styles
│   ├── index.css       # Global styles
│   ├── main.jsx       # React entry point
│   └── assets/       # Images and assets
├── server/
│   ├── main.py        # FastAPI backend
│   ├── requirements.txt
│   ├── supabase_schema.sql
│   └── .env.example
├── package.json
├── vite.config.js
└── index.html
```

---

## Troubleshooting

### Common Issues

1. **"Failed to fetch state"**
   - Check if backend server is running
   - Verify Supabase credentials in `.env`
   - Check API URL in frontend `.env`

2. **CORS errors**
   - Update `ALLOWED_ORIGINS` in server `.env`

3. **Database errors**
   - Verify Supabase tables are created
   - Check service role key permissions

---

## API Documentation

FastAPI provides automatic API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## License

This project is for educational purposes.

---

## Version

- **Version:** 1.0.0
- **Last Updated:** April 2026
- **Tech Stack:** React 19, FastAPI, Supabase, TailwindCSS 4