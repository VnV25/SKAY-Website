-- ============================================================
-- SKAY — Product Variants Schema
-- Run this entire file in Supabase → SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================

-- ── 1. Ensure products table has all required columns ────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image         TEXT,
  ADD COLUMN IF NOT EXISTS rating        NUMERIC(3,1) DEFAULT 4.5,
  ADD COLUMN IF NOT EXISTS reviews       INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock         INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sizes         TEXT[],
  ADD COLUMN IF NOT EXISTS colors        TEXT[],
  ADD COLUMN IF NOT EXISTS trending      BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS discount      INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS original_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS final_price   NUMERIC(10,2)
    GENERATED ALWAYS AS (
      CASE
        WHEN discount > 0 THEN ROUND(price * (1 - discount::NUMERIC / 100), 2)
        ELSE price
      END
    ) STORED;

-- ── 2. product_variants table ────────────────────────────────
CREATE TABLE IF NOT EXISTS product_variants (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_type  TEXT        NOT NULL,   -- 'color' | 'type' | 'size'
  variant_value TEXT        NOT NULL,   -- 'Black' | 'Oversized' | 'XL'
  image_url     TEXT,                   -- Supabase Storage public URL
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by product
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id
  ON product_variants(product_id);

-- ── 3. RLS policies ──────────────────────────────────────────
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Anyone can read variants (public product catalogue)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'product_variants' AND policyname = 'Public read variants'
  ) THEN
    CREATE POLICY "Public read variants"
      ON product_variants FOR SELECT USING (true);
  END IF;
END $$;

-- Only service-role (backend) can write variants
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'product_variants' AND policyname = 'Service role write variants'
  ) THEN
    CREATE POLICY "Service role write variants"
      ON product_variants FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- ── 4. Storage bucket policy for variant images ───────────────
-- Run in Supabase → Storage → Policies for bucket "product-images":
--
-- Allow public reads:
--   CREATE POLICY "Public read product images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'product-images');
--
-- Allow service-role uploads (admin dashboard):
--   CREATE POLICY "Service role upload product images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'product-images');

