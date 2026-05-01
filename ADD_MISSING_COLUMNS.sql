-- ============================================================
-- SKAY — Schema patch
-- Run this in Supabase → SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS / DO blocks)
-- ============================================================

-- ── 1. profiles: remove is_logged_in dependency ──────────────
-- The column is no longer written by the backend.
-- If it exists and you want to keep it, leave this commented out.
-- ALTER TABLE profiles DROP COLUMN IF EXISTS is_logged_in;

-- Ensure the minimum required columns exist on profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_url  TEXT,
  ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login  TIMESTAMPTZ;

-- ── 2. contacts: add status column ───────────────────────────
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

-- Add a check constraint so only valid values are stored
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'contacts'
      AND constraint_name = 'contacts_status_check'
  ) THEN
    ALTER TABLE contacts
      ADD CONSTRAINT contacts_status_check
      CHECK (status IN ('pending', 'completed', 'rejected'));
  END IF;
END $$;

-- ── 3. products: add discount columns ────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS discount          INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS original_price    NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS discount_percentage INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN original_price IS NOT NULL AND original_price > 0
      THEN ROUND(((original_price - price) / original_price * 100)::NUMERIC, 0)::INTEGER
      ELSE discount
    END
  ) STORED;

-- Note: discount_percentage is a computed column.
-- If your Postgres version doesn't support GENERATED ALWAYS AS STORED,
-- replace with a plain INTEGER column and compute in application code.

-- ── 4. Storage bucket policy reminder ────────────────────────
-- Run these in Supabase → Storage → Policies for bucket "product-images":
--
-- Allow public reads (SELECT):
--   CREATE POLICY "Public read product images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'product-images');
--
-- Allow authenticated uploads (INSERT):
--   CREATE POLICY "Authenticated upload product images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
--
-- Or for service-role uploads (admin dashboard):
--   CREATE POLICY "Service role upload product images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'product-images');
