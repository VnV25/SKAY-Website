# Using Brochure Images in SKAY Project

## 📋 Overview

Your PDF brochure (`Brochure/skay.pdf`) contains product images that should be used throughout the website for:
- ✅ **Home Page** - Featured products
- ✅ **Products Page** - Product cards
- ✅ **Gallery Page** - Portfolio showcase
- ✅ **Merchandise Page** - Customized items
- ✅ **Services Page** - Service showcase

## 🚀 Quick Start (3 Steps)

### Step 1: Extract Images from PDF
Extract images from `Brochure/skay.pdf` using:
- **Option A (Easiest)**: Adobe Reader - Right-click → Copy image
- **Option B (Online)**: https://www.ilovepdf.com/pdf_to_image
- **See**: `IMAGE_INTEGRATION_GUIDE.md` for detailed steps

### Step 2: Add to Project Folders
Place extracted images in:
```
src/assets/products/
├── apparel/        ← T-shirts, hoodies, caps
├── gifts/          ← Mugs, bottles, keychains
├── corporate/      ← Gift kits, uniforms
└── gallery/        ← Portfolio items
```

### Step 3: Update Code References
Files already prepared for image integration:
- ✅ `src/data/gallery.ts` - Gallery item definitions
- ✅ `src/data/products.ts` - Product definitions
- ✅ `src/pages/Gallery.tsx` - Gallery page
- ✅ `src/pages/CustomizedMerchandise.tsx` - Merchandise page

## 📂 File Structure

### Created Folders & Files

```
Project Root/
├── Brochure/
│   └── skay.pdf                    ← Your brochure with images
│
├── src/
│   ├── assets/
│   │   └── products/               ← NEW: Image folders
│   │       ├── apparel/            ← T-shirts, hoodies, caps
│   │       ├── gifts/              ← Mugs, bottles, etc.
│   │       ├── corporate/          ← Gift kits, uniforms
│   │       └── gallery/            ← Gallery/portfolio items
│   │
│   ├── data/
│   │   ├── products.ts             ← Product definitions
│   │   ├── services.ts             ← Service definitions
│   │   └── gallery.ts              ← NEW: Gallery items data
│   │
│   ├── pages/
│   │   ├── Gallery.tsx             ← Gallery page (updated)
│   │   └── CustomizedMerchandise.tsx ← Merchandise page
│   │
│   └── utils/
│       └── imageImports.example.ts ← NEW: Import examples
│
├── IMAGE_INTEGRATION_GUIDE.md       ← NEW: Detailed guide
├── IMAGES_CHECKLIST.md              ← NEW: Step-by-step checklist
└── README.md                        ← Updated with info
```

## 📍 Image Placement Map

### Apparel (T-shirts, Hoodies, Caps)
**File Location**: `src/assets/products/apparel/`
**Where Used**:
- Home page → Trending products section
- Products page → Product grid
- Gallery → Apparel category

**Images to Extract**:
- `oversized-tshirt.jpg` (Oversized T-Shirt product)
- `regular-tshirt.jpg` (Regular Fit T-Shirt)
- `hoodie.jpg` (Premium Hoodie)
- `cap.jpg` (Baseball Cap)

### Gifts (Mugs, Bottles, Accessories)
**File Location**: `src/assets/products/gifts/`
**Where Used**:
- Home page → Featured services
- Products page → Gift category
- Gallery → Mugs/Gifts category

**Images to Extract**:
- `coffee-mug.jpg` (Coffee Mug)
- `magic-mug.jpg` (Magic Mug)
- `water-bottle.jpg` (Steel Water Bottle)
- `keychain.jpg` (Metal Keychain)
- `umbrella.jpg` (Custom Umbrella)
- `tote-bag.jpg` (Custom Tote Bag)
- `pillow.jpg` (Custom Pillow)

### Corporate (Kits, Uniforms, Cards)
**File Location**: `src/assets/products/corporate/`
**Where Used**:
- Home page → Featured services
- Products page → Corporate category
- Gallery → Corporate category

**Images to Extract**:
- `gift-kit.jpg` (Executive Gift Kit)
- `school-uniform.jpg` (School Uniform Set)
- `visiting-cards.jpg` (Premium Visiting Cards)

### Gallery/Portfolio
**File Location**: `src/assets/products/gallery/`
**Where Used**:
- Gallery page → All portfolio items

