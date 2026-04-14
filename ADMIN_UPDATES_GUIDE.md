# Admin Dashboard - Updates & Image Management Feature

## Overview
The admin dashboard has been completely updated with real data integration and a new image management system.

## What's Fixed

### 1. ✅ Admin Dashboard Action Updates
- **Before**: Hardcoded placeholder data, no ability to update statuses
- **After**: 
  - Real-time data loading from database
  - Live stats showing actual counts
  - Ability to update order and quote request statuses
  - Real-time UI updates after status changes

**How to use:**
1. Go to `http://localhost:5175/admin`
2. Login with admin credentials
3. Click on "Orders" or "Quote Requests" tabs
4. Click "Update Status" button on any item to change its status
5. Status cycles through predefined values:
   - Orders: pending → processing → completed → cancelled
   - Quotes: new → replied → contacted → closed

### 2. ✅ New Image Management Feature
A complete image management system for admin to upload, delete, and modify images throughout the website.

**Location**: Admin Dashboard → Media tab

**Features**:
- **Upload Images**: Drag & drop or click to upload
  - Supported: PNG, JPG, GIF
  - Max size: 10MB
  - Automatically categorized by type

- **Organize by Type**: Filter images by category
  - Product images
  - Service images
  - Hero/Banner images
  - Gallery images
  - Brochure images

- **Edit Images**: Rename uploaded images without re-uploading

- **Delete Images**: Remove images from website with one click

- **Preview**: See thumbnail of uploaded images

---

## Technical Implementation

### Database Changes

#### New Table: `assets`
```sql
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'product', 'service', 'hero', 'gallery', 'brochure'
  category TEXT,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Run this migration on Supabase:**
1. Go to Supabase → SQL Editor
2. Create new query
3. Paste contents of `backend/migrations/create-assets-table.sql`
4. Run query

### New API Endpoints

#### Get Assets
```
GET /api/admin/assets?type=product&category=tshirts&page=1&limit=50
```

#### Upload Asset
```
POST /api/admin/assets
Body: {
  "name": "Blue T-Shirt",
  "type": "product",
  "category": "tshirts",
  "file_url": "data:image/...",
  "file_path": "assets/...",
  "file_size": 102400,
  "mime_type": "image/jpeg"
}
```

#### Update Asset
```
PUT /api/admin/assets/:id
Body: {
  "name": "New Name",
  "category": "new_category"
}
```

#### Delete Asset
```
DELETE /api/admin/assets/:id
```

#### Update Order Status
```
PUT /api/admin/order/:id
Body: { "status": "processing" }
```

#### Update Contact/Quote Status
```
PUT /api/admin/contact/:id
Body: { "status": "replied" }
```

---

## Setup Instructions

### Step 1: Run Database Migration
1. Open Supabase Console
2. Go to SQL Editor
3. Run the SQL from `backend/migrations/create-assets-table.sql`

### Step 2: Create Storage Bucket (Optional)
For production image storage:
1. Go to Supabase → Storage
2. Create new bucket named `assets`
3. Enable public access for images
4. Update `file_url` in ImageManager to use Supabase Storage URLs

### Step 3: Test in Admin Dashboard
1. Start the application
2. Login to admin dashboard
3. Navigate to "Media" tab
4. Upload test images
5. Try edit/delete functions

### Step 4: Update Frontend Components
To display uploaded images in products/services:
```typescript
// Example usage
const productImage = assets.find(a => a.category === 'tshirts')[0];
<img src={productImage.file_url} alt={productImage.name} />
```

---

## File Changes

### Modified Files:
1. **src/pages/AdminDashboard.tsx**
   - Added real data loading from API
   - Added navigation tabs (Overview, Orders, Quotes, Media)
   - Added status update functionality
   - Integrated ImageManager component

2. **backend/routes/admin.js**
   - Added `PUT /api/admin/order/:id` - Update order status
   - Added `PUT /api/admin/contact/:id` - Update contact status
   - Added `GET /api/admin/assets` - List assets
   - Added `POST /api/admin/assets` - Create asset
   - Added `PUT /api/admin/assets/:id` - Update asset
   - Added `DELETE /api/admin/assets/:id` - Delete asset

### New Files:
1. **src/components/ImageManager.tsx**
   - Complete image upload/delete/edit component
   - Filter by asset type
   - Drag & drop support
   - Real-time preview

2. **backend/migrations/create-assets-table.sql**
   - Database schema for assets table
   - RLS policies for admin access

---

## Known Limitations & Improvements

### Current State:
- Images stored as base64 in database (for testing)
- File URLs are data URLs (data:image/...)

### Recommended for Production:
1. **Use Supabase Storage** for actual file storage
   - Modify ImageManager to upload to Supabase Storage first
   - Store returned URL in database

2. **Add Image Validation**
   - Verify dimensions
   - Optimize for web (compression)
   - Generate thumbnails

3. **Add Bulk Operations**
   - Batch upload multiple files
   - Bulk delete
   - Bulk category assignment

4. **Add Image Editor**
   - Crop/resize before upload
   - Add filters
   - Watermarking support

5. **Add Usage Tracking**
   - Show where each image is used
   - Warn before deleting in-use images
   - Usage statistics

---

## Troubleshooting

### Issue: Status update not working
**Solution**: Make sure `adminToken` is stored in localStorage. Check browser console for errors.

### Issue: Image upload fails
**Solution**: 
- Check file size (must be < 10MB)
- Verify token in localStorage
- Check browser console for error details

### Issue: Images not showing
**Solution**:
- In production, ensure Supabase Storage bucket is configured
- Update file_url to use Supabase URL instead of data URL
- Check CORS settings for image domains

### Issue: Database migration fails
**Solution**:
- Make sure you're running as admin in Supabase
- Delete old `assets` table if it exists
- Check RLS policies are enabled

---

## Next Steps

1. ✅ Test admin dashboard with real data
2. ✅ Test image upload/delete functionality
3. 🔲 **TODO**: Connect images to product pages
4. 🔲 **TODO**: Create image category management
5. 🔲 **TODO**: Add image usage statistics
6. 🔲 **TODO**: Deploy to production with Supabase Storage

---

## Questions or Issues?

If you encounter any problems:
1. Check the browser console (F12) for error messages
2. Check the terminal for backend errors
3. Verify database connection in Supabase
4. Ensure admin token is valid in localStorage

---

**Last Updated**: April 14, 2026
**Status**: Ready for Testing ✅