-- ── 5. Sample data — products ────────────────────────────────
-- Only inserts if the products table is empty to avoid duplicates.
-- Remove the WHERE clause if you want to force-insert.
INSERT INTO products (name, description, price, original_price, discount, category, image, rating, reviews, stock, trending, sizes, colors)
SELECT * FROM (VALUES
  ('Oversized T-Shirt',        'Premium quality oversized t-shirt with custom printing options. Relaxed fit, breathable fabric.',  299, 499, 40, 'apparel', '/assets/oversize.jpg',   4.8, 124,  8,  true,  ARRAY['S','M','L','XL','XXL'],    ARRAY['Black','White','Navy Blue','Grey','Maroon']),
  ('Regular Fit T-Shirt',      'Classic fit t-shirt perfect for custom designs and logos. Comfortable everyday wear.',             249, 399, 38, 'apparel', '/assets/reg-black.jpg',  4.6,  98, 15,  true,  ARRAY['S','M','L','XL'],          ARRAY['Black','White','Red','Green']),
  ('Zip-Up Hoodie with Logo',  'High-quality zip-up hoodie with embroidery or printing options. Warm and stylish.',               799,1299, 38, 'apparel', '/assets/zip-hoodie.jpg', 4.9,  86,  5,  true,  ARRAY['M','L','XL','XXL'],        ARRAY['Black','Grey','Navy','Maroon']),
  ('Pullover Hoodie',          'Classic pullover hoodie with kangaroo pocket. Perfect for custom team branding.',                 699,1099, 36, 'apparel', '/assets/hoodie1.jpeg',   4.8,  72, 10,  false, ARRAY['S','M','L','XL','XXL'],    ARRAY['Black','Grey','Orange','Maroon']),
  ('Baseball Cap',             'Customizable baseball cap with logo embroidery. Adjustable strap for perfect fit.',              199, 299, 33, 'apparel', '/assets/cap.jpg',        4.5,  67, 20,  false, ARRAY['One Size'],                ARRAY['Black','White','Red','Blue','Green']),
  ('Polo T-Shirt',             'Premium polo shirt with custom embroidery. Professional look for corporate events.',             349, 549, 36, 'apparel', '/assets/navypolo.jpg',   4.7,  78, 25,  false, ARRAY['S','M','L','XL'],          ARRAY['White','Navy','Black','Grey']),
  ('Sports Jersey',            'Custom sports jersey with team logos and player numbers. Moisture-wicking fabric.',              599, 899, 33, 'apparel', '/assets/jersey.jpg',     4.8,  92, 20,  true,  ARRAY['S','M','L','XL','XXL'],    ARRAY['White','Blue','Red','Green']),
  ('Coffee Mug',               'Ceramic coffee mug with full-color printing. Dishwasher safe, 330ml capacity.',                 149, 249, 40, 'gifts',   '/assets/mug.jpg',        4.7, 156, 30,  true,  NULL,                             ARRAY['White','Black Inside','Red Inside','Blue Inside']),
  ('Magic Color Changing Mug', 'Heat-activated color changing magic mug. Reveals your design when filled with hot liquid.',      299, 449, 33, 'gifts',   '/assets/magicmug.jpg',   4.9, 203,  3,  true,  NULL,                             ARRAY['Black','Blue','Red']),
  ('Steel Water Bottle',       'Insulated stainless steel bottle with custom printing. Keeps drinks cold 24h, hot 12h.',        349, 599, 42, 'gifts',   '/assets/bottle.jpg',     4.6,  89, 12,  false, NULL,                             ARRAY['Silver','Black','Blue','Red']),
  ('Custom Keychain',          'Premium metal keychain with custom engraving or photo printing.',                                 49,  99, 51, 'gifts',   '/assets/keychain.jpg',   4.4, 234, 50,  false, NULL,                             ARRAY['Silver','Gold','Black']),
  ('Custom Pillow',            'Soft cushion with personalized photo printing. Great for home decor and gifting.',               299, 499, 40, 'gifts',   '/assets/pillow.jpg',     4.8, 112, 18,  false, ARRAY['12x12','16x16','18x18'],   NULL),
  ('Custom Umbrella',          'Premium quality umbrella with custom logo printing. UV protection coating.',                     449, 699, 36, 'gifts',   '/assets/umbrella.jpg',   4.7,  56, 15,  true,  NULL,                             ARRAY['Black','Navy','Red','Green']),
  ('Custom Tote Bag',          'Eco-friendly cotton tote bag with custom printing. Reusable and durable.',                      249, 399, 38, 'gifts',   '/assets/bag.jpg',        4.6, 143, 25,  false, NULL,                             ARRAY['Natural','Black','Navy','Red']),
  ('Custom Wall Clock',        'Personalized wall clock with photo or logo printing. Silent quartz movement.',                  599, 999, 40, 'gifts',   '/assets/clock.jpg',      4.8,  78,  8,  false, ARRAY['8 inch','10 inch','12 inch'], NULL),
  ('Branded Backpack',         'High-quality backpack with custom logo embroidery. Multiple compartments, laptop sleeve.',      799,1299, 38, 'gifts',   '/assets/bagpack.jpg',    4.9,  92, 12,  false, NULL,                             ARRAY['Black','Navy','Grey']),
  ('Corporate Gift Kit',       'Premium corporate gift set with branded items. Includes mug, notebook, pen, and tote bag.',    1499,2499, 40, 'corporate','/assets/company.jpg',   5.0,  45,  7,  true,  NULL,                             NULL),
  ('Corporate T-Shirts',       'Professional corporate t-shirts with logo printing. Bulk order pricing available.',             249, 399, 38, 'corporate','/assets/corporate.jpg', 4.6, 134, 50,  false, ARRAY['S','M','L','XL','XXL'],    ARRAY['White','Black','Navy','Grey']),
  ('Custom Notebook / Diary',  'Premium quality diary with customized cover. Hardbound, 200 pages, ribbon bookmark.',           199, 349, 43, 'corporate','/assets/notebook.jpg',  4.5, 167, 50,  true,  ARRAY['A5','A4'],                 ARRAY['Brown','Black','Blue','Red']),
  ('Custom Sticker Pack',      'Waterproof custom sticker pack with matte or glossy finish. 50 stickers per pack.',            199, 299, 33, 'printing', '/assets/brand.jpg',      4.7, 156,200,  false, ARRAY['Small','Medium','Large'],  ARRAY['Full Color']),
  ('Premium Visiting Cards',   '100 premium business cards with luxury finish. Matte, glossy, or spot UV options.',            299, 499, 40, 'printing', '/assets/card.jpg',       4.6, 167,100,  false, NULL,                             NULL),
  ('Digital Printing Service', 'High-resolution digital printing for banners, posters, and marketing materials.',              499, 799, 38, 'printing', '/assets/digital.jpg',    4.8,  88,999,  false, NULL,                             NULL)
) AS v(name, description, price, original_price, discount, category, image, rating, reviews, stock, trending, sizes, colors)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- ── 6. Sample data — product_variants ────────────────────────
-- Insert color variants for Oversized T-Shirt
INSERT INTO product_variants (product_id, variant_type, variant_value, image_url)
SELECT p.id, 'color', v.variant_value, v.image_url
FROM products p
CROSS JOIN (VALUES
  ('Black',     '/assets/over-black.jpg'),
  ('White',     '/assets/over-white.jpg'),
  ('Navy Blue', '/assets/navytshirt.jpg'),
  ('Grey',      '/assets/grey-over.jpg'),
  ('Maroon',    '/assets/over-maroon.jpg')
) AS v(variant_value, image_url)
WHERE p.name = 'Oversized T-Shirt'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id
  );

