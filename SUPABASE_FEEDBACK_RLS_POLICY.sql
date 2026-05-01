-- ============================================
-- FEEDBACK TABLE RLS POLICY FIX
-- ============================================
-- Run this SQL in Supabase SQL Editor to fix:
-- 1. "permission denied for table feedback" error
-- 2. Enable INSERT operations for anonymous users
-- 3. Enable SELECT operations for admins
--
-- IMPORTANT: This assumes the feedback table already exists
-- If not, run the CREATE TABLE statement below first.
--
-- ============================================

-- 1. VERIFY FEEDBACK TABLE EXISTS (if not, create it)
-- Uncomment this section only if the table doesn't exist:
/*
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
*/

-- 2. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 3. DROP EXISTING POLICIES (clean slate)
DROP POLICY IF EXISTS "Allow public INSERT to feedback" ON feedback;
DROP POLICY IF EXISTS "Allow admins to read feedback" ON feedback;
DROP POLICY IF EXISTS "Anyone can submit feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can read feedback" ON feedback;

-- 4. CREATE POLICY FOR PUBLIC INSERT (allows anonymous users to submit feedback)
CREATE POLICY "Allow public INSERT to feedback" ON feedback
  FOR INSERT
  WITH CHECK (true);

-- 5. CREATE POLICY FOR ADMIN READ (allows admins to read all feedback)
CREATE POLICY "Allow admins to read feedback" ON feedback
  FOR SELECT
  USING (
    -- Allow if user is authenticated AND has admin role
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 6. VERIFICATION QUERIES (run these to verify setup)
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'feedback';

-- Check all policies on feedback table
SELECT policyname, qual, with_check FROM pg_policies WHERE tablename = 'feedback';

-- Test: Try to insert a sample feedback record
-- INSERT INTO feedback (name, email, rating, message)
-- VALUES ('Test User', 'test@example.com', 5, 'Great service!')
-- RETURNING id, created_at;

-- Check feedback table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'feedback'
ORDER BY ordinal_position;

-- ============================================
-- TROUBLESHOOTING TIPS
-- ============================================
-- 1. If you still get "permission denied" error:
--    - Verify Supabase project settings > Auth > Allow sign-ups is enabled
--    - Check that your API key is valid
--    - Ensure the policy uses correct logic for your auth setup
--
-- 2. To allow insert without checking auth (most permissive):
--    DROP POLICY "Allow public INSERT to feedback" ON feedback;
--    CREATE POLICY "Allow public INSERT to feedback" ON feedback
--      FOR INSERT
--      WITH CHECK (true);
--
-- 3. To test from backend with SERVICE ROLE KEY:
--    The service role key should have full access and bypass RLS.
--    If still failing, check that SUPABASE_SERVICE_ROLE_KEY is correct.
--
-- 4. To disable RLS entirely (NOT recommended for production):
--    ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;
