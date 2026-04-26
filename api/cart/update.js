const { supabaseAdmin } = require('../../lib/supabase');
const { requireAuth } = require('../../lib/auth');
const { getBody, sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const { userContext } = await requireAuth(req);
    const body = getBody(req);
    const { productId, quantity } = body;

    const { data: cart, error: fetchError } = await supabaseAdmin
      .from('carts')
      .select('*')
      .eq('user_id', userContext.id)
      .single();
    if (fetchError) throw fetchError;
    if (!cart) return sendJson(res, 404, { message: 'Cart not found' });

    const items = Array.isArray(cart.items) ? [...cart.items] : [];
    const item = items.find((i) => i.productId === productId);
    if (item) item.quantity = Math.max(1, quantity);

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const { data: updatedCart, error: updateError } = await supabaseAdmin
      .from('carts')
      .update({ items, total, updated_at: new Date() })
      .eq('user_id', userContext.id)
      .select()
      .single();
    if (updateError) throw updateError;

    return sendJson(res, 200, updatedCart);
  } catch (err) {
    console.error('[Cart] update error:', err);
    return handleApiError(res, err, 'Failed to update cart');
  }
};

