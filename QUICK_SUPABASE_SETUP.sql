-- ========================================
-- QUICK SUPABASE SETUP - Copy & Paste This
-- ========================================

-- 1. PROFILES TABLE (REQUIRED FOR AUTH)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT DEFAULT '',
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  company TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. CONTACTS TABLE (REQUIRED FOR CONTACT FORM)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 3. BASIC POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can insert contact" ON public.contacts
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view contacts" ON public.contacts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- SUCCESS: Tables created! Now user registration should work.