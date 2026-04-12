# Image Integration Guide

This guide helps you extract images from the PDF brochure and integrate them into the SKAY project.

## Folder Structure Created

```
src/assets/products/
├── apparel/        (T-shirts, Hoodies, Caps)
├── gifts/          (Mugs, Bottles, Keychains)
├── corporate/      (Gift sets, Collections)
└── gallery/        (Portfolio/showcase items)
```

## Steps to Extract Images from PDF

### Option 1: Using Adobe Acrobat Reader (Free)
1. Open `Brochure/skay.pdf` in Adobe Acrobat Reader
2. Right-click on any image → "Copy image"
3. Paste in an image editor (Paint, Photoshop, etc.)
4. Export as PNG or JPG

### Option 2: Using Online PDF Tool
1. Go to https://www.ilovepdf.com/pdf_to_image
2. Upload `Brochure/skay.pdf`
3. Download extracted images
4. Convert and optimize if needed

### Option 3: Using Python (Automated)
```bash
pip install pdf2image
python -c "
from pdf2image import convert_from_path
images = convert_from_path('Brochure/skay.pdf')
for i, image in enumerate(images):
    image.save(f'src/assets/products/gallery/page_{i}.jpg')
"
```

## File Naming Convention

After extracting, rename images as follows:

### Apparel (`src/assets/products/apparel/`)
- `oversized-tshirt.jpg`
- `regular-tshirt.jpg`
- `hoodie.jpg`
- `cap.jpg`
- `custom-jacket.jpg`

### Gifts (`src/assets/products/gifts/`)
- `coffee-mug.jpg`
- `magic-mug.jpg`
- `water-bottle.jpg`
- `keychain.jpg`
- `photo-frame.jpg`
- `pillow.jpg`
- `tote-bag.jpg`
- `umbrella.jpg`

### Corporate (`src/assets/products/corporate/`)
- `gift-kit.jpg`
- `school-uniform.jpg`
- `visiting-cards.jpg`
- `corporate-collection.jpg`

### Gallery (`src/assets/products/gallery/`)
- `project-1.jpg` (through `project-12.jpg`)

## How the Project Will Use These

### 1. Product Cards
Products in `src/data/products.ts` will reference:
```javascript
image: require('@/assets/products/apparel/oversized-tshirt.jpg')
```

### 2. Gallery Page
Gallery items in `src/pages/Gallery.tsx` will use local images:
```javascript
image: require('@/assets/products/gallery/project-1.jpg')
```

### 3. Merchandise Page
CustomizedMerchandise.tsx will display category showcase:
```javascript
import tshirtImg from '@/assets/products/apparel/oversized-tshirt.jpg'
```

## Image Optimization Tips

Before adding images:
1. **Resize**: Max width 1200px for web (use TinyPNG or similar)
2. **Format**: Use JPG for photos, PNG for graphics with transparency
3. **Size**: Keep under 500KB per image for fast loading
4. **Quality**: 80% JPG quality is usually fine for web

## After Adding Images

Run these commands:
```bash
# Install image optimization (optional)
npm install --save-dev imagemin

# Build and test
npm run build
npm run preview
```

## Image URLs Update

Once you add images to folders, the code will automatically reference them.
Current implementation supports both:
- ✅ External URLs (Unsplash - fallback)
- ✅ Local images (from assets/products/)

## Troubleshooting

**Images not showing?**
- Check file path in import statement
- Verify image file exists in correct folder
- Check file name spelling (case-sensitive on Linux/Mac)
- Clear browser cache: `Ctrl+Shift+Delete`

**Build fails with image error?**
- Ensure image file is in correct assets folder
- Use forward slashes in paths: `@/assets/...`
- Check image format is supported (JPG, PNG, GIF, WebP)
