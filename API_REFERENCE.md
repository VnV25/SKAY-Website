# API Reference & Examples

## Authentication
All admin endpoints require admin authentication. Include token in header:
```
Authorization: Bearer {adminToken}
```

The token is stored in localStorage as `adminToken` after admin login.

---

## Admin Endpoints

### 1. Get Statistics
```bash
GET /api/admin/stats
```

**Response:**
```json
{
  "totalUsers": 150,
  "customersWithLogins": 85,
  "totalProducts": 45,
  "totalOrders": 230,
  "pendingOrders": 12,
  "totalContacts": 45,
  "newContacts": 8,
  "totalRevenue": 125000,
  "lastUpdated": "2024-02-14T10:30:00Z"
}
```

---

### 2. Get Orders
```bash
GET /api/admin/orders?page=1&limit=50&status=pending
```

**Response:**
```json
{
  "orders": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "status": "pending",
      "total": "5000.00",
      "created_at": "2024-02-14T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 230,
    "pages": 5
  }
}
```

---

### 3. Get Contacts/Quotes
```bash
GET /api/admin/contacts?page=1&limit=50&status=new
```

**Response:**
```json
{
  "contacts": [
    {
      "id": "666e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91 9876543210",
      "message": "I'm interested in t-shirts",
      "status": "new",
      "created_at": "2024-02-14T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 45,
    "pages": 1
  }
}
```

---

### 4. Update Order Status
```bash
PUT /api/admin/order/{id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "processing"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "updated_at": "2024-02-14T10:35:00Z"
  }
}
```

---

### 5. Update Contact Status
```bash
PUT /api/admin/contact/{id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "replied",
  "notes": "Sent price quote"
}
```

**Response:**
```json
{
  "success": true,
  "contact": {
    "id": "666e8400-e29b-41d4-a716-446655440000",
    "status": "replied",
    "notes": "Sent price quote",
    "updated_at": "2024-02-14T10:35:00Z"
  }
}
```

---

### 6. Get Assets/Images
```bash
GET /api/admin/assets?type=product&category=tshirts&page=1&limit=50
```

**Response:**
```json
{
  "assets": [
    {
      "id": "777e8400-e29b-41d4-a716-446655440000",
      "name": "Blue T-Shirt",
      "type": "product",
      "category": "tshirts",
      "file_url": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "file_size": 102400,
      "mime_type": "image/jpeg",
      "uploaded_by": "123e4567-e89b-12d3-a456-426614174000",
      "created_at": "2024-02-14T10:30:00Z",
      "updated_at": "2024-02-14T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "pages": 1
  }
}
```

---

### 7. Upload Asset/Image
```bash
POST /api/admin/assets
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Blue T-Shirt",
  "type": "product",
  "category": "tshirts",
  "file_url": "data:image/jpeg;base64,...",
  "file_path": "assets/1707896400000-shirt.jpg",
  "file_size": 102400,
  "mime_type": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "asset": {
    "id": "777e8400-e29b-41d4-a716-446655440000",
    "name": "Blue T-Shirt",
    "type": "product",
    "category": "tshirts",
    "file_url": "data:image/jpeg;base64,...",
    "created_at": "2024-02-14T10:30:00Z"
  }
}
```

---

### 8. Update Asset
```bash
PUT /api/admin/assets/{id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Premium Blue T-Shirt",
  "category": "premium-tshirts"
}
```

**Response:**
```json
{
  "success": true,
  "asset": {
    "id": "777e8400-e29b-41d4-a716-446655440000",
    "name": "Premium Blue T-Shirt",
    "category": "premium-tshirts",
    "updated_at": "2024-02-14T10:35:00Z"
  }
}
```

---

### 9. Delete Asset
```bash
DELETE /api/admin/assets/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

---

## Usage Examples

### Example 1: Admin Dashboard Data Loading

```typescript
import { useEffect, useState } from 'react';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const token = localStorage.getItem('adminToken');

    // Load stats
    const statsRes = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsData = await statsRes.json();
    setStats(statsData);

    // Load orders
    const ordersRes = await fetch('/api/admin/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const ordersData = await ordersRes.json();
    setOrders(ordersData.orders);
  };

  if (!stats || !orders.length) return <div>Loading...</div>;

  return (
    <div>
      <h2>Orders: {stats.totalOrders}</h2>
      <ul>
        {orders.map(order => (
          <li key={order.id}>
            {order.id} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Example 2: Update Status

```typescript
const updateStatus = async (orderId: string, newStatus: string) => {
  const token = localStorage.getItem('adminToken');

  const res = await fetch(`/api/admin/order/${orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: newStatus })
  });

  if (res.ok) {
    const data = await res.json();
    console.log('Order updated:', data.order);
    // Update UI
  } else {
    console.error('Failed to update order');
  }
};

