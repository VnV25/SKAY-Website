import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  sizes?: string[];
  colors?: string[];
  trending?: boolean;
  discount?: number;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  customDesign?: string;
}

interface ShopContextType {
  cart: CartItem[];
  wishlist: Product[];
  recentlyViewed: Product[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string, customDesign?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: () => Promise<void>;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  addToRecentlyViewed: (product: Product) => void;
  cartCount: number;
  cartTotal: number;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const { customerUser } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const userStorageKey = customerUser?.id || 'guest';
  const cartStorageKey = `skay-cart:${userStorageKey}`;
  const wishlistStorageKey = `skay-wishlist:${userStorageKey}`;
  const recentStorageKey = 'skay-recent';

  useEffect(() => {
    const savedCart = sessionStorage.getItem(cartStorageKey);
    const savedWishlist = sessionStorage.getItem(wishlistStorageKey);
    const savedRecent = sessionStorage.getItem(recentStorageKey);
    
    setCart(savedCart ? JSON.parse(savedCart) : []);
    setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
    setRecentlyViewed(savedRecent ? JSON.parse(savedRecent) : []);
  }, [cartStorageKey, wishlistStorageKey, recentStorageKey]);

  useEffect(() => {
    sessionStorage.setItem(cartStorageKey, JSON.stringify(cart));
  }, [cart, cartStorageKey]);

  useEffect(() => {
    sessionStorage.setItem(wishlistStorageKey, JSON.stringify(wishlist));
  }, [wishlist, wishlistStorageKey]);

  useEffect(() => {
    sessionStorage.setItem(recentStorageKey, JSON.stringify(recentlyViewed));
  }, [recentlyViewed, recentStorageKey]);

  const addToCart = (product: Product, quantity = 1, size?: string, color?: string, customDesign?: string) => {
    setCart(prev => {
      const existingItem = prev.find(item => 
        item.id === product.id && 
        item.selectedSize === size && 
        item.selectedColor === color
      );

      if (existingItem) {
        return prev.map(item =>
          item.id === product.id && item.selectedSize === size && item.selectedColor === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { ...product, quantity, selectedSize: size, selectedColor: color, customDesign }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const checkout = async () => {
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    // Transform cart items to order format
    const orderItems = cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      size: item.selectedSize,
      color: item.selectedColor,
      image: item.image,
    }));

    const orderData = {
      items: orderItems,
      total: cartTotal,
    };

    try {
      const token = sessionStorage.getItem('customerToken') || localStorage.getItem('customerToken');
      if (!token) {
        throw new Error('Please log in before placing an order.');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      // Clear cart after successful order
      clearCart();
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  };

  const addToWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item.id !== product.id);
      return [product, ...filtered].slice(0, 8);
    });
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        recentlyViewed,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        checkout,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        addToRecentlyViewed,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within ShopProvider');
  }
  return context;
}
