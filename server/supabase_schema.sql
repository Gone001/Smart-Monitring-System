-- Create counter_state table
CREATE TABLE IF NOT EXISTS counter_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    entered INTEGER DEFAULT 0,
    exited INTEGER DEFAULT 0,
    room_capacity INTEGER DEFAULT 50,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create counter_events table
CREATE TABLE IF NOT EXISTS counter_events (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL CHECK (event_type IN ('entry', 'exit')),
    source TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial state if not exists
INSERT INTO counter_state (id, entered, exited, room_capacity)
VALUES (1, 0, 0, 50)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (optional, for future auth)
ALTER TABLE counter_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE counter_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role can do anything" ON counter_state
    FOR ALL USING (true);

CREATE POLICY "Service role can do anything" ON counter_events
    FOR ALL USING (true);

-- Create index for faster history queries
CREATE INDEX IF NOT EXISTS idx_counter_events_timestamp ON counter_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_counter_events_type ON counter_events(event_type);
