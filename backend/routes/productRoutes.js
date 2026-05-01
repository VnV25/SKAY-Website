const express = require('express');
const {
  getAllProducts,
  getProductById,
  createProduct,
  normalizeProductForDb,
  normalizeProductForResponse,
} = require('../controllers/productController');
const { supabase, isSupabaseConfigured } = require('../lib/supabase');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// ── Products CRUD ─────────────────────────────────────────────────────────────
router.get('/', getAllProducts);

/**
 * GET /api/products/variants/all
 * Admin only — fetch ALL variants for ALL products in one query.
 * Must be defined before /:id to avoid "variants" being treated as an id.
 */
router.get('/variants/all', auth, async (req, res) => {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Supabase not configured' });
    }
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .order('product_id')
      .order('variant_type')
      .order('variant_value');

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.json({ success: true, variants: data || [] });
  } catch (err) {
    console.error('[Variants] GET all error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:id', getProductById);
router.post('/', createProduct);

router.put('/:id', async (req, res) => {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return res.status(500).json({
        success: false,
        message: 'Supabase is not properly configured',
      });
    }

    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .update(normalizeProductForDb(req.body))
      .eq('id', id)
      .select();

    if (error) {
      console.error('[Products] Update error:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return res.status(400).json({ success: false, message: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const normalized = normalizeProductForResponse(data[0]);
    return res.json({ success: true, product: normalized, data: [normalized] });
  } catch (err) {
    console.error('[Products] Update product error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while updating product' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return res.status(500).json({
        success: false,
        message: 'Supabase is not properly configured',
      });
    }

    const { id } = req.params;

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      console.error('[Products] Delete error:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('[Products] Delete product error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while deleting product' });
  }
});

// ── Product Variants ──────────────────────────────────────────────────────────

/**
 * GET /api/products/:id/variants
 * Public — returns all variants for a product.
 */
router.get('/:id/variants', async (req, res) => {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Supabase not configured' });
    }
    const { id } = req.params;
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
      .order('variant_type')
      .order('variant_value');

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.json({ success: true, variants: data || [] });
  } catch (err) {
    console.error('[Variants] GET error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/products/:id/variants
 * Admin only — create a new variant.
 * Body: { variant_type, variant_value, image_url? }
 */
router.post('/:id/variants', auth, async (req, res) => {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Supabase not configured' });
    }
    const { id } = req.params;
    const { variant_type, variant_value, image_url } = req.body || {};

    if (!variant_type || !variant_value) {
      return res.status(400).json({ success: false, message: 'variant_type and variant_value are required' });
    }

    const { data, error } = await supabase
      .from('product_variants')
      .insert([{ product_id: id, variant_type, variant_value, image_url: image_url || null }])
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(201).json({ success: true, variant: data });
  } catch (err) {
    console.error('[Variants] POST error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PUT /api/products/:id/variants/:variantId
 * Admin only — update a variant (typically to set image_url after upload).
 */
router.put('/:id/variants/:variantId', auth, async (req, res) => {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Supabase not configured' });
    }
    const { id, variantId } = req.params;
    const updates = {};

    if (typeof req.body.image_url     === 'string') updates.image_url     = req.body.image_url.trim() || null;
    if (typeof req.body.variant_type  === 'string') updates.variant_type  = req.body.variant_type.trim();
    if (typeof req.body.variant_value === 'string') updates.variant_value = req.body.variant_value.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    const { data, error } = await supabase
      .from('product_variants')
      .update(updates)
      .eq('id', variantId)
      .eq('product_id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    if (!data)  return res.status(404).json({ success: false, message: 'Variant not found' });
    return res.json({ success: true, variant: data });
  } catch (err) {
    console.error('[Variants] PUT error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * DELETE /api/products/:id/variants/:variantId
 * Admin only — delete a variant.
 */
router.delete('/:id/variants/:variantId', auth, async (req, res) => {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return res.status(500).json({ success: false, message: 'Supabase not configured' });
    }
    const { id, variantId } = req.params;
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variantId)
      .eq('product_id', id);

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.json({ success: true, message: 'Variant deleted' });
  } catch (err) {
    console.error('[Variants] DELETE error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
