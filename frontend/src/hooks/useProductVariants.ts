/**
 * useProductVariants
 *
 * Fetches and manages product_variants for a given product id.
 *
 * ALL operations now use direct Supabase queries.
 *
 * This works because AdminLogin.tsx calls supabase.auth.signInWithPassword()
 * which creates a real browser session. auth.uid() is non-null, so Supabase
 * RLS policies evaluate correctly and writes are permitted for admin users.
 *
 * Used by:
 *   • ProductModal          — read-only color/type/size display
 *   • ProductVariantsPanel  — full CRUD + image upload (admin)
 */
import { useCallback, useEffect, useState } from 'react';
import { uploadImageToSupabase } from '../lib/storage';
import {
  fetchVariantsByProduct,
  insertVariant,
  updateVariant,
  deleteVariantById,
} from '../lib/adminSupabase';
import { checkAdminAuthAsync, classifyAdminError } from '../lib/checkAdminAuth';

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: string;   // 'color' | 'type' | 'size'
  variant_value: string;  // 'Black' | 'Oversized' | 'XL'
  image_url: string | null;
  created_at: string;
}

interface UseProductVariantsReturn {
  variants: ProductVariant[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  addVariant: (type: string, value: string) => Promise<ProductVariant | null>;
  uploadVariantImage: (variantId: string, file: File) => Promise<string | null>;
  deleteVariant: (variantId: string) => Promise<void>;
}

export function useProductVariants(productId: string | null): UseProductVariantsReturn {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // ── READ ──────────────────────────────────────────────────────────────────
  const reload = useCallback(async () => {
    if (!productId) { setVariants([]); return; }
    setLoading(true);
    setError('');
    try {
      const list = await fetchVariantsByProduct(productId);
      setVariants(list as ProductVariant[]);
    } catch (err) {
      setError(classifyAdminError(err, 'Failed to load variants'));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { void reload(); }, [reload]);

  // ── WRITE — all guarded by checkAdminAuth() ───────────────────────────────

  /**
   * Create a new variant row via direct Supabase insert.
   * Requires an active admin Supabase session (auth.uid() must be an admin).
   */
  const addVariant = useCallback(async (
    type: string,
    value: string,
  ): Promise<ProductVariant | null> => {
    if (!productId) return null;

    const authError = await checkAdminAuthAsync();
    if (authError) { setError(authError); return null; }

    setError('');
    try {
      const v = await insertVariant(productId, type, value);
      setVariants(prev => [...prev, v as ProductVariant]);
      return v as ProductVariant;
    } catch (err) {
      setError(classifyAdminError(err, 'Failed to add variant'));
      return null;
    }
  }, [productId]);

  /**
   * Upload an image for a variant and persist the public URL in the DB.
   *
   * Storage path: products/{productId}/{timestamp}-{random}.{ext}
   * Never stores a blob: URL — only the permanent Supabase public URL.
   */
  const uploadVariantImage = useCallback(async (
    variantId: string,
    file: File,
  ): Promise<string | null> => {
    if (!productId) return null;

    const authError = await checkAdminAuthAsync();
    if (authError) { setError(authError); return null; }

    setError('');
    try {
      const folder = `products/${productId}`;
      const { publicUrl } = await uploadImageToSupabase(file, folder);

      // Persist the public URL via direct Supabase update
      await updateVariant(variantId, productId, { image_url: publicUrl });

      // Optimistic local update
      setVariants(prev =>
        prev.map(v => v.id === variantId ? { ...v, image_url: publicUrl } : v),
      );

      return publicUrl;
    } catch (err) {
      setError(classifyAdminError(err, 'Image upload failed'));
      return null;
    }
  }, [productId]);

  /**
   * Delete a variant row via direct Supabase delete.
   */
  const deleteVariant = useCallback(async (variantId: string): Promise<void> => {
    if (!productId) return;

    const authError = await checkAdminAuthAsync();
    if (authError) { setError(authError); return; }

    setError('');
    try {
      await deleteVariantById(variantId, productId);
      setVariants(prev => prev.filter(v => v.id !== variantId));
    } catch (err) {
      setError(classifyAdminError(err, 'Failed to delete variant'));
    }
  }, [productId]);

  return { variants, loading, error, reload, addVariant, uploadVariantImage, deleteVariant };
}
