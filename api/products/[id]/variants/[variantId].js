/**
 * PUT    /api/products/:id/variants/:variantId  — update variant (image_url, etc.)
 * DELETE /api/products/:id/variants/:variantId  — delete variant
 */
const { supabase } = require('../../../../lib/supabase');
const { requireAdmin } = require('../../../../lib/auth');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../../../lib/http');

module.exports = async function handler(req, res) {
  const productId = req?.query?.id;
  const variantId = req?.query?.variantId;

  if (!productId) throw new HttpError(400, 'Product id is required');
  if (!variantId) throw new HttpError(400, 'Variant id is required');

  try {
    // ── PUT — update variant fields ───────────────────────────────────────
    if (req.method === 'PUT') {
      await requireAdmin(req);
      const body = getBody(req);

      // Only allow safe fields to be updated
      const updates: Record<string, any> = {};
      if (typeof body.image_url     === 'string') updates.image_url     = body.image_url.trim() || null;
      if (typeof body.variant_type  === 'string') updates.variant_type  = body.variant_type.trim();
      if (typeof body.variant_value === 'string') updates.variant_value = body.variant_value.trim();

      if (Object.keys(updates).length === 0) {
        throw new HttpError(400, 'No valid fields to update');
      }

      const { data, error } = await supabase
        .from('product_variants')
        .update(updates)
        .eq('id', variantId)
        .eq('product_id', productId)   // extra safety: scope to this product
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new HttpError(404, 'Variant not found');
      return sendJson(res, 200, { variant: data });
    }

    // ── DELETE ────────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      await requireAdmin(req);

      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId)
        .eq('product_id', productId);

      if (error) throw error;
      return sendJson(res, 200, { message: 'Variant deleted' });
    }

    return methodNotAllowed(res, ['PUT', 'DELETE']);
  } catch (err) {
    console.error('[Variants] id error:', err);
    return handleApiError(res, err, 'Server error');
  }
};
