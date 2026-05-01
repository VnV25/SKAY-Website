const { supabase, isSupabaseConfigured } = require('../lib/supabase');

const sampleProducts = [
  {
    name: 'Premium Oversized T-Shirt',
    category: 'apparel',
    price: 499,
    original_price: 699,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
    featured: true,
    description: 'Comfort-fit oversized tee with high-quality print.',
  },
  {
    name: 'Custom Coffee Mug',
    category: 'gifts',
    price: 249,
    original_price: 349,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800',
    featured: false,
    description: 'Ceramic mug with vibrant long-lasting custom print.',
  },
];

const normalizeProductForDb = (payload = {}) => {
  const normalized = {
    name: payload.name,
    description: payload.description || '',
    price: Number(payload.price || 0),
    original_price: payload.originalPrice ?? payload.original_price ?? null,
    category: payload.category || 'apparel',
    image: payload.image || payload.image_url || '',
    stock: Number(payload.stock || 0),
    featured: Boolean(payload.featured ?? payload.trending),
  };

  if (Array.isArray(payload.sizes)) normalized.sizes = payload.sizes;
  if (Array.isArray(payload.colors)) normalized.colors = payload.colors;
  if (payload.variants && typeof payload.variants === 'object') normalized.variants = payload.variants;
  if (payload.discount !== undefined) normalized.discount = Number(payload.discount || 0);
  if (payload.rating !== undefined) normalized.rating = Number(payload.rating || 0);
  if (payload.reviews !== undefined) normalized.reviews = Number(payload.reviews || 0);

  return normalized;
};

const normalizeProductForResponse = (product = {}) => ({
  ...product,
  originalPrice: product.original_price ?? product.originalPrice ?? null,
  trending:      Boolean(product.trending ?? product.featured),
  image:         product.image || product.image_url || '',
  // Expose discount as a top-level field (stored as `discount` in DB)
  discount:      Number(product.discount || 0) || undefined,
});

const getAllProducts = async (req, res) => {
  try {
    if (!isSupabaseConfigured) {
      return res.status(500).json({
        success: false,
        message: 'Supabase environment variables are missing on the server',
        products: [],
        data: [],
      });
    }

    const { category, featured, search, page = 1, limit = 50, withVariants } = req.query;
    const pageNumber  = Math.max(1, parseInt(page,  10) || 1);
    // Allow up to 1000 for admin; default 50 for public
    const limitNumber = Math.min(1000, Math.max(1, parseInt(limit, 10) || 50));
    const offset      = (pageNumber - 1) * limitNumber;

    let query = supabase.from('products').select('*', { count: 'exact' });

    if (category && category !== 'all') query = query.eq('category', category);
    if (featured === 'true') query = query.eq('featured', true);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data: products, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNumber - 1);

    if (error) {
      console.error('Products fetch error:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
        products: [],
        data: [],
      });
    }

    let resultProducts = Array.isArray(products) ? products.map(normalizeProductForResponse) : [];

    // Auto-seed only when DB is empty and no filters are applied
    const shouldAutoSeed = !category && !search && resultProducts.length === 0;
    if (shouldAutoSeed) {
      const { data: seededData, error: seedError } = await supabase
        .from('products')
        .insert(sampleProducts)
        .select('*');

      if (!seedError && Array.isArray(seededData)) {
        resultProducts = seededData.map(normalizeProductForResponse);
      } else if (seedError) {
        console.error('Sample seed failed:', seedError);
      }
    }

    // Optionally embed variants (used by admin listAll)
    if (withVariants === 'true' && resultProducts.length > 0) {
      const productIds = resultProducts.map(p => p.id);
      const { data: allVariants, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .in('product_id', productIds)
        .order('variant_type')
        .order('variant_value');

      if (!variantsError && Array.isArray(allVariants)) {
        // Group variants by product_id
        const variantMap = {};
        for (const v of allVariants) {
          if (!variantMap[v.product_id]) variantMap[v.product_id] = [];
          variantMap[v.product_id].push(v);
        }
        resultProducts = resultProducts.map(p => ({
          ...p,
          variants_list: variantMap[p.id] || [],
        }));
      }
    }

    return res.json({
      success: true,
      products: resultProducts,
      data: resultProducts,
      pagination: {
        currentPage:   pageNumber,
        totalPages:    Math.ceil((count || resultProducts.length || 0) / limitNumber),
        totalProducts: count || resultProducts.length || 0,
        hasNext:       pageNumber * limitNumber < (count || resultProducts.length || 0),
        hasPrev:       pageNumber > 1,
      },
    });
  } catch (err) {
    console.error('Products controller error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      products: [],
      data: [],
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, product: normalizeProductForResponse(data) });
  } catch (error) {
    console.error('Product fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

const createProduct = async (req, res) => {
  try {
    if (!isSupabaseConfigured) {
      return res.status(500).json({ success: false, message: 'Supabase environment variables are missing on the server' });
    }

    const productData = normalizeProductForDb(req.body);
    const { data, error } = await supabase.from('products').insert([productData]).select().single();

    if (error) {
      console.error('Product creation error:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to create product' });
    }

    const normalized = normalizeProductForResponse(data);
    return res.status(201).json({ success: true, product: normalized, data: [normalized] });
  } catch (err) {
    console.error('Product controller error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  normalizeProductForDb,
  normalizeProductForResponse,
};
