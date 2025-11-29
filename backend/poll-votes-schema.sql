-- Poll votes table for homepage poll system
-- This table stores votes for the homepage poll asking visitors if they're visiting for personal or work purposes

CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option VARCHAR(20) NOT NULL CHECK (option IN ('client', 'work')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
-- Index on option for fast vote counting queries
CREATE INDEX IF NOT EXISTS idx_poll_votes_option ON poll_votes(option);

-- Index on created_at for time-based statistics and analytics
CREATE INDEX IF NOT EXISTS idx_poll_votes_created_at ON poll_votes(created_at);

-- Composite index for queries that filter by both option and date
CREATE INDEX IF NOT EXISTS idx_poll_votes_option_created_at ON poll_votes(option, created_at);

-- Add comment to table for documentation
COMMENT ON TABLE poll_votes IS 'Stores votes from the homepage poll asking visitors about their visit purpose (personal/client or work)';
COMMENT ON COLUMN poll_votes.option IS 'Vote option: client (personal use) or work (professional use)';
COMMENT ON COLUMN poll_votes.created_at IS 'Timestamp when the vote was recorded';
