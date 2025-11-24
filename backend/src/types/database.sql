-- SQL schema for market_events table in Supabase
-- Run this in Supabase SQL editor to create the table

-- Drop the old check constraint if it exists
ALTER TABLE market_events DROP CONSTRAINT IF EXISTS market_events_type_check;

CREATE TABLE IF NOT EXISTS market_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL, -- e.g., "November 24 2025" or "November 24-29 2025"
  event TEXT NOT NULL,
  type TEXT NOT NULL, -- Allow any event type - AI can be creative and descriptive
  description TEXT NOT NULL,
  significance TEXT NOT NULL CHECK (significance IN ('High', 'Medium', 'Low')),
  market_sentiment TEXT NOT NULL CHECK (market_sentiment IN ('Bullish', 'Bearish', 'Neutral', 'Mixed')),
  citations TEXT[] DEFAULT '{}', -- Array of citation URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_market_events_date ON market_events(date);
CREATE INDEX IF NOT EXISTS idx_market_events_type ON market_events(type);
CREATE INDEX IF NOT EXISTS idx_market_events_significance ON market_events(significance);
CREATE INDEX IF NOT EXISTS idx_market_events_created_at ON market_events(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_market_events_updated_at
    BEFORE UPDATE ON market_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE market_events ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed for your auth requirements)
CREATE POLICY "Allow public read access on market_events" ON market_events
    FOR SELECT USING (true);

-- Policy for insert/update (you might want to restrict this based on authentication)
CREATE POLICY "Allow authenticated insert on market_events" ON market_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update on market_events" ON market_events
    FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete on market_events" ON market_events
    FOR DELETE USING (true);
