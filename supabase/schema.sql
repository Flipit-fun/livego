-- Run this in the Supabase SQL editor (Dashboard > SQL Editor > New query).
-- This creates the `launches` table that tracks tokens launched via StreamGo.

CREATE TABLE IF NOT EXISTS launches (
  id BIGSERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,          -- token contract address (lowercase)
  deployer TEXT NOT NULL,              -- wallet that launched it (lowercase)
  tx_hash TEXT,                        -- launch transaction hash
  name TEXT,                           -- token name
  symbol TEXT,                         -- token symbol
  logo TEXT,                           -- logo image URL
  description TEXT,                    -- token description
  twitter TEXT,
  telegram TEXT,
  discord TEXT,
  website TEXT,
  launched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by deployer (show "your launches")
CREATE INDEX IF NOT EXISTS idx_launches_deployer ON launches (deployer);

-- RLS: anyone can read launches, only authenticated service role can insert
ALTER TABLE launches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON launches
  FOR SELECT USING (true);

CREATE POLICY "Service insert" ON launches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service update" ON launches
  FOR UPDATE USING (true);
