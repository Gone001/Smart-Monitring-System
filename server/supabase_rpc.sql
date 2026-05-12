-- Run this SQL in your Supabase SQL Editor to enable atomic counter updates

-- Atomic increment function for counters table
CREATE OR REPLACE FUNCTION increment_counter(column_name TEXT, row_id INTEGER)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE counters SET %I = %I + 1 WHERE id = $1', column_name, column_name)
  USING row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS is configured properly
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (already implied, but explicit)
CREATE POLICY "service_role_full_access_counters" ON counters FOR ALL USING (true);
CREATE POLICY "service_role_full_access_events" ON events FOR ALL USING (true);
CREATE POLICY "service_role_full_access_devices" ON devices FOR ALL USING (true);

-- Allow public read access to counters state
CREATE POLICY "public_read_counters" ON counters FOR SELECT USING (true);

-- Allow public read access to events
CREATE POLICY "public_read_events" ON events FOR SELECT USING (true);

-- Allow public read access to devices
CREATE POLICY "public_read_devices" ON devices FOR SELECT USING (true);
