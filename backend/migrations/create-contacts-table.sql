-- Create contacts table in Supabase
-- Run this in Supabase SQL Editor if contacts table is missing

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON public.contacts(created_at);

-- RLS Policy: Admins can view all contacts
CREATE POLICY "Admins can view all contacts" 
  ON public.contacts 
  FOR SELECT 
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- RLS Policy: Admins can update contacts
CREATE POLICY "Admins can update contacts" 
  ON public.contacts 
  FOR UPDATE 
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- RLS Policy: Anyone can insert contacts (for contact form submissions)
CREATE POLICY "Anyone can insert contacts" 
  ON public.contacts 
  FOR INSERT 
  WITH CHECK (true);
