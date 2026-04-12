require('dotenv').config();
const { supabase } = require('../lib/supabase');

// Products data from frontend
const products = [
  {
    id: 'tshirt-oversized-1',
    name: 'Oversized T-Shirt',
    category: 'apparel',
    price: 299,
    originalPrice: 499,
    image: '/assets/polo.jpg',
    rating: 4.8,
    reviews: 124,
    stock: 8,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Navy Blue', 'Grey', 'Maroon'],
    trending: true,
    discount: 40,
    description: 'Premium quality oversized t-shirt with custom printing options',
  },
  {
    id: 'tshirt-normal-1',
    name: 'Regular Fit T-Shirt',
    category: 'apparel',
    price: 249,
    originalPrice: 399,
    image: '/assets/polo.jpg',
    rating: 4.6,
    reviews: 98,
    stock: 15,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Red', 'Green'],
    trending: true,
    discount: 38,
    description: 'Classic fit t-shirt perfect for custom designs and logos',
  },
  {
    id: 'hoodie-1',
    name: 'Zip-Up Hoodie with Logo',
    category: 'apparel',
    price: 799,
    originalPrice: 1299,
    image: '/assets/hoodie.jpg',
    rating: 4.9,
    reviews: 86,
    stock: 5,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Grey', 'Navy', 'Maroon'],
    trending: true,
    discount: 38,
    description: 'Premium hoodie with custom logo printing',
  },
  {
    id: 'cap-1',
    name: 'Embroidered Cap',
    category: 'accessories',
    price: 199,
    originalPrice: 299,
    image: '/assets/cap.jpg',
    rating: 4.5,
    reviews: 67,
    stock: 20,
    sizes: ['One Size'],
    colors: ['Black', 'Navy', 'White'],
    trending: false,
    discount: 33,
    description: 'Custom embroidered cap for teams and events',
  },
  {
    id: 'mug-magic-1',
    name: 'Magic Color Changing Mug',
    category: 'mugs',
    price: 149,
    originalPrice: 249,
    image: '/assets/mug.jpg',
    rating: 4.9,
    reviews: 156,
    stock: 30,
    sizes: ['11oz'],
    colors: ['Black'],
    trending: true,
    discount: 40,
    description: 'Magic mug that reveals design when hot liquid is added',
  },
  {
    id: 'mug-regular-1',
    name: 'Ceramic Coffee Mug',
    category: 'mugs',
    price: 99,
    originalPrice: 149,
    image: '/assets/mug.jpg',
    rating: 4.7,
    reviews: 89,
    stock: 50,
    sizes: ['11oz'],
    colors: ['White'],
    trending: false,
    discount: 34,
    description: 'Standard ceramic mug with custom printing',
  },
];

async function seedProducts() {
  console.log('🌱 Seeding products into Supabase...');

  try {
    // Don't clear existing products since they might be referenced
    // Just insert new ones with UUIDs

    // Transform frontend products to Supabase format with UUIDs
    const supabaseProducts = products.map(product => ({
      name: product.name,
      description: product.description,
      price: product.price,
      original_price: product.originalPrice || null,
      category: product.category,
      image: product.image,
      stock: product.stock,
      featured: product.trending || false,
    }));

    // Insert products (Supabase will auto-generate UUIDs)
    const { data, error } = await supabase
      .from('products')
      .insert(supabaseProducts)
      .select();

    if (error) {
      console.error('Error seeding products:', error);
      return;
    }

    console.log(`✅ Successfully seeded ${data.length} products into Supabase`);
    data.forEach(p => console.log(`  - ${p.name} (${p.id})`));

  } catch (err) {
    console.error('Seeding error:', err);
  }
}

// Run if called directly
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts };