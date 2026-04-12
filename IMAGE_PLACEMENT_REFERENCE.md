# Visual Image Placement Guide

## 🎯 Quick Reference: Where Each Image Goes

```
BROCHURE PAGE       PRODUCT/ITEM NAME           DESTINATION FOLDER       FILENAME
─────────────────────────────────────────────────────────────────────────────────────
Page 1-2            Oversized T-Shirt           apparel/                oversized-tshirt.jpg
Page 1-2            Regular Fit T-Shirt         apparel/                regular-tshirt.jpg
Page 1-2            Premium Hoodie              apparel/                hoodie.jpg
Page 1-2            Baseball Cap                apparel/                cap.jpg
Page 1-2            School Uniform              apparel/                school-uniform.jpg

Page 3              Coffee Mug                  gifts/                  coffee-mug.jpg
Page 3              Magic Mug                   gifts/                  magic-mug.jpg
Page 3              Water Bottle                gifts/                  water-bottle.jpg
Page 3              Metal Keychain              gifts/                  keychain.jpg
Page 3              Photo Pillow                gifts/                  pillow.jpg
Page 3              Custom Umbrella             gifts/                  umbrella.jpg
Page 3              Custom Tote Bag             gifts/                  tote-bag.jpg

Page 4              Executive Gift Kit          corporate/              gift-kit.jpg
Page 4              School Uniform Set          corporate/              school-uniform.jpg
Page 4              Premium Visiting Cards      corporate/              visiting-cards.jpg

Page 5-10           Portfolio Item 1            gallery/                apparel-1.jpg
Page 5-10           Portfolio Item 2            gallery/                apparel-2.jpg
Page 5-10           Portfolio Item 3            gallery/                apparel-3.jpg
Page 5-10           Portfolio Item 4            gallery/                apparel-4.jpg
Page 5-10           Portfolio Item 5            gallery/                gifts-1.jpg
Page 5-10           Portfolio Item 6            gallery/                gifts-2.jpg
Page 5-10           Portfolio Item 7            gallery/                gifts-3.jpg
Page 5-10           Portfolio Item 8            gallery/                corporate-1.jpg
Page 5-10           Portfolio Item 9            gallery/                corporate-2.jpg
Page 5-10           Portfolio Item 10           gallery/                embroidery-1.jpg
Page 5-10           Portfolio Item 11           gallery/                embroidery-2.jpg
Page 5-10           Portfolio Item 12           gallery/                printing-1.jpg
```

## 🗂️ Directory Tree (After Adding Files)

```
src/assets/products/
│
├── apparel/                    ← Clothing & Wearables
│   ├── oversized-tshirt.jpg    (299 ₹)
│   ├── regular-tshirt.jpg      (249 ₹)
│   ├── hoodie.jpg              (799 ₹)
│   ├── cap.jpg                 (199 ₹)
│   └── school-uniform.jpg
│
├── gifts/                      ← Mugs, Bottles, Accessories
│   ├── coffee-mug.jpg          (149 ₹)
│   ├── magic-mug.jpg           (299 ₹)
│   ├── water-bottle.jpg        (349 ₹)
│   ├── keychain.jpg            (49 ₹)
│   ├── pillow.jpg              (299 ₹)
│   ├── umbrella.jpg            (449 ₹)
│   └── tote-bag.jpg            (249 ₹)
│
├── corporate/                  ← Business & Corporate Items
│   ├── gift-kit.jpg            (1499 ₹)
│   ├── school-uniform.jpg
│   └── visiting-cards.jpg      (299 ₹)
│
└── gallery/                    ← Portfolio & Showcase Items
    ├── apparel-1.jpg
    ├── apparel-2.jpg
    ├── apparel-3.jpg
    ├── apparel-4.jpg
    ├── gifts-1.jpg
    ├── gifts-2.jpg
    ├── gifts-3.jpg
    ├── corporate-1.jpg
    ├── corporate-2.jpg
    ├── embroidery-1.jpg
    ├── embroidery-2.jpg
    └── printing-1.jpg
```

## 🔄 How Images Flow Through Website

### 1️⃣ Home Page (src/pages/Home.tsx)
```
Trending Section:
  └─ Uses top 4 highest-discount items from src/data/products.ts
     └─ Each product's image: apparel/*.jpg or gifts/*.jpg

Featured Services:
  └─ Shows service showcase images
     └─ From Home.tsx inline or from data file

Recently Viewed:
  └─ Dynamically shows viewer's last 4 products
```

### 2️⃣ Products Page (src/pages/Services.tsx)
```
Product Grid:
  └─ Maps through products from src/data/products.ts
     └─ Each ProductCard displays:
        ├─ product.image (apparel/*.jpg or gifts/*.jpg)
        ├─ product.name
        ├─ product.price
        └─ product.rating
```

