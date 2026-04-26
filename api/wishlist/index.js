const { supabaseAdmin } = require('../../lib/supabase');
const { requireAuth } = require('../../lib/auth');
const { sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
    const { userContext } = await requireAuth(req);

    const { data, error } = await supabaseAdmin
      .from('wishlists')
      .select('*')
      .eq('user_id', userContext.id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      const { data: newWishlist, error: insertError } = await supabaseAdmin
        .from('wishlists')
        .insert([{ user_id: userContext.id, items: [] }])
        .select()
        .single();
      if (insertError) throw insertError;
      return sendJson(res, 200, newWishlist);
    }

    return sendJson(res, 200, data);
  } catch (err) {
    console.error('[Wishlist] fetch error:', err);
    return handleApiError(res, err, 'Failed to fetch wishlist');
  }
};

