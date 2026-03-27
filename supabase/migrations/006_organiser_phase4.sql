-- Phase 4: Organiser accounts and dashboard
-- Run manually in Supabase SQL Editor

-- 1. Add re_review status to submissions
ALTER TABLE submissions DROP CONSTRAINT submissions_status_check;
ALTER TABLE submissions ADD CONSTRAINT submissions_status_check
  CHECK (status IN ('awaiting_payment','pending','approved','returned','rejected','withdrawn','re_review'));

-- 2. Add withdrawal_requested status to events
ALTER TABLE events DROP CONSTRAINT events_status_check;
ALTER TABLE events ADD CONSTRAINT events_status_check
  CHECK (status IN ('published','withdrawn','withdrawal_requested'));

-- 3. Add parent_event_id to submissions (links re-review submissions to the event being updated)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS parent_event_id UUID REFERENCES events(id) ON DELETE SET NULL;