### 3️⃣ Gallery Page (src/pages/Gallery.tsx)
```
Portfolio Grid:
  └─ Maps through galleryItems from src/data/gallery.ts
     └─ Each gallery item displays:
        ├─ item.image (gallery/*.jpg)
        ├─ item.title
        └─ item.description
```

### 4️⃣ Merchandise Page (src/pages/CustomizedMerchandise.tsx)
```
Merchandise Showcase:
  └─ Shows figma asset: e08009e5d3e387ac503a3afec1c11458a05a7081.png

Product Grid:
  └─ Maps through merchandiseProducts
     └─ Each item displays image
        └─ From apparel/*.jpg or gifts/*.jpg
```

### 5️⃣ Services Page (src/pages/ServicesDetailed.tsx)
```
Service Cards:
  └─ Maps through services
     └─ Each shows service.image
        └─ From inline URLs or local files
```

## 📊 Usage Summary

### Image File Count Needed
- **Apparel**: 4-5 files
- **Gifts**: 7 files  
- **Corporate**: 3 files
- **Gallery**: 12 files
- **TOTAL**: 26-27 image files

### File Size Targets
- Per image: 300-500 KB (after optimization)
- Total assets: ~10-15 MB
- Build output: ~20-25 MB (with other assets)

### Load Performance
- Images per page: 4-12 images
- Expected load time: 1-3 seconds
- Bandwidth: ~1-2 MB per page load

## 🎬 Animation with Images

Your site uses images in these interactive ways:

```javascript
// ProductCard.tsx
<img 
  src={product.image}
  className="group-hover:scale-110 transition-transform"
/>
// Zooms 10% on hover ✨

// Gallery.tsx
<img 
  src={item.image}
  className="rounded-lg hover:shadow-xl transition-shadow"
/>
// Shadow effect on hover ✨
```

## 🖼️ Image Format Recommendations

### For Each Category

**Apparel** (T-shirts, Hoodies):
- Format: JPG
- Size: ~400x500px (tall)
- Weight: ~200-300 KB
- Quality: 80%

**Gifts** (Mugs, Bottles):
- Format: JPG
- Size: ~400x400px (square)
- Weight: ~150-250 KB
- Quality: 80%

**Corporate** (Gift Kits, Cards):
- Format: JPG or PNG (if logo transparency needed)
- Size: ~500x300px (wide)
- Weight: ~200-400 KB
- Quality: 85% (for crisper corporate items)

**Gallery** (Portfolio):
- Format: JPG
- Size: ~600x400px (landscape)
- Weight: ~300-400 KB
- Quality: 80%

## ⚡ Optimization Quick Commands

```bash
# Resize all images to max 1200px width
for f in src/assets/products/*/*.jpg; do
  convert "$f" -resize 1200x\> "$f"
done

# Compress using ImageMagick
convert input.jpg -quality 80 -strip output.jpg

# Batch compress using ImageOptim (Mac)
imageoptim src/assets/products/

# Using online tool
# Visit: https://tinypng.com
# Drag & drop all images
# Download optimized versions
```

## ✨ Preview: How It Will Look

**Home Page Trending Section**:
```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Hoodie  │ │ T-Shirt │ │  Magic  │ │ Bottle  │
│ [IMAGE] │ │ [IMAGE] │ │  Mug    │ │[IMAGE] │
│ 799 ₹   │ │ 299 ₹   │ │[IMAGE]  │ │ 349 ₹  │
│ 4.9⭐   │ │ 4.8⭐   │ │ 299 ₹   │ │ 4.6⭐  │
└─────────┘ └─────────┘ │ 4.9⭐   │ └─────────┘
                         └─────────┘
```

**Gallery Page Portfolio**:
```
Grid Layout (4 columns):
[apparel-1] [apparel-2] [gifts-1] [gifts-2]
[corporate-1] [embroidery-1] [printing-1] [apparel-3]
... and so on
```

---

## 📱 Responsive Behavior

Thanks to Tailwind CSS, your images will:

```
Mobile (320px):   1 column, 100% width
Tablet (768px):   2 columns, 50% width
Desktop (1024px): 3-4 columns, 25-33% width
Large (1280px):   4 columns, 25% width
```

This happens automatically! ✨

---

## 🔗 File Connections

After updating with images:

```
Home Page → Product image (apparel/oversized-tshirt.jpg)
  ↓
ProductCard component displays it
  ↓
Styles: rounded corners, hover zoom, rating overlay
  ↓
Click → Opens ProductModal with full details
```

---

**Ready to extract images? Start here:**
1. Open `Brochure/skay.pdf`
2. Extract images for each product
3. Save to appropriate folder
4. Follow `IMAGES_CHECKLIST.md` to update code
5. Test in browser and deploy! 🚀
