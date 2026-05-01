/**
 * GET /api/products/variants/all
 * Admin only — returns every row in product_variants in one query.
 * Used by the admin dashboard to pre-load all variant data without
 * making N individual requests (one per product).
 */
const { supabase } = require('../../../lib/supabase');
const { requireAdmin } = require('../../../lib/auth');
const { sendJson, methodNotAllowed, handleApiError } = require('../../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
    await requireAdmin(req);

    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .order('product_id')
      .order('variant_type')
      .order('variant_value');

    if (error) throw error;

    return sendJson(res, 200, { variants: data || [] });
  } catch (err) {
    console.error('[Variants] GET all error:', err);
    return handleApiError(res, err, 'Failed to fetch all variants');
  }
};
