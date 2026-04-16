# How to Use Uploaded Images in Frontend

This guide shows how to integrate the admin-uploaded images into your website pages.

## Basic Usage

### 1. Load Images from Database

```typescript
import { useEffect, useState } from 'react';

export function ProductPage() {
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    loadProductImages();
  }, []);

  const loadProductImages = async () => {
    try {
      // Fetch all product images
      const res = await fetch('/api/admin/assets?type=product');
      const data = await res.json();
      setImages(data.assets);
    } catch (err) {
      console.error('Error loading images:', err);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map(img => (
        <div key={img.id}>
          <img src={img.file_url} alt={img.name} />
          <p>{img.name}</p>
        </div>
      ))}
    </div>
  );
}
```

### 2. Load Images by Category

```typescript
// Get only T-shirt product images
const res = await fetch('/api/admin/assets?type=product&category=tshirts');
const { assets } = await res.json();

// Load ServicePage images
const res = await fetch('/api/admin/assets?type=service');
const { assets } = await res.json();

// Load Hero banner images
const res = await fetch('/api/admin/assets?type=hero');
const { assets } = await res.json();
```

## Common Integration Points

### Homepage Hero Section

```typescript
import { useState, useEffect } from 'react';

export function HomeHero() {
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    loadHeroImage();
  }, []);

  const loadHeroImage = async () => {
    try {
      const res = await fetch('/api/admin/assets?type=hero&limit=1');
      const { assets } = await res.json();
      if (assets.length > 0) {
        setHeroImage(assets[0].file_url);
      }
    } catch (err) {
      console.error('Error loading hero image:', err);
    }
  };

  return (
    <section 
      className="min-h-96 bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Hero content */}
    </section>
  );
}
```

### Product Listing

```typescript
import { useState, useEffect } from 'react';

export function Products() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const res = await fetch('/api/admin/assets?type=product');
    const { assets } = await res.json();
    setProducts(assets);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map(product => (
        <div key={product.id} className="border rounded-lg overflow-hidden">
          <img 
            src={product.file_url} 
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="font-bold">{product.name}</h3>
            <p className="text-gray-600 text-sm">Category: {product.category}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Services Page

```typescript
export function Services() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const res = await fetch('/api/admin/assets?type=service');
    const { assets } = await res.json();
    setServices(assets);
  }, []);

  return (
    <div className="space-y-8">
      {services.map((service, index) => (
        <div key={service.id} className="flex gap-8">
          {index % 2 === 0 ? (
            <>
              <img 
                src={service.file_url} 
                alt={service.name}
                className="w-96 h-64 object-cover rounded"
              />
              <div>
                <h3 className="text-2xl font-bold mb-4">{service.name}</h3>
                {/* Service description */}
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-2xl font-bold mb-4">{service.name}</h3>
                {/* Service description */}
              </div>
              <img 
                src={service.file_url} 
                alt={service.name}
                className="w-96 h-64 object-cover rounded"
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Gallery Page

```typescript
export function Gallery() {
  const [images, setImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const res = await fetch('/api/admin/assets?type=gallery');
    const { assets } = await res.json();
    setImages(assets);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map(img => (
          <img
            key={img.id}
            src={img.file_url}
            alt={img.name}
            onClick={() => setSelectedImage(img.file_url)}
            className="cursor-pointer hover:opacity-80 transition-opacity rounded"
          />
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="Full size"
            className="max-w-4xl max-h-screen"
          />
        </div>
      )}
    </>
  );
}
```

## Advanced Usage

### Image with Lazy Loading

```typescript
export function LazyImage({ src, alt }: { src: string; alt: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="overflow-hidden bg-gray-100 rounded">
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
```

### Image with Fallback

```typescript
export function SafeImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">Image not available</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="w-full"
    />
  );
}
```

### Image Grid with Caching

```typescript
import { useState, useEffect } from 'react';

// Cache images to avoid repeated API calls
const imageCache = new Map<string, any[]>();

export function ImageGrid({ type }: { type: string }) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, [type]);

  const loadImages = async () => {
    // Check cache first
    if (imageCache.has(type)) {
      setImages(imageCache.get(type)!);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/assets?type=${type}`);
      const { assets } = await res.json();
      
      // Store in cache
      imageCache.set(type, assets);
      setImages(assets);
    } catch (err) {
      console.error('Error loading images:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading images...</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map(img => (
        <img key={img.id} src={img.file_url} alt={img.name} />
      ))}
    </div>
  );
}
```

## API Reference

### Get Assets
```bash
GET /api/admin/assets
  ?type=product          # Filter by type
  &category=tshirts      # Filter by category
  &page=1               # Pagination
  &limit=50             # Results per page

Response:
{
  "assets": [
    {
      "id": "...",
      "name": "Blue T-Shirt",
      "type": "product",
      "category": "tshirts",
      "file_url": "data:image/jpeg;base64,...",
      "file_size": 102400,
      "mime_type": "image/jpeg",
      "created_at": "2024-02-14T10:30:00Z"
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

## Best Practices

1. **Cache Images**: Store fetched images in state to avoid repeated API calls
2. **Lazy Load**: Use React's lazy loading for large image lists
3. **Error Handling**: Always handle image loading errors gracefully
4. **Responsive Images**: Use CSS to make images responsive
5. **Optimization**: For production, optimize images before uploading:
   - Use JPG for photos
   - Use PNG for graphics with transparency
   - Keep file sizes under 5MB
   - Compress before uploading

## Troubleshooting

**Images not showing?**
- Check the file_url in browser console
- Verify image file actually exists
- Check CORS settings if using external storage

**API returns 401?**
- Not authenticated as admin
- Use public endpoint instead: GET /api/assets (without /admin)

**Images load slowly?**
- Consider implementing caching
- Optimize image sizes
- Use lazy loading

## Example: Complete Product Page

```typescript
import { useState, useEffect } from 'react';

export function CompleteProductPage() {
  const [allImages, setAllImages] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadAllImages();
  }, []);

  const loadAllImages = async () => {
    const res = await fetch('/api/admin/assets?type=product');
    const { assets } = await res.json();
    setAllImages(assets);
  };

  const categories = Array.from(new Set(allImages.map(img => img.category)));
  const filteredImages = selectedCategory === 'all' 
    ? allImages
    : allImages.filter(img => img.category === selectedCategory);

  return (
    <div>
      {/* Category Filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded ${
            selectedCategory === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded ${
              selectedCategory === cat
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredImages.map(img => (
          <div key={img.id} className="border rounded-lg overflow-hidden hover:shadow-lg">
            <img 
              src={img.file_url}
              alt={img.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold">{img.name}</h3>
              <p className="text-gray-600 text-sm">{img.category}</p>
              <button className="mt-4 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

**Created**: April 14, 2026
**Last Updated**: April 14, 2026
