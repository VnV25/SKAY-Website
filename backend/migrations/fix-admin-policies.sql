-- ===============================
-- FIX ADMIN UPDATE POLICIES
-- ===============================

-- Add updated_at column to orders if it doesn't exist
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at and notes columns to contacts if they don't exist
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add UPDATE policy for admins on orders table
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Add UPDATE policy for admins on contacts table
DROP POLICY IF EXISTS "Admins can update contacts" ON public.contacts;
CREATE POLICY "Admins can update contacts"
ON public.contacts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Ensure orders have order_date column for sorting (if missing)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_date TIMESTAMP DEFAULT NOW();
