-- ============================================================
-- Migration 003: Seed categories
-- This Is Haringey — Community Platform
-- Five subcategories from Section 3.1 of the build brief.
-- UUIDs are hardcoded for reproducibility across environments.
-- ============================================================

INSERT INTO categories (id, name, slug) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Arts & Culture',    'arts-culture'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Music',             'music'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Community',         'community'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Food & Drink',      'food-drink'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'Learning & Talks',  'learning-talks')
ON CONFLICT (id) DO NOTHING;
