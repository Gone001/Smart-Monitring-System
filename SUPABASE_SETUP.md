# Supabase Setup for IoT Student Counter

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose organization and set project name
4. Set a secure database password
5. Select region closest to you
6. Wait for project to initialize

## 2. Get API Keys

1. Go to Project Settings → API
2. Copy the **Project URL** → `SUPABASE_URL`
3. Copy the **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Never expose service role key in frontend or ESP32**

## 3. Create Database Tables

1. Go to SQL Editor in Supabase dashboard
2. Copy contents of `server/supabase_schema.sql`
3. Click "Run" to create tables

## 4. Configure Backend

Create `server/.env` file:

```env
DEVICE_API_KEY=your_secure_device_key_here
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## 5. Verify Setup

Start backend:

```bash
cd server
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Test endpoint:

```bash
curl http://localhost:8000/api/state
```

Should return:

```json
{
  "entered": 0,
  "exited": 0,
  "inside": 0,
  "roomCapacity": 50,
  "occupancyPercentage": 0
}
```
