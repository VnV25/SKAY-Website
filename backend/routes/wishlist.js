const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { requireAuth } = require('../middleware/auth');

// Get user's wishlist
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Create empty wishlist if doesn't exist
    if (!data) {
      const { data: newWishlist, error: insertError } = await supabase
        .from('wishlists')
        .insert([{ user_id: userId, items: [] }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      return res.json(newWishlist);
    }

    res.json(data);
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
  }
});

// Add item to wishlist
router.post('/add', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, name, price, image, category } = req.body;
    
    // Get current wishlist
    let { data: wishlist, error: fetchError } = await supabase
      .from('wishlists')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Create wishlist if doesn't exist
    if (!wishlist) {
      const { data: newWishlist, error: createError } = await supabase
        .from('wishlists')
        .insert([{ user_id: userId, items: [] }])
        .select()
        .single();
      
      if (createError) throw createError;
      wishlist = newWishlist;
    }

    // Check if item already exists
    let items = wishlist.items || [];
    if (items.find(item => item.productId === productId)) {
      return res.status(400).json({ message: 'Item already in wishlist' });
    }

    // Add item
    items.push({
      productId,
      name,
      price,
      image,
      category,
      addedAt: new Date(),
    });

    // Update wishlist
    const { data: updatedWishlist, error: updateError } = await supabase
      .from('wishlists')
      .update({ items, updated_at: new Date() })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    res.json(updatedWishlist);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Failed to add to wishlist', error: error.message });
  }
});

// Remove item from wishlist
router.post('/remove', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    
    const { data: wishlist, error: fetchError } = await supabase
      .from('wishlists')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    // Remove item
    let items = wishlist.items || [];
    items = items.filter(item => item.productId !== productId);

    // Update wishlist
    const { data: updatedWishlist, error: updateError } = await supabase
      .from('wishlists')
      .update({ items, updated_at: new Date() })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    res.json(updatedWishlist);
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Failed to remove from wishlist', error: error.message });
  }
});

// Clear wishlist
router.post('/clear', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: clearedWishlist, error } = await supabase
      .from('wishlists')
      .update({ items: [], updated_at: new Date() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(clearedWishlist);
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ message: 'Failed to clear wishlist', error: error.message });
  }
});

module.exports = router;
