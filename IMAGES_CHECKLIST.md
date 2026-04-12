# SKAY Product Images Integration Checklist

## Step 1: Extract Images from Brochure PDF ✓

**File Location**: `Brochure/skay.pdf`

### Using Adobe Reader (Easiest - Free):
```
1. Open: Brochure/skay.pdf
2. For each product image:
   - Right-click → Copy image
   - Open Paint/Photoshop
   - Paste → File → Export As
   - Save with name (see naming below)
3. Move to correct folder (see Step 2)
```

### Using Online Tool:
```
1. Visit: https://www.ilovepdf.com/pdf_to_image
2. Upload: Brochure/skay.pdf
3. Download all pages as images
4. Rename and organize (see Step 2)
```

---

## Step 2: Organize Images in Folders

Create folders and add images with these names:

### 📁 src/assets/products/apparel/
```
├── oversized-tshirt.jpg      (for oversized t-shirt product)
├── regular-tshirt.jpg        (for normal fit t-shirt)
├── hoodie.jpg                (for premium hoodie)
├── cap.jpg                   (for baseball cap)
└── jacket.jpg                (if available in brochure)
```

### 📁 src/assets/products/gifts/
```
├── coffee-mug.jpg            (ceramic mug)
├── magic-mug.jpg             (color changing mug)
├── water-bottle.jpg          (stainless steel bottle)
├── keychain.jpg              (metal keychain)
├── photo-frame.jpg           (photo frame/pillow)
├── umbrella.jpg              (custom umbrella)
└── tote-bag.jpg              (eco-friendly tote)
```

### 📁 src/assets/products/corporate/
```
├── gift-kit.jpg              (executive gift kit)
├── school-uniform.jpg        (uniform set)
├── visiting-cards.jpg        (business cards/printing)
└── collection.jpg            (corporate collection)
```

### 📁 src/assets/products/gallery/
```
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

---

## Step 3: Update References in Code

Once you've added images to the folders, update the code files:

### For Product Cards (src/data/products.ts)
Update image paths like this:
```javascript
// BEFORE:
image: 'https://images.unsplash.com/photo-...'

// AFTER (once you add local image):
image: require('@/assets/products/apparel/oversized-tshirt.jpg').default,
```

### For Gallery (src/data/gallery.ts)
```javascript
// Update like this:
{
  id: 1,
  category: 'apparel',
  image: require('@/assets/products/gallery/apparel-1.jpg').default,
  title: 'Custom Printed T-Shirts',
  description: 'Bulk order of 200 units...'
}
```

### For Merchandise Page (src/pages/CustomizedMerchandise.tsx)
```javascript
// Update imports:
import tshirtImg from '@/assets/products/apparel/oversized-tshirt.jpg'
import hoodie from '@/assets/products/apparel/hoodie.jpg'

// Use in JSX:
<img src={tshirtImg} alt="T-Shirt" />
```

---

## Step 4: Image Optimization (Important!)

Before using images on website:

### Resize images:
```bash
# Install image tool
npm install -g imagemagick

# Resize to max width 1200px
convert image.jpg -resize 1200x\> optimized.jpg
```

### Compress images:
1. Visit: https://tinypng.com
2. Upload your images
3. Download compressed versions
4. Replace original files

### Keep Under:
- ✅ 500KB per image
- ✅ Max 1200px width
- ✅ JPG format (80% quality) for photos
- ✅ PNG for designs with transparency

---

## Step 5: Test in Browser

```bash
# Terminal 1: Start development server
npm run dev

# Terminal 2: Start backend (if using local MongoDB)
cd backend && npm run dev
```

Then:
1. Open: http://localhost:3000
2. Visit each page:
   - Gallery → Images should display
   - CustomizedMerchandise → Product images
   - Home → Product cards
3. Check Console for errors (F12 → Console tab)

---

## Step 6: Build for Production

```bash
# Build frontend
npm run build

# Test production build
npm run preview
```

---

## Quick Image Mapping Table

| Product | File Location | Used In |
|---------|--------------|---------|
| Oversized T-Shirt | `apparel/oversized-tshirt.jpg` | Home, Products, Gallery |
| Hoodie | `apparel/hoodie.jpg` | Products, Merchandise |
| Baseball Cap | `apparel/cap.jpg` | Products, Gallery |
| Coffee Mug | `gifts/coffee-mug.jpg` | Products, Home |
| Magic Mug | `gifts/magic-mug.jpg` | Products, Gallery |
| Water Bottle | `gifts/water-bottle.jpg` | Products, Merchandise |
| Corporate Kit | `corporate/gift-kit.jpg` | Home, Gallery |
| School Uniform | `corporate/school-uniform.jpg` | Products, Gallery |

---

## Troubleshooting

### ❌ Images not showing?
- [ ] Check file exists in correct folder: `src/assets/products/...`
- [ ] Check file name spelling (case-sensitive)
- [ ] Clear browser cache: `Ctrl+Shift+Delete`
- [ ] Restart dev server: `npm run dev`

### ❌ Build fails?
- [ ] Check import path uses forward slashes: `@/assets/...`
- [ ] Verify file format is JPG or PNG
- [ ] Check for typos in file names
- [ ] Try: `npm install` again

### ❌ Images load slowly?
- [ ] Compress images to under 300KB
- [ ] Use JPG instead of PNG (if no transparency needed)
- [ ] Resize to max 1200px width
- [ ] Use https://tinypng.com for compression

---

## Support Files

- 📄 `IMAGE_INTEGRATION_GUIDE.md` - Detailed extraction guide
- 📁 `src/data/gallery.ts` - Gallery data file
- 📁 `src/assets/products/` - Organized image folders

## Done? ✅

Once all images are added and tested:
1. Commit to git: `git add . && git commit -m "Add brochure images"`
2. Deploy to production
3. Your website now displays your actual products!

---

**Need help?** Check the comments in:
- `src/data/products.ts` - Product image references
- `src/pages/Gallery.tsx` - Gallery setup
- `src/pages/CustomizedMerchandise.tsx` - Merchandise display
