const express = require('express');
const { supabase } = require('../lib/supabase');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    console.log('ORDER REQUEST BODY:', req.body);

    const {
      user_id,
      email,
      total_amount,
      payment_id,
      items,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items must be an array' });
    }

    if (!total_amount || !payment_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const normalizedTotalAmount = Number(total_amount);
    if (!Number.isFinite(normalizedTotalAmount) || normalizedTotalAmount <= 0) {
      return res.status(400).json({ error: 'total_amount must be a valid number' });
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          user_id,
          email,
          total_amount: normalizedTotalAmount,
          payment_id,
          items,
        },
      ])
      .select();

    if (error) {
      console.error('SUPABASE INSERT ERROR:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      success: true,
      order: Array.isArray(data) ? data[0] : data,
    });
  } catch (err) {
    console.error('Order persistence failed:', err);
    return res.status(500).json({ error: err.message || 'Failed to save order' });
  }
});

module.exports = router;
