-- ========================================
-- PRODUCTION SETUP: Orders Table Schema
-- ========================================
-- Run this in Supabase SQL Editor

-- 1. Drop existing orders table if needed (be careful in production!)
-- DROP TABLE IF EXISTS orders CASCADE;

-- 2. Create orders table with correct schema
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_id TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'paid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key constraint (optional - only if users table exists)
  -- CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
  
  CONSTRAINT check_total_amount CHECK (total_amount > 0),
  CONSTRAINT check_status CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled'))
);

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- Allow users to view their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert orders
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
CREATE POLICY "Authenticated users can create orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 6. Create feedback table (from previous implementation)
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Enable RLS for feedback table
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for feedback
DROP POLICY IF EXISTS "Anyone can submit feedback" ON feedback;
CREATE POLICY "Anyone can submit feedback" ON feedback
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read feedback" ON feedback;
CREATE POLICY "Admins can read feedback" ON feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 9. Create index for feedback performance
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- ========================================
-- Verification queries (run these to verify setup)
-- ========================================

-- Check orders table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'orders'
-- ORDER BY ordinal_position;

-- Check feedback table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'feedback'
-- ORDER BY ordinal_position;

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'orders';
-- SELECT * FROM pg_policies WHERE tablename = 'feedback';
