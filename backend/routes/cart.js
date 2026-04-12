const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

// Get user's cart
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Create empty cart if doesn't exist
    if (!data) {
      const { data: newCart, error: insertError } = await supabase
        .from('carts')
        .insert([{ user_id: userId, items: [], total: 0 }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      return res.json(newCart);
    }

    res.json(data);
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
});

// Add item to cart
router.post('/add', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, name, price, quantity, image, category } = req.body;
    
    // Get current cart
    let { data: cart, error: fetchError } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Create cart if doesn't exist
    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert([{ user_id: userId, items: [], total: 0 }])
        .select()
        .single();
      
      if (createError) throw createError;
      cart = newCart;
    }

    // Add or update item
    let items = cart.items || [];
    const existingItemIndex = items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      items[existingItemIndex].quantity += quantity || 1;
    } else {
      items.push({
        productId,
        name,
        price,
        quantity: quantity || 1,
        image,
        category,
      });
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Update cart
    const { data: updatedCart, error: updateError } = await supabase
      .from('carts')
      .update({ items, total, updated_at: new Date() })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    res.json(updatedCart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Failed to add to cart', error: error.message });
  }
});

// Remove item from cart
router.post('/remove', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    
    const { data: cart, error: fetchError } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // Remove item
    let items = cart.items || [];
    items = items.filter(item => item.productId !== productId);
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Update cart
    const { data: updatedCart, error: updateError } = await supabase
      .from('carts')
      .update({ items, total, updated_at: new Date() })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    res.json(updatedCart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Failed to remove from cart', error: error.message });
  }
});

// Update cart item quantity
router.post('/update', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    
    const { data: cart, error: fetchError } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // Update quantity
    let items = cart.items || [];
    const item = items.find(item => item.productId === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
    }

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Update cart
    const { data: updatedCart, error: updateError } = await supabase
      .from('carts')
      .update({ items, total, updated_at: new Date() })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    res.json(updatedCart);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Failed to update cart', error: error.message });
  }
});

// Clear cart
router.post('/clear', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: clearedCart, error } = await supabase
      .from('carts')
      .update({ items: [], total: 0, updated_at: new Date() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(clearedCart);
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
});

module.exports = router;
