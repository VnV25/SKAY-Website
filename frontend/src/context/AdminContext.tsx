import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from './ShopContext';
import { products as initialProducts } from '../data/products';
import { api } from '../api/api';

export interface AnnouncementSettings {
  enabled: boolean;
  text: string;
  backgroundColor: string;
  discountCode?: string;
}

export interface SiteSettings {
  announcement: AnnouncementSettings;
  showTrending: boolean;
  showBundles: boolean;
  showWishlist: boolean;
  showCart: boolean;
  showReviews: boolean;
  showStickyCTA: boolean;
  showUrgencyBadges: boolean;
  showDiscountBadges: boolean;
  showRatings: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  text: string;
  rating: number;
  enabled: boolean;
}

interface AdminContextType {
  settings: SiteSettings;
  testimonials: Testimonial[];
  products: Product[];
  updateSettings: (settings: Partial<SiteSettings>) => void;
  updateAnnouncement: (announcement: Partial<AnnouncementSettings>) => void;
  addTestimonial: (testimonial: Omit<Testimonial, 'id'>) => void;
  updateTestimonial: (id: string, testimonial: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;
  toggleTestimonial: (id: string) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const defaultSettings: SiteSettings = {
  announcement: {
    enabled: true,
    text: 'Limited Time Offer! Get up to 40% OFF on all products | Use code: SKAY40',
    backgroundColor: 'from-orange-600 to-red-600',
    discountCode: 'SKAY40',
  },
  showTrending: true,
  showBundles: true,
  showWishlist: true,
  showCart: true,
  showReviews: true,
  showStickyCTA: true,
  showUrgencyBadges: true,
  showDiscountBadges: true,
  showRatings: true,
};

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    company: 'Tech Solutions Inc.',
    text: 'SKAY delivered 200+ branded t-shirts for our corporate event. Quality was exceptional!',
    rating: 5,
    enabled: true,
  },
  {
    id: '2',
    name: 'Priya Sharma',
    company: 'Green Valley School',
    text: 'Best embroidery work on our school uniforms. Very professional and timely delivery.',
    rating: 5,
    enabled: true,
  },
  {
    id: '3',
    name: 'Amit Patel',
    company: 'Marketing Pro',
    text: 'Their magic mugs are a hit with our clients. Great for corporate gifting!',
    rating: 5,
    enabled: true,
  },
];

function normalizeProductsPayload(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.products)) return payload.products;
  return [];
}

function mapBackendProduct(item: any): Product {
  const imagesCandidate = item?.images && typeof item.images === 'object'
    ? Object.values(item.images as Record<string, string>)
    : [];

  const category = typeof item?.category === 'string' ? item.category : 'apparel';

  return {
    id: String(item?._id || item?.id || `product-${Date.now()}`),
    name: item?.name || 'Untitled Product',
    category,
    price: Number(item?.price || 0),
    originalPrice: Number(item?.originalPrice || item?.price || 0),
    image: String(item?.image || imagesCandidate[0] || ''),
    rating: Number(item?.rating || 4.5),
    reviews: Number(item?.reviews || 0),
    stock: Number(item?.stock || 0),
    sizes: Array.isArray(item?.sizes) ? item.sizes : [],
    colors: Array.isArray(item?.colors)
      ? item.colors.map((c: any) => (typeof c === 'string' ? c : c?.name)).filter(Boolean)
      : [],
    trending: Boolean(item?.featured || item?.trending),
    discount: Number(item?.discount || 0),
    description: item?.description || '',
  } as Product;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    const savedSettings = localStorage.getItem('skay-admin-settings');
    const savedTestimonials = localStorage.getItem('skay-admin-testimonials');
    const savedProducts = localStorage.getItem('skay-admin-products');

    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedTestimonials) setTestimonials(JSON.parse(savedTestimonials));
    if (savedProducts) {
      const parsed = JSON.parse(savedProducts);
      if (Array.isArray(parsed)) setProducts(parsed);
    }

    api.products
      .list()
      .then((data: any) => {
        console.log('[AdminContext] products payload:', data);
        const backendProducts = normalizeProductsPayload(data);

        if (backendProducts.length > 0) {
          setProducts(backendProducts.map(mapBackendProduct));
          return;
        }

        if (!savedProducts) {
          setProducts(initialProducts);
        }
      })
      .catch((error) => {
        console.error('[AdminContext] failed to load products:', error);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('skay-admin-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('skay-admin-testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem('skay-admin-products', JSON.stringify(products));
  }, [products]);

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateAnnouncement = (announcement: Partial<AnnouncementSettings>) => {
    setSettings((prev) => ({
      ...prev,
      announcement: { ...prev.announcement, ...announcement },
    }));
  };

  const addTestimonial = (testimonial: Omit<Testimonial, 'id'>) => {
    const newTestimonial = {
      ...testimonial,
      id: Date.now().toString(),
    };
    setTestimonials((prev) => [...prev, newTestimonial]);
  };

  const updateTestimonial = (id: string, testimonial: Partial<Testimonial>) => {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, ...testimonial } : t)));
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTestimonial = (id: string) => {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      await api.products.update(id, product);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...product } : p)));
    } catch (error) {
      console.error('Failed to update product', error);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...product } : p)));
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const created = await api.products.create(product);
      const payload = created?.product || created?.data?.[0] || created;
      const mapped = mapBackendProduct(payload || { ...product, id: `product-${Date.now()}` });
      setProducts((prev) => [...prev, mapped]);
    } catch (error) {
      console.error('Failed to create product', error);
      setProducts((prev) => [...prev, { ...product, id: `product-${Date.now()}` }]);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.products.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product', error);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const resetProducts = () => {
    if (confirm('Reset all products to default? This cannot be undone.')) {
      setProducts(initialProducts);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        settings,
        testimonials,
        products,
        updateSettings,
        updateAnnouncement,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        toggleTestimonial,
        updateProduct,
        addProduct,
        deleteProduct,
        resetProducts,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
