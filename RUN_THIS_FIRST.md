# 🚀 GET STARTED - Admin Dashboard & Image Management

## What You Need to Do RIGHT NOW

### Step 1: Run Database Migration (5 minutes)

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. **Copy and paste this entire SQL** (from `backend/migrations/create-assets-table.sql`):

```sql
-- ===============================
-- CREATE ASSETS/IMAGES TABLE
-- ===============================
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage assets"
ON public.assets FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Anyone can view assets"
ON public.assets FOR SELECT
USING (true);

CREATE INDEX idx_assets_type ON public.assets(type);
CREATE INDEX idx_assets_category ON public.assets(category);
CREATE INDEX idx_assets_type_category ON public.assets(type, category);
```

5. Click **Run** (or Cmd+Enter)
6. Should see "Success" message ✅

### Step 2: Test the Admin Dashboard (10 minutes)

1. Make sure your application is running:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:5175/admin

3. Login with your admin credentials

4. **You should now see 4 tabs** at the top:
   - Overview
   - Orders
   - Quote Requests
   - Media

### Step 3: Test Each Feature

#### Test Overview Tab:
- Should show real statistics from your database
- Total Orders, Clients, New Quotes, Revenue

#### Test Orders Tab:
- Should show actual orders from your database
- Click "Update Status" button
- Status should cycle: pending → processing → completed → cancelled

#### Test Quote Requests Tab:
- Should show actual contact form submissions
- Click "Update Status" button
- Status should cycle: new → replied → contacted → closed

#### Test Media Tab:
1. Click the upload area
2. Select an image (JPG, PNG, or GIF)
3. Image should upload successfully
4. Should appear in the grid below
5. Click "Edit" to rename
6. Click "Delete" to remove

---

## If Something Doesn't Work

### "No data showing in dashboard"
- Make sure you're logged in as admin
- Check that you have orders/quotes in database
- Check browser console (F12) for errors

### "Can't upload images"
- File must be less than 10MB
- Must be JPG, PNG, or GIF
- Check network connection

### "Update Status button doesn't work"
- Check browser console (F12)
- Verify admin token is in localStorage
- Make sure admin has role='admin' in database

### "SQL migration failed"
- Make sure you have admin access to Supabase
- Try deleting old `assets` table first
- Copy entire SQL exactly as shown above

---

## What Changed

### Fixed Issues:
✅ Admin can now update order statuses
✅ Admin can now update quote/contact statuses
✅ Dashboard shows real data instead of placeholders

### New Features:
✨ Complete image management system
✨ Upload images for products, services, galleries, etc.
✨ Edit image names anytime
✨ Delete images with one click
✨ Filter images by type
✨ Organize images by category

---

## How to Use

### For Updating Actions:
1. Go to Orders or Quote Requests tab
2. Click "Update Status" button
3. Status automatically changes to next in cycle
4. UI updates instantly

### For Managing Images:
1. Go to Media tab
2. Drag & drop image or click to upload
3. Select type (Product, Service, Hero, Gallery, Brochure)
4. View all uploaded images
5. Edit name or delete as needed

---

## File Changes Summary

**New Components:**
- `src/components/ImageManager.tsx` - Image upload/management

**Updated Pages:**
- `src/pages/AdminDashboard.tsx` - Now loads real data!

**Backend Updates:**
- `backend/routes/admin.js` - Added 8 new endpoints

**New Files:**
- `backend/migrations/create-assets-table.sql` - Database schema

**Documentation:**
- `ADMIN_SETUP_QUICK.md` - Quick start
- `ADMIN_UPDATES_GUIDE.md` - Full details
- `IMAGE_INTEGRATION_FRONTEND.md` - How to use images
- `IMPLEMENTATION_SUMMARY.md` - Complete overview

---

## Next: Integrate Images in Frontend

Once images are uploaded, use them in your pages:

```typescript
// In any React component:
const res = await fetch('/api/admin/assets?type=product');
const { assets } = await res.json();

// Display images
{assets.map(img => (
  <img key={img.id} src={img.file_url} alt={img.name} />
))}
```

See `IMAGE_INTEGRATION_FRONTEND.md` for complete examples.

---

## Quick Reference

| Task | Steps |
|------|-------|
| Migrate database | Copy SQL to Supabase → Run |
| Test dashboard | Login → Check 4 tabs |
| Update status | Go to Orders/Quotes → Click "Update Status" |
| Upload image | Go to Media → Drag & drop → Done |
| Edit image name | In Media tab → Click "Edit" → Change name → Save |
| Delete image | In Media tab → Click "Delete" → Confirm |
| Use in frontend | Fetch `/api/admin/assets` → Display images |

---

## Testing Checklist

Before you say it's done:
- [ ] SQL migration ran successfully
- [ ] Admin dashboard loads
- [ ] Overview tab shows real stats
- [ ] Orders tab shows real orders
- [ ] Quotes tab shows real submissions
- [ ] Can update order status
- [ ] Can update quote status
- [ ] Can upload image
- [ ] Can see uploaded images
- [ ] Can edit image name
- [ ] Can delete image

---

## Support

**Not working?**
1. Check browser console (F12) for error messages
2. Check terminal for backend errors
3. Read detailed guides in ADMIN_UPDATES_GUIDE.md
4. Verify all credentials in .env file

**Questions?**
- See `ADMIN_UPDATES_GUIDE.md` for technical details
- See `IMAGE_INTEGRATION_FRONTEND.md` for usage examples
- Check `IMPLEMENTATION_SUMMARY.md` for complete overview

---

## 🎉 You're All Set!

Everything is ready to go. Just run the SQL migration and test the dashboard.

**Estimated Setup Time**: 10-15 minutes

**Status**: ✅ Complete & Ready

---

Created: April 14, 2026
Last Updated: April 14, 2026
