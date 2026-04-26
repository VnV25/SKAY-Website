const { supabaseAdmin } = require('../../lib/supabase');
const { requireAuth } = require('../../lib/auth');
const { HttpError, getBody, sendJson, methodNotAllowed, handleApiError } = require('../../lib/http');

module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { userContext } = await requireAuth(req);

      const { data: orders, error } = await supabaseAdmin
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
        .eq('user_id', userContext.id)
        .order('order_date', { ascending: false });

      if (error) throw error;

      const transformedOrders =
        orders?.map((order) => ({
          ...order,
          items:
            order.order_items?.map((item) => ({
              id: item.product_id,
              name: item.products?.name || 'Product',
              price: item.price,
              quantity: item.quantity,
              image: item.products?.image,
            })) || [],
        })) || [];

      return sendJson(res, 200, { orders: transformedOrders });
    }

    if (req.method === 'POST') {
      const { userContext } = await requireAuth(req);
      const body = getBody(req);

      const items = body.items;
      const total = body.total;
      if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, 'Order must have items');
      if (total == null) throw new HttpError(400, 'total is required');

      const orderData = { total, status: 'pending', user_id: userContext.id };

      const { data: order, error } = await supabaseAdmin.from('orders').insert([orderData]).select().single();
      if (error) throw error;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id || item.id,
        quantity: item.quantity || 1,
        price: item.price || 0,
      }));

      if (orderItems.length) {
        const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItems);
        if (itemsError) console.error('[Orders] Error inserting order items:', itemsError);
      }

      return sendJson(res, 201, { order });
    }

    return methodNotAllowed(res, ['GET', 'POST']);
  } catch (err) {
    console.error('[Orders] error:', err);
    return handleApiError(res, err, 'Server error');
  }
};

