const { supabaseAdmin } = require('../../lib/supabase');
const { requireAuth } = require('../../lib/auth');
const { sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const { userContext } = await requireAuth(req);
    const { data: clearedWishlist, error } = await supabaseAdmin
      .from('wishlists')
      .update({ items: [], updated_at: new Date() })
      .eq('user_id', userContext.id)
      .select()
      .single();

    if (error) throw error;
    return sendJson(res, 200, clearedWishlist);
  } catch (err) {
    console.error('[Wishlist] clear error:', err);
    return handleApiError(res, err, 'Failed to clear wishlist');
  }
};

