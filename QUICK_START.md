# 🎯 Image Integration Quick Start - One Pager

## Three Simple Steps

### ✅ STEP 1: Extract Images (15 min)
Open: `Brochure/skay.pdf`

**Option A - Adobe Reader (Easiest)**
1. Right-click image → Copy
2. Paste in Paint/Photoshop
3. Export as JPG

**Option B - Online Tool**
1. Go: https://www.ilovepdf.com/pdf_to_image
2. Upload PDF
3. Download images

**Option C - Python**
```bash
pip install pdf2image
python -c "from pdf2image import convert_from_path; 
images = convert_from_path('Brochure/skay.pdf'); 
[image.save(f'img_{i}.jpg') for i, image in enumerate(images)]"
```

### ✅ STEP 2: Organize & Optimize (20 min)

**Create folders:**
```
src/assets/products/
├── apparel/        (4-5 images)
├── gifts/          (7 images)
├── corporate/      (3 images)
└── gallery/        (12 images)
```

**Optimize images:**
1. Resize: max 1200px width
2. Compress: https://tinypng.com (target 300-500KB)
3. Move to correct folder

**Naming guide:**
```
apparel/
 - oversized-tshirt.jpg
 - hoodie.jpg
 - cap.jpg
 
gifts/
 - coffee-mug.jpg
 - magic-mug.jpg
 - water-bottle.jpg
 
corporate/
 - gift-kit.jpg
 - school-uniform.jpg
 
gallery/
 - apparel-1.jpg through apparel-4.jpg
 - gifts-1.jpg through gifts-3.jpg
 - corporate-1.jpg, 2.jpg
 - embroidery-1.jpg, 2.jpg
 - printing-1.jpg
```

### ✅ STEP 3: Update Code (15 min)

**File: `src/data/products.ts`**
```javascript
// ADD THIS AT TOP:
import oversizedTshirt from '@/assets/products/apparel/oversized-tshirt.jpg';
import hoodie from '@/assets/products/apparel/hoodie.jpg';

// FIND THIS PRODUCT:
{
  id: 'tshirt-oversized-1',
  name: 'Oversized T-Shirt',
  // CHANGE THIS LINE:
  image: 'https://images.unsplash.com/...'
  // TO THIS:
  image: oversizedTshirt,
}
```

**File: `src/data/gallery.ts`**
```javascript
// Same pattern as above
// Import images at top
// Then use in galleryItems array
```

**File: `src/pages/CustomizedMerchandise.tsx`**
```javascript
// Update merchandise product images same way
```

---

## 🧪 Test It (5 min)

```bash
# Start dev server
npm run dev

# Check:
# ✓ Home page shows products with brochure images
# ✓ Gallery page shows 12 portfolio items
# ✓ Merchandise page shows product images
# ✓ No 404 errors in Console (F12)
```

---

## 📊 Image Checklist

### Apparel (apparel/)
- [ ] oversized-tshirt.jpg
- [ ] regular-tshirt.jpg
- [ ] hoodie.jpg
- [ ] cap.jpg

### Gifts (gifts/)
- [ ] coffee-mug.jpg
- [ ] magic-mug.jpg
- [ ] water-bottle.jpg
- [ ] keychain.jpg
- [ ] pillow.jpg
- [ ] umbrella.jpg
- [ ] tote-bag.jpg

### Corporate (corporate/)
- [ ] gift-kit.jpg
- [ ] school-uniform.jpg
- [ ] visiting-cards.jpg

### Gallery (gallery/)
- [ ] apparel-1.jpg
- [ ] apparel-2.jpg
- [ ] apparel-3.jpg
- [ ] apparel-4.jpg
- [ ] gifts-1.jpg
- [ ] gifts-2.jpg
- [ ] gifts-3.jpg
- [ ] corporate-1.jpg
- [ ] corporate-2.jpg
- [ ] embroidery-1.jpg
- [ ] embroidery-2.jpg
- [ ] printing-1.jpg

---

## 🚀 After Images Are Added

```bash
# Build for production
npm run build

# Test production build
npm run preview

# Deploy!
```

---

## 🎯 Pro Tips

1. **Optimize first** - Use tinypng.com before adding
2. **Test early** - Add 2-3 images, test, then add rest
3. **Clear cache** - Ctrl+Shift+Delete if images don't show
4. **Hard refresh** - Ctrl+Shift+R (not Ctrl+R)
5. **Check console** - F12 → Console for errors

---

## 📚 Need More Help?

| Question | File to Read |
|----------|-------------|
| How to extract? | IMAGE_INTEGRATION_GUIDE.md |
| Where does each image go? | IMAGE_PLACEMENT_REFERENCE.md |
| Step by step? | IMAGES_CHECKLIST.md |
| Code patterns? | src/utils/imageImports.example.ts |
| Full overview? | BROCHURE_IMAGES_GUIDE.md |

---

## ❌ If Something's Wrong

**Images not showing?**
- Check file path is correct
- File name matches exactly (case-sensitive)
- Clear browser cache (Ctrl+Shift+Delete)
- Restart: `npm run dev`

**Build fails?**
- Check image file exists
- Use forward slashes: `@/assets/...`
- Verify JPG or PNG format

**Build succeeds but no images?**
- Hard refresh: Ctrl+Shift+R
- Check browser console (F12)
- Restart dev server

---

## ✨ Success = Your brochure images on your website!

**Total time: ~1 hour**

```
15 min extract → 20 min organize → 15 min code → 5 min test → DONE! ✅
```

---

**Questions?** Check the detailed guides:
- BROCHURE_IMAGES_GUIDE.md
- IMAGES_CHECKLIST.md  
- IMAGE_PLACEMENT_REFERENCE.md
