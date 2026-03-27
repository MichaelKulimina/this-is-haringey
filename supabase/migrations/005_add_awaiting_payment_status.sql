-- ============================================================
-- Migration 005: Add 'awaiting_payment' to submissions status
-- This Is Haringey — Community Platform
-- ============================================================
-- The submissions.status column uses a TEXT CHECK constraint
-- (not a Postgres ENUM), so we drop and recreate it.
-- This migration is non-destructive — no data migration needed.

ALTER TABLE submissions
  DROP CONSTRAINT submissions_status_check,
  ADD CONSTRAINT submissions_status_check
    CHECK (status IN ('awaiting_payment','pending','approved','returned','rejected','withdrawn'));
