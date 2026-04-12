-- Add missing columns to profiles table if they don't exist
-- Run this in your Supabase SQL Editor

-- Check and add phone column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
  END IF;
END$$;

-- Check and add company column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company') THEN
    ALTER TABLE public.profiles ADD COLUMN company TEXT;
  END IF;
END$$;

-- Optional: If the above doesn't work, run these directly
-- ALTER TABLE public.profiles ADD COLUMN phone TEXT;
-- ALTER TABLE public.profiles ADD COLUMN company TEXT;
