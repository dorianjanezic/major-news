-- Add citations column to market_events table
-- Run this in your Supabase SQL editor

ALTER TABLE market_events ADD COLUMN IF NOT EXISTS citations TEXT[] DEFAULT '{}';
