# Admin Dashboard Updates - Quick Setup

## What's New

### ✅ Fixed Issues
1. **Admin Dashboard Action Updates** - Admins can now update order and quote request statuses
2. **New Image Management System** - Upload, delete, and manage all website images from one place

## Quick Start

### 1. Run Database Migration
```sql
-- Paste this in Supabase SQL Editor and run:
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

### 2. Test the Changes

**Login to Admin:**
1. Visit `http://localhost:5175/admin`
2. Enter admin email and password
3. You should see the new tabbed interface

**Test Status Updates:**
1. Go to "Orders" tab
2. Click "Update Status" button on any order
3. Status should cycle through: pending → processing → completed → cancelled
4. Same for "Quote Requests" - cycles through: new → replied → contacted → closed

**Test Image Management:**
1. Go to "Media" tab
2. Click upload area or drag & drop an image
3. Select image type (Product, Service, Hero, Gallery, Brochure)
4. Click "Edit" to rename
5. Click "Delete" to remove

## New Admin Features

### Feature 1: Real-Time Dashboard
- **Overview Tab**: Live statistics showing:
  - Total Orders
  - Total Clients
  - New Quotes
  - Revenue

- **Orders Tab**: Full order management with status updates
- **Quote Requests Tab**: Manage customer quotes with status tracking
- **Media Tab**: Complete image management system

### Feature 2: Image Management
Upload and manage all images for:
- Products (T-shirts, mugs, hoodies, etc.)
- Services
- Hero/Banner images
- Gallery images
- Marketing materials

## Files Modified

1. `src/pages/AdminDashboard.tsx` - Main dashboard with tabs and real data
2. `src/components/ImageManager.tsx` - NEW: Image upload/management component
3. `backend/routes/admin.js` - Added image and status update endpoints
4. `backend/migrations/create-assets-table.sql` - NEW: Database schema

## Troubleshooting

**Problem**: Status update button doesn't work
- Check admin token is stored in localStorage
- Verify admin user has role='admin' in database
- Check browser console (F12) for errors

**Problem**: Can't upload images
- Ensure file is < 10MB
- Try a different image format (JPG, PNG, GIF)
- Check network connection

**Problem**: No data showing in dashboard
- Confirm you're logged in as admin
- Check that database has orders/contacts
- Verify API endpoints are accessible

## Database Structure

### assets table
Stores metadata about uploaded images:
- `id`: Unique identifier
- `name`: Image name (editable)
- `type`: Category (product, service, hero, gallery, brochure)
- `category`: Specific category (e.g., 'tshirts', 'mugs')
- `file_url`: Where the image is stored
- `file_path`: Storage path
- `file_size`: Image size in bytes
- `mime_type`: Image type (image/jpeg, etc.)
- `uploaded_by`: Admin who uploaded
- `created_at`: Upload date
- `updated_at`: Last modification date

## API Endpoints Added

```
GET  /api/admin/assets                    - List all images
POST /api/admin/assets                    - Upload new image
PUT  /api/admin/assets/:id               - Update image name/category
DELETE /api/admin/assets/:id             - Delete image

PUT  /api/admin/order/:id                - Update order status
PUT  /api/admin/contact/:id              - Update quote status
```

## Next Steps

1. ✅ Test status updates
2. ✅ Test image uploads
3. 🔲 Update product pages to use uploaded images
4. 🔲 Create image galleries from uploaded photos
5. 🔲 Add bulk operations (batch upload, etc.)

## Support

For issues or questions:
1. Check the browser console (F12) for JavaScript errors
2. Check terminal for backend errors
3. Review ADMIN_UPDATES_GUIDE.md for detailed info
4. Ensure all environment variables are set correctly

---

**Created**: April 14, 2026
**Status**: Ready to Use ✅
