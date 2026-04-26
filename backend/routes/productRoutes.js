const express = require('express');
const { getAllProducts, createProduct } = require('../controllers/productController');
const { supabase } = require('../lib/supabase');

const router = express.Router();

// ================= GET ALL PRODUCTS =================
router.get('/', getAllProducts);

// ================= CREATE PRODUCT =================
router.post('/', createProduct);

// ================= UPDATE PRODUCT =================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .update(req.body)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});

// ================= DELETE PRODUCT =================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});

module.exports = router;