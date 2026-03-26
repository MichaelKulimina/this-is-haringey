-- ============================================================
-- Migration 002: Enable RLS and define all policies
-- This Is Haringey — Community Platform
-- ============================================================

-- -----------------------------------------------
-- Helper: is_admin()
-- Checks JWT app_metadata for admin role claim.
-- Admin role is set server-side via service role key only.
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    FALSE
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- -----------------------------------------------
-- Enable RLS on all tables
-- -----------------------------------------------
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues        ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- categories
-- ============================================================

-- Anyone can read categories (used for public filtering UI)
CREATE POLICY "categories: public read"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Only admins can insert/update/delete categories
CREATE POLICY "categories: admin insert"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "categories: admin update"
  ON categories FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "categories: admin delete"
  ON categories FOR DELETE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- venues
-- ============================================================

CREATE POLICY "venues: public read"
  ON venues FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "venues: admin insert"
  ON venues FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "venues: admin update"
  ON venues FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "venues: admin delete"
  ON venues FOR DELETE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- organisers
-- ============================================================

-- Organiser can read their own profile
CREATE POLICY "organisers: own read"
  ON organisers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admin can read all organiser profiles
CREATE POLICY "organisers: admin read all"
  ON organisers FOR SELECT
  TO authenticated
  USING (is_admin());

-- Insert is handled by the handle_new_organiser() trigger (SECURITY DEFINER)
-- This policy allows the trigger's context to insert
CREATE POLICY "organisers: own insert"
  ON organisers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Organiser can update their own profile
CREATE POLICY "organisers: own update"
  ON organisers FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Admin can update any organiser profile
CREATE POLICY "organisers: admin update all"
  ON organisers FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Only admin can delete organiser profiles
CREATE POLICY "organisers: admin delete"
  ON organisers FOR DELETE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- submissions
-- ============================================================

-- Organiser can read their own submissions
CREATE POLICY "submissions: own read"
  ON submissions FOR SELECT
  TO authenticated
  USING (organiser_id = auth.uid());

-- Admin can read all submissions
CREATE POLICY "submissions: admin read all"
  ON submissions FOR SELECT
  TO authenticated
  USING (is_admin());

-- Guest (anon) submissions go through a server-side API route
-- The route uses the anon key; this policy permits that insert
CREATE POLICY "submissions: anon insert"
  ON submissions FOR INSERT
  TO anon
  WITH CHECK (TRUE);

-- Authenticated users (organisers) can also insert via server-side route
CREATE POLICY "submissions: authenticated insert"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Organiser can update their own submissions only when pending or returned
CREATE POLICY "submissions: own update pending/returned"
  ON submissions FOR UPDATE
  TO authenticated
  USING (organiser_id = auth.uid() AND status IN ('pending', 'returned'));

-- Admin can update any submission (approve, return, reject, etc.)
CREATE POLICY "submissions: admin update all"
  ON submissions FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Only admin can delete submissions
CREATE POLICY "submissions: admin delete"
  ON submissions FOR DELETE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- events
-- ============================================================

-- Public can read published events only
CREATE POLICY "events: public read published"
  ON events FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Admin can read all events (including withdrawn)
CREATE POLICY "events: admin read all"
  ON events FOR SELECT
  TO authenticated
  USING (is_admin());

-- Only admin can insert events (created from approved submissions)
CREATE POLICY "events: admin insert"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Only admin can update events
CREATE POLICY "events: admin update"
  ON events FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Only admin can delete events
CREATE POLICY "events: admin delete"
  ON events FOR DELETE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- payments
-- ============================================================
-- Payments are inserted server-side via service role key only.
-- No INSERT policy for anon or authenticated roles.

-- Organiser can read their own payment records (billing history)
CREATE POLICY "payments: own read"
  ON payments FOR SELECT
  TO authenticated
  USING (organiser_id = auth.uid());

-- Admin can read all payment records
CREATE POLICY "payments: admin read all"
  ON payments FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admin can update payment status (e.g. mark as refunded)
CREATE POLICY "payments: admin update"
  ON payments FOR UPDATE
  TO authenticated
  USING (is_admin());


-- ============================================================
-- subscriptions
-- ============================================================
-- Subscriber email addresses are PII. No public SELECT policy.
-- All reads and updates are done server-side via service role key,
-- except the initial INSERT which is public (sign-up widget).

-- Anyone can subscribe (public sign-up widget)
CREATE POLICY "subscriptions: anon insert"
  ON subscriptions FOR INSERT
  TO anon
  WITH CHECK (TRUE);

-- Authenticated users can also insert (e.g. logged-in organiser subscribing)
CREATE POLICY "subscriptions: authenticated insert"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Only admin can read subscriptions (GDPR — protect email addresses)
CREATE POLICY "subscriptions: admin read all"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (is_admin());
