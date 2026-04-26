const { supabaseAdmin } = require('../../lib/supabase');
const { requireAuth } = require('../../lib/auth');
const { getBody, sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  try {
    const { userContext } = await requireAuth(req);
    const body = getBody(req);
    const { productId } = body;

    const { data: cart, error: fetchError } = await supabaseAdmin
      .from('carts')
      .select('*')
      .eq('user_id', userContext.id)
      .single();
    if (fetchError) throw fetchError;
    if (!cart) return sendJson(res, 404, { message: 'Cart not found' });

    const items = (cart.items || []).filter((item) => item.productId !== productId);
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
    console.error('[Cart] remove error:', err);
    return handleApiError(res, err, 'Failed to remove from cart');
  }
};

