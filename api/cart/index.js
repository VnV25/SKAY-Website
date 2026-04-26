const { supabaseAdmin } = require('../../lib/supabase');
const { requireAuth } = require('../../lib/auth');
const { sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
    const { userContext } = await requireAuth(req);

    const { data, error } = await supabaseAdmin.from('carts').select('*').eq('user_id', userContext.id).single();
    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      const { data: newCart, error: insertError } = await supabaseAdmin
        .from('carts')
        .insert([{ user_id: userContext.id, items: [], total: 0 }])
        .select()
        .single();
      if (insertError) throw insertError;
      return sendJson(res, 200, newCart);
    }

    return sendJson(res, 200, data);
  } catch (err) {
    console.error('[Cart] fetch error:', err);
    return handleApiError(res, err, 'Failed to fetch cart');
  }
};

