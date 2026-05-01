/**
 * GET  /api/products/:id/variants  — list all variants for a product
 * POST /api/products/:id/variants  — create a new variant (admin only)
 */
const { supabase } = require('../../../../lib/supabase');
const { requireAdmin } = require('../../../../lib/auth');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../../../lib/http');

module.exports = async function handler(req, res) {
  const productId = req?.query?.id;
  if (!productId) throw new HttpError(400, 'Product id is required');

  try {
    // ── GET — public, no auth needed ──────────────────────────────────────
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('variant_type')
        .order('variant_value');

      if (error) throw error;
      return sendJson(res, 200, { variants: data || [] });
    }

    // ── POST — admin only ─────────────────────────────────────────────────
    if (req.method === 'POST') {
      await requireAdmin(req);
      const body = getBody(req);

      const variantType  = typeof body.variant_type  === 'string' ? body.variant_type.trim()  : '';
      const variantValue = typeof body.variant_value === 'string' ? body.variant_value.trim() : '';
      const imageUrl     = typeof body.image_url     === 'string' ? body.image_url.trim()     : null;

      if (!variantType)  throw new HttpError(400, 'variant_type is required');
      if (!variantValue) throw new HttpError(400, 'variant_value is required');

      const { data, error } = await supabase
        .from('product_variants')
        .insert([{ product_id: productId, variant_type: variantType, variant_value: variantValue, image_url: imageUrl }])
        .select()
        .single();

      if (error) throw error;
      return sendJson(res, 201, { variant: data });
    }

    return methodNotAllowed(res, ['GET', 'POST']);
  } catch (err) {
    console.error('[Variants] error:', err);
    return handleApiError(res, err, 'Server error');
  }
};
