-- ===============================
-- CREATE ASSETS/IMAGES TABLE
-- ===============================
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'product', 'service', 'hero', 'gallery', 'brochure', etc
  category TEXT, -- specific category like 'tshirts', 'mugs', etc
  file_url TEXT NOT NULL, -- URL from Supabase Storage
  file_path TEXT NOT NULL, -- Storage path
  file_size INTEGER, -- Size in bytes
  mime_type TEXT, -- image/jpeg, image/png, etc
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage all assets
CREATE POLICY "Admins manage assets"
ON public.assets FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Anyone can view public assets
CREATE POLICY "Anyone can view assets"
ON public.assets FOR SELECT
USING (true);

-- Create index on asset type and category for faster queries
CREATE INDEX idx_assets_type ON public.assets(type);
CREATE INDEX idx_assets_category ON public.assets(category);
CREATE INDEX idx_assets_type_category ON public.assets(type, category);