**Images to Extract** (12 total):
- `apparel-1.jpg`, `apparel-2.jpg`, `apparel-3.jpg`, `apparel-4.jpg`
- `gifts-1.jpg`, `gifts-2.jpg`, `gifts-3.jpg`
- `corporate-1.jpg`, `corporate-2.jpg`
- `embroidery-1.jpg`, `embroidery-2.jpg`
- `printing-1.jpg`

## 🔧 How to Update Code

### Example 1: Update Product Image
**File**: `src/data/products.ts`

```javascript
// BEFORE (using Unsplash)
{
  id: 'tshirt-oversized-1',
  name: 'Oversized T-Shirt',
  image: 'https://images.unsplash.com/photo-1577876050215-134d70691e0c',
}

// AFTER (using local image)
import oversizedTshirt from '@/assets/products/apparel/oversized-tshirt.jpg';

{
  id: 'tshirt-oversized-1',
  name: 'Oversized T-Shirt',
  image: oversizedTshirt,
}
```

### Example 2: Update Gallery Item
**File**: `src/data/gallery.ts`

```javascript
// BEFORE
{
  id: 1,
  image: 'https://images.unsplash.com/photo-1577876050215-134d70691e0c',
}

// AFTER
import apparel1 from '@/assets/products/gallery/apparel-1.jpg';

{
  id: 1,
  image: apparel1,
}
```

## ✅ Testing Checklist

After adding images:

- [ ] **Run dev server**: `npm run dev`
- [ ] **Check Home page**: Products show correct images
- [ ] **Check Gallery page**: All 12 gallery items display
- [ ] **Check Merchandise page**: Product cards show images
- [ ] **Check Services page**: Service images display
- [ ] **Check browser console** (F12): No 404 errors
- [ ] **Mobile responsive**: Images scale properly
- [ ] **Build production**: `npm run build` succeeds

## 🎨 Image Optimization Tips

Before adding images:

1. **Resize**: Max width 1200px
   ```bash
   convert image.jpg -resize 1200x\> optimized.jpg
   ```

2. **Compress**: Use https://tinypng.com
   - Keeps quality, reduces size
   - Target: 300-500KB per image

3. **Format**:
   - JPG for photos (80% quality)
   - PNG for graphics with transparency

4. **Result**: Images under 500KB load fast ⚡

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Images not showing | Check file path, clear cache (Ctrl+Shift+Delete), restart dev server |
| 404 errors in console | Verify image file exists in correct folder with exact name |
| Images load slowly | Compress file to under 300KB using tinypng.com |
| Build fails | Check image file format (JPG/PNG), valid import path |
| Build succeeds but no images | Restart dev server, hard refresh browser (Ctrl+Shift+R) |

## 📖 Supporting Files

1. **`IMAGE_INTEGRATION_GUIDE.md`** - Detailed extraction methods
2. **`IMAGES_CHECKLIST.md`** - Step-by-step checklist with examples
3. **`src/utils/imageImports.example.ts`** - Code import patterns
4. **`src/data/gallery.ts`** - Gallery data file (ready for updates)

## 🎯 Next Steps

1. Read: `IMAGE_INTEGRATION_GUIDE.md` for extraction options
2. Follow: `IMAGES_CHECKLIST.md` step-by-step
3. Extract images from `Brochure/skay.pdf`
4. Add to `src/assets/products/` folders
5. Update code references (see examples above)
6. Test: `npm run dev` and check pages
7. Deploy: `npm run build && deploy`

## 💡 Pro Tips

- Start with 2-3 images to test the process
- Use batch optimization tools for multiple images
- Keep original brochure images as backup
- Version control: Include images in git (or use LFS for large files)
- Backup: Copy images before building for production

## ❓ Questions?

Check these files for answers:
- **How to extract?** → `IMAGE_INTEGRATION_GUIDE.md` (Section: "Steps to Extract")
- **Where to put files?** → `IMAGES_CHECKLIST.md` (Section: "Step 2: Organize Images")
- **How to update code?** → `src/utils/imageImports.example.ts` (Code patterns)
- **Step by step?** → `IMAGES_CHECKLIST.md` (Checklist format)

---

**Ready?** Start with `IMAGE_INTEGRATION_GUIDE.md` and follow the steps! 🚀
