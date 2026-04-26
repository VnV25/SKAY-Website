const { supabaseAdmin } = require('../../lib/supabase');
const { requireAuth, requireAdmin } = require('../../lib/auth');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  try {
    const id = req?.query?.id;
    if (!id) throw new HttpError(400, 'Order id is required');

    if (req.method === 'GET') {
      const { userContext } = await requireAuth(req);

      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select(
          `
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            products (
              name,
              image
            )
          )
        `,
        )
        .eq('id', id)
        .eq('user_id', userContext.id)
        .single();

      if (error) throw error;
      if (!order) throw new HttpError(404, 'Order not found');

      const transformedOrder = {
        ...order,
        items:
          order.order_items?.map((item) => ({
            id: item.product_id,
            name: item.products?.name || 'Product',
            price: item.price,
            quantity: item.quantity,
            image: item.products?.image,
          })) || [],
      };

      return sendJson(res, 200, { order: transformedOrder });
    }

    if (req.method === 'PUT') {
      await requireAdmin(req);
      const body = getBody(req);
      const status = body.status;
      if (!status) throw new HttpError(400, 'status is required');

      const { data: order, error } = await supabaseAdmin
        .from('orders')
        .update({ status, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!order) throw new HttpError(404, 'Order not found');
      return sendJson(res, 200, { order });
    }

    return methodNotAllowed(res, ['GET', 'PUT']);
  } catch (err) {
    console.error('[Orders] id error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

