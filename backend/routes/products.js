const express = require('express');
const db = require('../lib/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/products ─────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, featured, trending, search, page = 1, limit = 50 } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { products, total } = await db.getAllProducts({
      category,
      featured: featured === 'true',
      trending: trending === 'true',
      search,
      limit: parseInt(limit),
      offset
    });

    res.json({
      products,
      pagination: {
        currentPage:   parseInt(page),
        totalPages:    Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext:       parseInt(page) * parseInt(limit) < total,
        hasPrev:       parseInt(page) > 1,
      },
    });
  } catch (err) {
    console.error('[Products] list error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/products/:id ─────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    console.error('[Products] get by id error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/products (admin) ────────────────────────────
router.post('/', requireAdmin, async (req, res) => {
  try {
    const product = await db.createProduct(req.body);
    res.status(201).json({ product });
  } catch (err) {
    console.error('[Products] create error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// ── PUT /api/products/:id (admin) ─────────────────────────
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const product = await db.updateProduct(req.params.id, req.body);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    console.error('[Products] update error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// ── DELETE /api/products/:id (admin) ──────────────────────
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const success = await db.deleteProduct(req.params.id);
    if (!success) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('[Products] delete error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;