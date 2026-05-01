-- ============================================================
-- SKAY — Admin RLS Policies
-- Run this in Supabase → SQL Editor
--
-- These policies work because AdminLogin.tsx now calls
-- supabase.auth.signInWithPassword() directly, which creates
-- a real Supabase browser session. auth.uid() is non-null
-- for logged-in users, so these policies evaluate correctly.
-- ============================================================

-- ── Helper: is the current user an admin? ────────────────────
-- Reusable inline check used in all admin policies below.
-- Reads from the profiles table where role = 'admin'.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   profiles
    WHERE  id   = auth.uid()
    AND    role = 'admin'
  );
$$;

-- ── products table ───────────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can read products (public catalogue)
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products"
  ON products FOR SELECT
  USING (true);

-- Only admins can insert / update / delete products
DROP POLICY IF EXISTS "Admin insert products" ON products;
CREATE POLICY "Admin insert products"
  ON products FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin update products" ON products;
CREATE POLICY "Admin update products"
  ON products FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin delete products" ON products;
CREATE POLICY "Admin delete products"
  ON products FOR DELETE
  USING (is_admin());

-- ── product_variants table ───────────────────────────────────
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Anyone can read variants (needed for ProductModal color switching)
DROP POLICY IF EXISTS "Public read variants" ON product_variants;
CREATE POLICY "Public read variants"
  ON product_variants FOR SELECT
  USING (true);

-- Only admins can write variants
DROP POLICY IF EXISTS "Admin insert variants" ON product_variants;
CREATE POLICY "Admin insert variants"
  ON product_variants FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin update variants" ON product_variants;
CREATE POLICY "Admin update variants"
  ON product_variants FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin delete variants" ON product_variants;
CREATE POLICY "Admin delete variants"
  ON product_variants FOR DELETE
  USING (is_admin());

-- ── Storage: product-images bucket ──────────────────────────
-- Run these in Supabase → Storage → Policies
-- (or paste into SQL Editor — storage.objects table)

-- Allow public reads (product images are public)
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow admin uploads
DROP POLICY IF EXISTS "Admin upload product images" ON storage.objects;
CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND is_admin()
  );

-- Allow admin updates (replace existing image)
DROP POLICY IF EXISTS "Admin update product images" ON storage.objects;
CREATE POLICY "Admin update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND is_admin()
  );

-- ── profiles table ───────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Admins can read all profiles (for the users tab in dashboard)
DROP POLICY IF EXISTS "Admin read all profiles" ON profiles;
CREATE POLICY "Admin read all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Users can update their own profile
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Service role can do anything (used by backend server)
-- This is automatic for the service role key — no policy needed.

-- ── Verify the setup ─────────────────────────────────────────
-- After logging in as admin in the browser, run this in SQL Editor:
--   SELECT auth.uid();
-- It should return your admin user's UUID (not null).
--
-- Then test:
--   SELECT is_admin();
-- Should return: true
