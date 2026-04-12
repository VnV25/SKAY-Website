const express = require('express');
const { supabase } = require('../lib/supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/orders (user's own orders) ───────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
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
      `)
      .eq('user_id', userId)
      .order('order_date', { ascending: false });

    if (error) throw error;

    // Transform the data to match expected format
    const transformedOrders = orders?.map(order => ({
      ...order,
      items: order.order_items?.map(item => ({
        id: item.product_id,
        name: item.products?.name || 'Product',
        price: item.price,
        quantity: item.quantity,
        image: item.products?.image,
      })) || [],
    })) || [];

    res.json({ orders: transformedOrders });
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/orders ──────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { items, total, shippingAddress, paymentMethod, orderNotes, guestName, guestEmail, guestPhone } = req.body;

    if (!items?.length) return res.status(400).json({ message: 'Order must have items' });
    if (!total) return res.status(400).json({ message: 'total is required' });

    const orderData = {
      total,
      status: 'pending',
    };

    // Attach user if authenticated
    if (req.user && req.user.id) {
      orderData.user_id = req.user.id;
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;

    // Insert order items into separate table
    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id || item.id,
        quantity: item.quantity || 1,
        price: item.price || 0,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error inserting order items:', itemsError);
        // Don't fail the order creation, just log the error
      }
    }

    res.status(201).json({ order });
  } catch (err) {
    console.error('[Orders] create error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// ── GET /api/orders/:id ───────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
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
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Transform the data to match expected format
    const transformedOrder = {
      ...order,
      items: order.order_items?.map(item => ({
        id: item.product_id,
        name: item.products?.name || 'Product',
        price: item.price,
        quantity: item.quantity,
        image: item.products?.image,
      })) || [],
    };

    res.json({ order: transformedOrder });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PUT /api/orders/:id (admin) ───────────────────────────
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;