-- Insert color variants for Regular Fit T-Shirt
INSERT INTO product_variants (product_id, variant_type, variant_value, image_url)
SELECT p.id, 'color', v.variant_value, v.image_url
FROM products p
CROSS JOIN (VALUES
  ('Black', '/assets/reg-black.jpg'),
  ('White', '/assets/reg-white.jpg'),
  ('Red',   '/assets/reg-red.jpg'),
  ('Green', '/assets/reg-green.jpg')
) AS v(variant_value, image_url)
WHERE p.name = 'Regular Fit T-Shirt'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id
  );

-- Insert color + type variants for Zip-Up Hoodie
INSERT INTO product_variants (product_id, variant_type, variant_value, image_url)
SELECT p.id, 'color', v.variant_value, v.image_url
FROM products p
CROSS JOIN (VALUES
  ('Black',  '/assets/black-hoodie.jpg'),
  ('Grey',   '/assets/gray-hoodie.jpg'),
  ('Navy',   '/assets/hoodie.jpg'),
  ('Maroon', '/assets/hoodie2.jpeg')
) AS v(variant_value, image_url)
WHERE p.name = 'Zip-Up Hoodie with Logo'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id
  );

INSERT INTO product_variants (product_id, variant_type, variant_value, image_url)
SELECT p.id, 'type', v.variant_value, NULL
FROM products p
CROSS JOIN (VALUES
  ('Zip-Up'), ('Pullover'), ('With Pocket'), ('Without Pocket')
) AS v(variant_value)
WHERE p.name = 'Zip-Up Hoodie with Logo'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE pv.product_id = p.id AND pv.variant_type = 'type'
  );

-- Insert color variants for Polo T-Shirt
INSERT INTO product_variants (product_id, variant_type, variant_value, image_url)
SELECT p.id, 'color', v.variant_value, v.image_url
FROM products p
CROSS JOIN (VALUES
  ('White',  '/assets/whitepolo.jpg'),
  ('Maroon', '/assets/macronpolo.jpg'),
  ('Navy',   '/assets/navypolo.jpg')
) AS v(variant_value, image_url)
WHERE p.name = 'Polo T-Shirt'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id
  );

-- Insert color variants for Sports Jersey
INSERT INTO product_variants (product_id, variant_type, variant_value, image_url)
SELECT p.id, 'color', v.variant_value, v.image_url
FROM products p
CROSS JOIN (VALUES
  ('Blue',   '/assets/team.jpg'),
  ('Red',    '/assets/red-jersey.jpg'),
  ('Yellow', '/assets/jersey.jpg')
) AS v(variant_value, image_url)
WHERE p.name = 'Sports Jersey'
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id
  );
