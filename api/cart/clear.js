const { supabaseAdmin } = require('../../lib/supabase');
const { requireAuth } = require('../../lib/auth');
const { sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const { userContext } = await requireAuth(req);
    const { data: clearedCart, error } = await supabaseAdmin
      .from('carts')
      .update({ items: [], total: 0, updated_at: new Date() })
      .eq('user_id', userContext.id)
      .select()
      .single();

    if (error) throw error;
    return sendJson(res, 200, clearedCart);
  } catch (err) {
    console.error('[Cart] clear error:', err);
    return handleApiError(res, err, 'Failed to clear cart');
  }
};

