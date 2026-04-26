const { supabaseAdmin } = require('../../lib/supabase');
const { requireAuth } = require('../../lib/auth');
const { getBody, sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const { userContext } = await requireAuth(req);
    const body = getBody(req);
    const { productId } = body;

    const { data: wishlist, error: fetchError } = await supabaseAdmin
      .from('wishlists')
      .select('*')
      .eq('user_id', userContext.id)
      .single();
    if (fetchError) throw fetchError;
    if (!wishlist) return sendJson(res, 404, { message: 'Wishlist not found' });

    const items = (wishlist.items || []).filter((item) => item.productId !== productId);

    const { data: updatedWishlist, error: updateError } = await supabaseAdmin
      .from('wishlists')
      .update({ items, updated_at: new Date() })
      .eq('user_id', userContext.id)
      .select()
      .single();
    if (updateError) throw updateError;

    return sendJson(res, 200, updatedWishlist);
  } catch (err) {
    console.error('[Wishlist] remove error:', err);
    return handleApiError(res, err, 'Failed to remove from wishlist');
  }
};

