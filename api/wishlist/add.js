const { supabaseAdmin } = require('../../lib/supabase');
const { requireAuth } = require('../../lib/auth');
const { getBody, sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const { userContext } = await requireAuth(req);
    const body = getBody(req);
    const { productId, name, price, image, category } = body;

    let { data: wishlist, error: fetchError } = await supabaseAdmin
      .from('wishlists')
      .select('*')
      .eq('user_id', userContext.id)
      .single();
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (!wishlist) {
      const { data: newWishlist, error: createError } = await supabaseAdmin
        .from('wishlists')
        .insert([{ user_id: userContext.id, items: [] }])
        .select()
        .single();
      if (createError) throw createError;
      wishlist = newWishlist;
    }

    const items = Array.isArray(wishlist.items) ? [...wishlist.items] : [];
    const exists = items.some((item) => item.productId === productId);
    if (!exists) items.push({ productId, name, price, image, category });

    const { data: updatedWishlist, error: updateError } = await supabaseAdmin
      .from('wishlists')
      .update({ items, updated_at: new Date() })
      .eq('user_id', userContext.id)
      .select()
      .single();
    if (updateError) throw updateError;

    return sendJson(res, 200, updatedWishlist);
  } catch (err) {
    console.error('[Wishlist] add error:', err);
    return handleApiError(res, err, 'Failed to add to wishlist');
  }
};

