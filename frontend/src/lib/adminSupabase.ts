/**
 * adminSupabase.ts
 *
 * Direct Supabase query helpers for the Admin Dashboard.
 *
 * WHY direct queries instead of the backend API?
 * ─────────────────────────────────────────────
 * The backend API layer uses two different auth mechanisms:
 *   • Express backend  → JWT signed with JWT_SECRET  (authMiddleware.js)
 *   • Vercel serverless → Supabase token validation   (lib/auth.js requireAdmin)
 *
 * The admin token stored in localStorage is a JWT_SECRET-signed token.
 * Passing it to the Vercel serverless `requireAdmin` causes a 400/401
 * because supabaseAdmin.auth.getUser() rejects non-Supabase tokens.
 *
 * Direct Supabase queries bypass this mismatch entirely.
 * The anon key is safe here because Supabase RLS policies control access.
 * For admin writes (insert/update/delete) we still go through the Express
 * backend which uses the correct JWT_SECRET middleware.
 */

import { supabase } from './supabase';

// ── Products ──────────────────────────────────────────────────────────────────

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  discount: number;
  category: string;
  image: string;
  stock: number;
  trending: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
  sizes: string[] | null;
  colors: string[] | null;
  created_at: string;
  // computed by normalizer
  originalPrice?: number | null;
  final_price?: number;
}

export interface AdminVariant {
  id: string;
  product_id: string;
  variant_type: string;   // 'color' | 'type' | 'size'
  variant_value: string;
  image_url: string | null;
  created_at: string;
}

/**
 * Fetch ALL products from Supabase directly.
 * No limit — returns up to 1000 rows (Supabase default max per request).
 * For catalogues > 1000 products, add pagination here.
 */
export async function fetchAllProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .range(0, 999);   // explicit range — never rely on implicit limits

  if (error) {
    console.error('[adminSupabase] fetchAllProducts error:', error.message);
    throw new Error(error.message || 'Failed to fetch products');
  }

  return (data ?? []).map(normalizeProduct);
}

/**
 * Fetch ALL product_variants from Supabase directly.
 * Returns every row — the caller groups them by product_id.
 */
export async function fetchAllVariants(): Promise<AdminVariant[]> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .order('product_id')
    .order('variant_type')
    .order('variant_value');

  if (error) {
    console.error('[adminSupabase] fetchAllVariants error:', error.message);
    // Non-fatal: if the table doesn't exist yet, return empty array
    if (error.code === '42P01') {
      console.warn('[adminSupabase] product_variants table not found — run PRODUCT_VARIANTS_SCHEMA.sql');
      return [];
    }
    throw new Error(error.message || 'Failed to fetch variants');
  }

  return data ?? [];
}

/**
 * Fetch variants for a single product.
 * Used by useProductVariants hook and ProductModal.
 */
export async function fetchVariantsByProduct(productId: string): Promise<AdminVariant[]> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('variant_type')
    .order('variant_value');

  if (error) {
    if (error.code === '42P01') return [];
    throw new Error(error.message || 'Failed to fetch variants');
  }

  return data ?? [];
}

// ── Variant writes — direct Supabase (requires active Supabase session) ───────
// These work because AdminLogin now calls supabase.auth.signInWithPassword()
// which creates a real browser session. auth.uid() is non-null, so RLS passes.

/**
 * Insert a new variant row.
 * Requires: admin Supabase session active (auth.uid() must match an admin profile).
 */
export async function insertVariant(
  productId: string,
  variantType: string,
  variantValue: string,
): Promise<AdminVariant> {
  const { data, error } = await supabase
    .from('product_variants')
    .insert([{
      product_id:    productId,
      variant_type:  variantType.trim(),
      variant_value: variantValue.trim(),
    }])
    .select()
    .single();

  if (error) throw new Error(error.message || 'Failed to create variant');
  return data as AdminVariant;
}

/**
 * Update a variant row (typically to set image_url after a Storage upload).
 */
export async function updateVariant(
  variantId: string,
  productId: string,
  updates: Partial<Pick<AdminVariant, 'image_url' | 'variant_type' | 'variant_value'>>,
): Promise<AdminVariant> {
  const { data, error } = await supabase
    .from('product_variants')
    .update(updates)
    .eq('id', variantId)
    .eq('product_id', productId)   // extra safety: scope to this product
    .select()
    .single();

  if (error) throw new Error(error.message || 'Failed to update variant');
  if (!data)  throw new Error('Variant not found');
  return data as AdminVariant;
}

/**
 * Delete a variant row.
 */
export async function deleteVariantById(variantId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', variantId)
    .eq('product_id', productId);

  if (error) throw new Error(error.message || 'Failed to delete variant');
}

// ── Normalizer ────────────────────────────────────────────────────────────────

function normalizeProduct(row: any): AdminProduct {
  const discount = Number(row.discount ?? 0);
  const price    = Number(row.price    ?? 0);
  return {
    ...row,
    price,
    discount,
    original_price: row.original_price ?? null,
    originalPrice:  row.original_price ?? null,
    trending:       Boolean(row.trending ?? row.featured),
    image:          row.image || row.image_url || '',
    stock:          Number(row.stock ?? 0),
    rating:         Number(row.rating ?? 4.5),
    reviews:        Number(row.reviews ?? 0),
    // Computed final price (mirrors the DB generated column)
    final_price: discount > 0 ? Math.round(price * (1 - discount / 100)) : price,
  };
}
