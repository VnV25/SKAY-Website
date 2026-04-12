require('dotenv').config();
const mongoose = require('mongoose');
const Product  = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skay';

const products = [
  {
    name: 'Classic White Oversized T-Shirt',
    description: 'Premium oversized t-shirt with custom full-colour DTF print. 100% cotton pre-shrunk fabric, 220 GSM. Perfect for personal or bulk corporate orders.',
    price: 699, originalPrice: 999,
    category: 't-shirts',
    images: ['https://images.unsplash.com/photo-1577876050215-134d70691e0c?w=600'],
    image:  'https://images.unsplash.com/photo-1577876050215-134d70691e0c?w=600',
    sizes:  ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'White', hex: '#ffffff' }, { name: 'Black', hex: '#111111' }, { name: 'Navy', hex: '#1e3a5f' }],
    stock: 150, featured: true, trending: true, discount: 30, rating: 4.8, reviews: 124,
    tags: ['tshirt', 'oversized', 'custom', 'print', 'cotton'],
  },
  {
    name: 'Premium Embroidered Hoodie',
    description: 'Warm, high-quality fleece hoodie with custom embroidery or DTF print. Unisex fit, double-lined hood, kangaroo pocket. 350 GSM fleece.',
    price: 1499, originalPrice: 1999,
    category: 'hoodies',
    images: ['https://images.unsplash.com/photo-1705105385841-accda1f8259d?w=600'],
    image:  'https://images.unsplash.com/photo-1705105385841-accda1f8259d?w=600',
    sizes:  ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Navy', hex: '#1e3a5f' }, { name: 'Charcoal', hex: '#374151' }, { name: 'Maroon', hex: '#7f1d1d' }],
    stock: 80, featured: true, trending: true, discount: 25, rating: 4.7, reviews: 89,
    tags: ['hoodie', 'embroidery', 'custom', 'fleece'],
  },
  {
    name: 'Magic Color-Changing Mug',
    description: 'Surprise your clients — this black mug reveals your custom design when filled with hot liquid. Sublimation quality print, 11oz ceramic, dishwasher-safe interior.',
    price: 399, originalPrice: 549,
    category: 'mugs',
    images: ['https://images.unsplash.com/photo-1539042357369-956fb344118f?w=600'],
    image:  'https://images.unsplash.com/photo-1539042357369-956fb344118f?w=600',
    sizes:  [],
    colors: [{ name: 'Black', hex: '#111111' }],
    stock: 200, featured: true, trending: true, discount: 27, rating: 4.9, reviews: 213,
    tags: ['mug', 'magic', 'gift', 'sublimation', 'corporate'],
  },
  {
    name: 'Structured Embroidered Cap',
    description: '6-panel structured cap with custom embroidered logo on the front. Adjustable strap, breathable cotton blend. Perfect for teams, events and corporate branding.',
    price: 549, originalPrice: 799,
    category: 'caps',
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600'],
    image:  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600',
    sizes:  ['Free Size'],
    colors: [{ name: 'Black', hex: '#111111' }, { name: 'Navy', hex: '#1e3a5f' }, { name: 'Red', hex: '#dc2626' }, { name: 'White', hex: '#f9fafb' }],
    stock: 120, featured: false, trending: false, discount: 31, rating: 4.6, reviews: 67,
    tags: ['cap', 'embroidery', 'hat', 'team', 'branding'],
  },
  {
    name: 'Waterproof Vinyl Sticker Pack (10 pcs)',
    description: 'Custom die-cut vinyl stickers in any shape. Waterproof, UV-resistant, suitable for laptops, helmets, car glass. Vibrant CMYK full-colour print.',
    price: 199, originalPrice: 299,
    category: 'stickers',
    images: ['https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600'],
    image:  'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600',
    sizes:  [],
    colors: [],
    stock: 500, featured: false, trending: false, discount: 33, rating: 4.5, reviews: 156,
    tags: ['sticker', 'vinyl', 'waterproof', 'die-cut', 'custom'],
  },
  {
    name: 'Premium Corporate Gift Set',
    description: 'Everything your brand needs in one box: custom mug + branded t-shirt + A5 notebook in premium gift packaging. Great for onboarding kits and client gifts.',
    price: 1999, originalPrice: 2499,
    category: 'custom',
    images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600'],
    image:  'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600',
    sizes:  [],
    colors: [],
    stock: 50, featured: true, trending: false, discount: 20, rating: 4.8, reviews: 45,
    tags: ['corporate', 'gift', 'kit', 'combo', 'branding'],
  },
  {
    name: 'Polo T-Shirt with Embroidery',
    description: 'Durable polo shirt with custom embroidered logo on chest. Ideal for school, office and restaurant uniforms. 220 GSM Lacoste fabric.',
    price: 899, originalPrice: 1299,
    category: 't-shirts',
    images: ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600'],
    image:  'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600',
    sizes:  ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'White', hex: '#fff' }, { name: 'Blue', hex: '#1e40af' }, { name: 'Black', hex: '#111' }],
    stock: 100, featured: false, trending: false, discount: 31, rating: 4.7, reviews: 98,
    tags: ['polo', 'uniform', 'embroidery', 'office', 'school'],
  },
  {
    name: 'Ceramic Coffee Mug (Full Colour)',
    description: 'High-quality white ceramic mug with full 360° colour sublimation printing. 11oz, sturdy handle, dishwasher-safe, microwave-safe.',
    price: 299, originalPrice: 399,
    category: 'mugs',
    images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600'],
    image:  'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600',
    sizes:  [],
    colors: [{ name: 'White', hex: '#fff' }],
    stock: 300, featured: false, trending: false, discount: 25, rating: 4.4, reviews: 72,
    tags: ['mug', 'ceramic', 'coffee', 'sublimation', 'gift'],
  },
  {
    name: 'Zip-Up Hoodie with Logo',
    description: 'Full-zip hoodie with custom screen print or embroidery. Ribbed cuffs and hem, two front pockets. Great for sports teams and corporate events.',
    price: 1799, originalPrice: 2299,
    category: 'hoodies',
    images: ['https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600'],
    image:  'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600',
    sizes:  ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Grey', hex: '#6b7280' }, { name: 'Black', hex: '#111' }, { name: 'Navy', hex: '#1e3a5f' }],
    stock: 60, featured: false, trending: true, discount: 22, rating: 4.6, reviews: 41,
    tags: ['hoodie', 'zip', 'sports', 'custom', 'team'],
  },
  {
    name: 'School Uniform Set (Shirt + Pant)',
    description: 'Durable school uniform set with custom embroidered school crest/logo. Poly-cotton blend fabric, wrinkle-resistant. Bulk orders available at discounted rates.',
    price: 799, originalPrice: 999,
    category: 'custom',
    images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600'],
    image:  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600',
    sizes:  ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'White/Navy', hex: '#1e3a5f' }, { name: 'White/Grey', hex: '#9ca3af' }],
    stock: 200, featured: false, trending: false, discount: 20, rating: 4.5, reviews: 31,
    tags: ['uniform', 'school', 'bulk', 'embroidery', 'kids'],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    const existing = await Product.countDocuments();
    if (existing > 0) {
      console.log(`ℹ️  ${existing} products already exist. Skipping seed.`);
      console.log('   To re-seed, run: node seeds/seed.js --force');
      if (!process.argv.includes('--force')) {
        await mongoose.disconnect();
        return;
      }
      console.log('   --force flag detected. Clearing existing products…');
      await Product.deleteMany({});
    }

    const inserted = await Product.insertMany(products);
    console.log(`✅ Seeded ${inserted.length} products successfully`);
    inserted.forEach(p => console.log(`   · ${p.name} (${p.category}) – ₹${p.price}`));
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();