const { supabaseAdmin } = require('../../lib/supabase');
const { requireAuth } = require('../../lib/auth');
const { getBody, sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const { userContext } = await requireAuth(req);
    const body = getBody(req);
    const { productId, name, price, quantity, image, category } = body;

    let { data: cart, error: fetchError } = await supabaseAdmin
      .from('carts')
      .select('*')
      .eq('user_id', userContext.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (!cart) {
      const { data: newCart, error: createError } = await supabaseAdmin
        .from('carts')
        .insert([{ user_id: userContext.id, items: [], total: 0 }])
        .select()
        .single();
      if (createError) throw createError;
      cart = newCart;
    }

    const items = Array.isArray(cart.items) ? [...cart.items] : [];
    const existingItemIndex = items.findIndex((item) => item.productId === productId);
    if (existingItemIndex >= 0) {
      items[existingItemIndex].quantity += quantity || 1;
    } else {
      items.push({ productId, name, price, quantity: quantity || 1, image, category });
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const { data: updatedCart, error: updateError } = await supabaseAdmin
      .from('carts')
      .update({ items, total, updated_at: new Date() })
      .eq('user_id', userContext.id)
      .select()
      .single();

    if (updateError) throw updateError;
    return sendJson(res, 200, updatedCart);
  } catch (err) {
    console.error('[Cart] add error:', err);
    return handleApiError(res, err, 'Failed to add to cart');
  }
};

