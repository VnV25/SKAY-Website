import { supabase } from './supabase';

// Bucket name must match exactly what you created in Supabase Storage.
// Set VITE_SUPABASE_STORAGE_BUCKET in your .env file.
const BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'product-images';

/**
 * Upload a file to Supabase Storage and return its permanent public URL.
 *
 * @param file   - The File object from an <input type="file"> element.
 * @param folder - Sub-folder inside the bucket (default: 'products').
 * @returns      - { bucket, path, publicUrl }
 *
 * Prerequisites in Supabase:
 *   1. Create a bucket named "product-images" (Storage → New bucket).
 *   2. Set the bucket to PUBLIC (toggle "Public bucket" on).
 *   3. Add an INSERT policy so authenticated users (or anon) can upload.
 */
export async function uploadImageToSupabase(
  file: File,
  folder = 'products'
): Promise<{ bucket: string; path: string; publicUrl: string }> {
  // ── Validate inputs ────────────────────────────────────────────────────────
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file provided for upload');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error(`File must be an image. Received: ${file.type}`);
  }

  // ── Build a unique, safe file path ────────────────────────────────────────
  // Format: products/1714000000000-abc123.jpg
  const ext      = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path     = `${folder}/${safeName}`;

  console.log(`[Storage] Uploading to bucket="${BUCKET}" path="${path}" type="${file.type}"`);

  // ── Upload ─────────────────────────────────────────────────────────────────
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType:  file.type,   // explicit MIME type — required for correct serving
      cacheControl: '3600',
      upsert:       false,       // never silently overwrite
    });

  if (uploadError) {
    console.error('[Storage] Upload failed:', uploadError);

    // Surface the most common misconfiguration errors clearly
    if (uploadError.message?.includes('Bucket not found')) {
      throw new Error(
        `Storage bucket "${BUCKET}" not found. ` +
        `Create it in Supabase → Storage → New bucket, set it to Public, ` +
        `and make sure VITE_SUPABASE_STORAGE_BUCKET="${BUCKET}" in your .env file.`
      );
    }

    if (uploadError.message?.includes('not allowed') || uploadError.message?.includes('policy')) {
      throw new Error(
        `Upload blocked by storage policy. ` +
        `In Supabase → Storage → Policies, add an INSERT policy for the "${BUCKET}" bucket.`
      );
    }

    throw new Error(uploadError.message || 'Failed to upload image to Supabase Storage');
  }

  // ── Get public URL (synchronous — no network call needed) ─────────────────
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error(
      `Upload succeeded but no public URL was returned for path "${path}". ` +
      `Make sure the "${BUCKET}" bucket is set to Public in Supabase Storage.`
    );
  }

  // Sanity check: never return a blob: URL
  if (data.publicUrl.startsWith('blob:')) {
    throw new Error('Received a blob URL instead of a Supabase public URL. Check bucket configuration.');
  }

  console.log(`[Storage] Upload successful. Public URL: ${data.publicUrl}`);

  return {
    bucket:    BUCKET,
    path,
    publicUrl: data.publicUrl,
  };
}
