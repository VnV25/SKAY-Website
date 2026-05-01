-- ============================================
-- FEEDBACK TABLE RLS FIX - PERMISSION DENIED
-- ============================================
-- Run this in Supabase SQL Editor to fix:
-- "permission denied for table feedback" error
--
-- This script provides TWO options:
-- Option 1: Create RLS policy for public INSERT
-- Option 2: Disable RLS entirely (simpler, less secure)
--
-- ============================================

-- 1. FIRST: Ensure feedback table exists
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- ============================================
-- OPTION 1: ENABLE RLS WITH PUBLIC INSERT POLICY (RECOMMENDED)
-- ============================================

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (clean slate)
DROP POLICY IF EXISTS "Allow public insert to feedback" ON feedback;
DROP POLICY IF EXISTS "Allow admins to read feedback" ON feedback;
DROP POLICY IF EXISTS "Anyone can submit feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can read feedback" ON feedback;

-- Create policy for PUBLIC INSERT (allows anyone to submit feedback)
CREATE POLICY "Allow public insert to feedback" ON feedback
  FOR INSERT
  WITH CHECK (true);

-- Create policy for ADMIN READ (allows admins to view feedback)
CREATE POLICY "Allow admins to read feedback" ON feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- OPTION 2: DISABLE RLS ENTIRELY (SIMPLER BUT LESS SECURE)
-- ============================================
-- Uncomment the line below if you prefer to disable RLS completely:
-- ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'feedback';

-- Check all policies on feedback table
SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'feedback';

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'feedback'
ORDER BY ordinal_position;

-- ============================================
-- TEST THE FIX
-- ============================================
-- After running this script, test with:
-- INSERT INTO feedback (name, email, rating, message)
-- VALUES ('Test User', 'test@example.com', 5, 'Testing RLS fix')
-- RETURNING id, created_at;

-- ============================================
-- TROUBLESHOOTING
-- ============================================
-- If you still get "permission denied":
-- 1. Verify you're using SERVICE ROLE KEY in backend (not anon key)
-- 2. Check that the policy was created: SELECT * FROM pg_policies WHERE tablename = 'feedback';
-- 3. Try Option 2 (disable RLS) if Option 1 doesn't work
-- 4. Restart your backend server after making changes
-- 5. Check backend logs for detailed error messages