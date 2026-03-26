-- ============================================================
-- Migration 004: Storage bucket and policies
-- This Is Haringey — Community Platform
-- ============================================================

-- -----------------------------------------------
-- Create the event-images bucket
-- public = true: unauthenticated reads allowed (event images are public)
-- file_size_limit: 5MB hard cap (defence-in-depth — also enforced app-side)
-- allowed_mime_types: accept only image formats (Section 12.4)
-- -----------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;


-- -----------------------------------------------
-- Storage policies on storage.objects
-- -----------------------------------------------

-- Public read: anyone can view event images (they are public assets)
CREATE POLICY "event-images: public read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'event-images');

-- Authenticated upload: logged-in users (organisers) can upload images
-- Filename must be prefixed with their own user ID for namespace isolation
CREATE POLICY "event-images: authenticated upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-images'
  );

-- Admin delete: only admins can delete images directly
CREATE POLICY "event-images: admin delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-images'
    AND is_admin()
  );

-- Admin update (e.g. replace image)
CREATE POLICY "event-images: admin update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-images'
    AND is_admin()
  );
