# IoT Student Counter

A smart room occupancy tracking system built with React, FastAPI, and Supabase. Monitor room entries, exits, and real-time occupancy using IoT sensors (Arduino, ESP32, IR sensors).

## Features

- Real-time occupancy monitoring with auto-refresh
- IoT sensor integration via API
- Admin panel for device management
- Responsive dark/light theme dashboard
- Event history and analytics

## Prerequisites

- Node.js 18+
- Python 3.10+
- A Supabase project

## Setup

### Frontend

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure `.env` in the root directory:
   ```
   VITE_API_URL=http://localhost:8000
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

### Backend

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Configure `server/.env` (copy from `server/.env.example`):
   ```
   DEVICE_API_KEY=your_secure_device_key_here
   ADMIN_PASSWORD=change_this_to_a_strong_password
   ALLOWED_ORIGINS=http://localhost:5173
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Set up the Supabase database using the schema in `server/supabase_schema.sql`

5. Start the server:
   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/state` | Get current counter state |
| POST | `/api/entry` | Record an entry (requires API key) |
| POST | `/api/exit` | Record an exit (requires API key) |
| POST | `/api/sensor-event` | Submit sensor event (requires API key) |
| POST | `/api/admin/login` | Admin authentication |
| POST | `/api/reset` | Reset all counters (requires API key) |
| GET | `/api/devices` | List all devices |
| GET | `/api/history` | Get event history |
| GET | `/api/analytics` | Get analytics summary |
| PUT | `/api/capacity` | Update room capacity |

## Project Structure

```
├── src/              # React frontend
│   ├── App.jsx       # Main app with routing
│   ├── Admin.jsx     # Admin panel
│   ├── LandingPage.jsx
│   └── ...
├── server/           # FastAPI backend
│   ├── main.py       # API server
│   ├── requirements.txt
│   └── supabase_schema.sql
├── .env              # Frontend environment
└── package.json
```

## Security Notes

- Never commit `.env` files
- Change the default `DEVICE_API_KEY` and `ADMIN_PASSWORD` before deployment
- Set `ALLOWED_ORIGINS` to your production domain
- Use HTTPS in production
