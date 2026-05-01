const express = require('express');
const { supabase } = require('../lib/supabase');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/orders - Create new order
router.post('/', auth, async (req, res) => {
  try {
    console.log('[Orders POST] REQUEST BODY:', req.body);

    const {
      user_id,
      email,
      total_amount,
      payment_id,
      items,
    } = req.body;

    // ===== VALIDATION =====
    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'user_id is required and must be a string' 
      });
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'email is required and must be a valid email' 
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'items must be a non-empty array' 
      });
    }

    if (!payment_id || typeof payment_id !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'payment_id is required and must be a string' 
      });
    }

    const normalizedTotalAmount = Number(total_amount);
    if (!Number.isFinite(normalizedTotalAmount) || normalizedTotalAmount <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'total_amount must be a positive number' 
      });
    }

    // ===== INSERT INTO DATABASE =====
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          user_id,
          email,
          total_amount: normalizedTotalAmount,
          payment_id,
          items: Array.isArray(items) ? items : [],
          status: 'paid', // Payment already successful
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('[Orders POST] SUPABASE INSERT ERROR:', error);
      return res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to insert order into database'
      });
    }

    if (!data || data.length === 0) {
      console.error('[Orders POST] No data returned from insert');
      return res.status(500).json({ 
        success: false,
        error: 'Order was not created properly'
      });
    }

    const savedOrder = Array.isArray(data) ? data[0] : data;

    console.log('[Orders POST] Successfully created order:', savedOrder.id);
    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: savedOrder,
    });

  } catch (err) {
    console.error('[Orders POST] Unexpected error:', err);
    return res.status(500).json({ 
      success: false,
      error: err?.message || 'Internal server error while saving order'
    });
  }
});

// GET /api/orders - Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized'
      });
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Orders GET] SUPABASE ERROR:', error);
      return res.status(500).json({ 
        success: false,
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      orders: Array.isArray(data) ? data : [],
    });

  } catch (err) {
    console.error('[Orders GET] Unexpected error:', err);
    return res.status(500).json({ 
      success: false,
      error: err?.message || 'Internal server error'
    });
  }
});

module.exports = router;
