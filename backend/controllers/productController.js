const supabase = require('../config/supabaseClient');

const sampleProducts = [
  {
    name: 'Premium Oversized T-Shirt',
    category: 'apparel',
    price: 499,
    originalPrice: 699,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
    trending: true,
    description: 'Comfort-fit oversized tee with high-quality print.',
  },
  {
    name: 'Custom Coffee Mug',
    category: 'gifts',
    price: 249,
    originalPrice: 349,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800',
    trending: false,
    description: 'Ceramic mug with vibrant long-lasting custom print.',
  },
  {
    name: 'Corporate Gift Kit',
    category: 'corporate',
    price: 999,
    originalPrice: 1299,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800',
    trending: true,
    description: 'Premium gift kit for company branding and events.',
  },
];

const getAllProducts = async (req, res) => {
  try {
    console.log('Fetching products...');

    const { category, featured, search, page = 1, limit = 50 } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 50;
    const offset = (pageNumber - 1) * limitNumber;

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

    let resultProducts = Array.isArray(products) ? products : [];

    const shouldAutoSeed = !category && !search && resultProducts.length === 0;

    if (shouldAutoSeed) {
      console.log('No products found. Seeding sample products...');

      const { data: seededData, error: seedError } = await supabase
        .from('products')
        .insert(sampleProducts)
        .select('*');

      if (seedError) {
        console.error('Sample seed failed:', seedError);
      } else {
        resultProducts = Array.isArray(seededData) ? seededData : [];
      }
    }

    console.log('Products fetched:', resultProducts.length);

    return res.json({
      success: true,
      products: resultProducts,
      data: resultProducts,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil((count || resultProducts.length || 0) / limitNumber),
        totalProducts: count || resultProducts.length || 0,
        hasNext: pageNumber * limitNumber < (count || resultProducts.length || 0),
        hasPrev: pageNumber > 1,
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

const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const { data, error } = await supabase.from('products').insert([productData]).select().single();

    if (error) {
      console.error('Product creation error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create product' });
    }

    return res.status(201).json({ success: true, product: data, data: [data] });
  } catch (err) {
    console.error('Product controller error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
};