// Usage
await updateStatus('550e8400-e29b-41d4-a716-446655440000', 'processing');
```

---

### Example 3: Upload Image

```typescript
const uploadImage = async (file: File, type: string) => {
  const token = localStorage.getItem('adminToken');

  // Read file as base64
  const reader = new FileReader();
  reader.onload = async (event) => {
    const base64 = event.target?.result as string;

    const res = await fetch('/api/admin/assets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: file.name.split('.')[0],
        type: type,
        file_url: base64,
        file_path: `assets/${Date.now()}-${file.name}`,
        file_size: file.size,
        mime_type: file.type
      })
    });

    if (res.ok) {
      const data = await res.json();
      console.log('Image uploaded:', data.asset);
    }
  };

  reader.readAsDataURL(file);
};

// Usage
await uploadImage(fileInput.files[0], 'product');
```

---

### Example 4: Load and Display Images

```typescript
export function ProductGallery() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    loadProductImages();
  }, []);

  const loadProductImages = async () => {
    const res = await fetch('/api/admin/assets?type=product');
    const { assets } = await res.json();
    setImages(assets);
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map(img => (
        <div key={img.id}>
          <img src={img.file_url} alt={img.name} />
          <p>{img.name}</p>
          <p className="text-sm text-gray-500">{img.category}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### Example 5: Filter Images by Category

```typescript
export function FilteredImages() {
  const [images, setImages] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadImages();
  }, [filter]);

  const loadImages = async () => {
    const query = filter === 'all' 
      ? '' 
      : `?category=${filter}`;
    
    const res = await fetch(`/api/admin/assets${query}`);
    const { assets } = await res.json();
    setImages(assets);
  };

  return (
    <>
      <div className="flex gap-2 mb-4">
        {['all', 'tshirts', 'mugs', 'hoodies'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={filter === cat ? 'bg-blue-500 text-white px-4 py-2' : 'px-4 py-2'}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {images.map(img => (
          <img key={img.id} src={img.file_url} alt={img.name} />
        ))}
      </div>
    </>
  );
}
```

---

### Example 6: Delete Image

```typescript
const deleteImage = async (imageId: string) => {
  if (!confirm('Delete this image?')) return;

  const token = localStorage.getItem('adminToken');

  const res = await fetch(`/api/admin/assets/${imageId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (res.ok) {
    console.log('Image deleted successfully');
    // Refresh image list
  } else {
    console.error('Failed to delete image');
  }
};
```

---

## Error Handling

### Example: Complete Error Handling

```typescript
const loadImages = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const res = await fetch('/api/admin/assets', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401) {
      throw new Error('Admin token expired or invalid');
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    setImages(data.assets);
  } catch (err) {
    console.error('Error loading images:', err);
    setError(err.message);
    // Show error toast to user
  }
};
```

---

## Status Values

### Order Statuses:
- `pending` - Order received, awaiting processing
- `processing` - Order is being prepared
- `completed` - Order finished
- `cancelled` - Order was cancelled

### Contact/Quote Statuses:
- `new` - New inquiry received
- `replied` - Response sent to customer
- `contacted` - Follow-up contact made
- `closed` - Inquiry resolved

---

## Query Parameters

### Pagination:
```
?page=1&limit=50
```

### Filtering:
```
?type=product          # Filter by type
?category=tshirts      # Filter by category
?status=pending        # Filter by status
```

### Combine:
```
GET /api/admin/assets?type=product&category=tshirts&page=1&limit=50
GET /api/admin/orders?status=pending&page=1&limit=20
```

---

## Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Image uploaded |
| 400 | Bad request | Missing required fields |
| 401 | Unauthorized | Invalid or missing token |
| 404 | Not found | Image ID doesn't exist |
| 500 | Server error | Database error |

---

## Rate Limiting

Currently no rate limiting. For production, consider adding:
- Max 10 requests per second per user
- Max file size 10MB per upload
- Max 1000 requests per hour per admin

---

## Testing API with cURL

```bash
# Get stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/stats

# Get orders
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/orders

# Update order status
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"processing"}' \
  http://localhost:3000/api/admin/order/550e8400-e29b-41d4-a716-446655440000

# Get images
curl http://localhost:3000/api/admin/assets

# Delete image
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/assets/777e8400-e29b-41d4-a716-446655440000
```

---

## WebHooks (Future)

Potential webhook events:
- `order.created`
- `order.status_changed`
- `contact.created`
- `asset.uploaded`
- `asset.deleted`

Currently not implemented. Can be added in future versions.

---

Created: April 14, 2026
Last Updated: April 14, 2026
