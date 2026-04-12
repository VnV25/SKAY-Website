/**
 * Image Import Template
 * 
 * This file shows how to import and use images from the brochure
 * Once you add images to src/assets/products/ folders,
 * use patterns like these to reference them
 */

// ============================================
// PATTERN 1: Direct import (Recommended)
// ============================================

// Import apparel images
// import oversizedTshirt from '@/assets/products/apparel/oversized-tshirt.jpg';
// import hoodie from '@/assets/products/apparel/hoodie.jpg';
// import cap from '@/assets/products/apparel/cap.jpg';

// Import gift images
// import coffeeMug from '@/assets/products/gifts/coffee-mug.jpg';
// import waterBottle from '@/assets/products/gifts/water-bottle.jpg';
// import toteBag from '@/assets/products/gifts/tote-bag.jpg';

// Import corporate images
// import giftKit from '@/assets/products/corporate/gift-kit.jpg';
// import schoolUniform from '@/assets/products/corporate/school-uniform.jpg';

// Usage in JSX:
// <img src={oversizedTshirt} alt="Oversized T-Shirt" />
// <img src={coffeeMug} alt="Coffee Mug" />

// ============================================
// PATTERN 2: Using in Product Data Files
// ============================================

/*
In src/data/products.ts, update like this:

import oversizedTshirtImg from '@/assets/products/apparel/oversized-tshirt.jpg';
import hoodieImg from '@/assets/products/apparel/hoodie.jpg';

export const products = [
  {
    id: 'tshirt-oversized-1',
    name: 'Oversized T-Shirt',
    category: 'apparel',
    price: 299,
    image: oversizedTshirtImg,  // ← Use imported image
    // ... rest of product data
  },
  {
    id: 'hoodie-1',
    name: 'Premium Hoodie',
    category: 'apparel',
    image: hoodieImg,           // ← Use imported image
    // ... rest of product data
  }
]
*/

// ============================================
// PATTERN 3: Using in Gallery Data
// ============================================

/*
In src/data/gallery.ts:

import apparel1 from '@/assets/products/gallery/apparel-1.jpg';
import apparel2 from '@/assets/products/gallery/apparel-2.jpg';
import gifts1 from '@/assets/products/gallery/gifts-1.jpg';

export const galleryItems = [
  {
    id: 1,
    category: 'apparel',
    image: apparel1,           // ← Use imported image
    title: 'Custom Printed T-Shirts',
    description: 'Bulk order...'
  }
]
*/

// ============================================
// PATTERN 4: Dynamic Image Loading
// ============================================

/*
If you want to load images dynamically:

const getProductImage = (category: string, filename: string) => {
  return require(`@/assets/products/${category}/${filename}`).default;
}

// Usage:
<img src={getProductImage('apparel', 'oversized-tshirt.jpg')} alt="T-Shirt" />
*/

// ============================================
// PATTERN 5: Image URL Helper (for API)
// ============================================

/*
If you want to reference images in backend API responses:

// In backend/routes/products.js
const fs = require('fs');
const path = require('path');

app.get('/api/products/images/:category/:filename', (req, res) => {
  const filepath = path.join(__dirname, '../public/images', req.params.category, req.params.filename);
  res.sendFile(filepath);
});

// Then in frontend, reference like:
image: `${API_BASE_URL}/images/apparel/oversized-tshirt.jpg`
*/

// ============================================
// FOLDER STRUCTURE REMINDER
// ============================================

/*
After adding images, your structure will be:

src/assets/products/
├── apparel/
│   ├── oversized-tshirt.jpg
│   ├── regular-tshirt.jpg
│   ├── hoodie.jpg
│   └── cap.jpg
├── gifts/
│   ├── coffee-mug.jpg
│   ├── magic-mug.jpg
│   ├── water-bottle.jpg
│   ├── keychain.jpg
│   ├── umbrella.jpg
│   └── tote-bag.jpg
├── corporate/
│   ├── gift-kit.jpg
│   ├── school-uniform.jpg
│   └── visiting-cards.jpg
└── gallery/
    ├── apparel-1.jpg
    ├── apparel-2.jpg
    ├── gifts-1.jpg
    ├── corporate-1.jpg
    └── ... (12 total gallery items)
*/

// ============================================
// VITE IMAGE OPTIMIZATION
// ============================================

/*
Vite automatically optimizes images:
- Small images (<4KB) → Inline as base64
- Medium images → Optimized & referenced
- Large images → Chunked in build

No extra config needed! Just import and use.
*/

// ============================================
// BROWSER CACHE BUSTING
// ============================================

/*
If images don't update in browser:

1. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. Or clear cache: F12 → Application → Cache Storage → Clear
3. Vite handles versioning automatically on build
*/

export default {
  // Placeholder - this file is for reference/documentation
  imagePatterns: {
    apparel: 'overlaid with product images after extraction',
    gifts: 'overlaid with product images after extraction',
    corporate: 'overlaid with product images after extraction',
    gallery: 'overlaid with portfolio/project images',
  }
};