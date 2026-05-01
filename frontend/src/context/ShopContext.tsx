import { createContext, useContext, useState, ReactNode } from "react";

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
  variants?: {
    sleeves?: string[];
    types?: string[];
  };
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedSleeve?: string;
  selectedType?: string;
  selectedNeck?: string;
  customDesign?: string;
}

interface ShopContextType {
  cart: CartItem[];
  wishlist: Product[];
  recentlyViewed: Product[];
  addToCart: (
    product: Product,
    quantity?: number,
    size?: string,
    color?: string,
    customDesign?: string,
    sleeve?: string,
    type?: string,
    neck?: string
  ) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  addToRecentlyViewed: (product: Product) => void;
  cartCount: number;
  cartTotal: number;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (
    product: Product,
    quantity = 1,
    size?: string,
    color?: string,
    customDesign?: string,
    sleeve?: string,
    type?: string,
    neck?: string
  ) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          i.id === product.id &&
          i.selectedSize === size &&
          i.selectedColor === color &&
          i.selectedSleeve === sleeve &&
          i.selectedType === type &&
          i.selectedNeck === neck
      );

      if (existing) {
        return prev.map((i) =>
          i.id === product.id &&
          i.selectedSize === size &&
          i.selectedColor === color &&
          i.selectedSleeve === sleeve &&
          i.selectedType === type &&
          i.selectedNeck === neck
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }

      return [
        ...prev,
        {
          ...product,
          quantity,
          selectedSize: size,
          selectedColor: color,
          selectedSleeve: sleeve,
          selectedType: type,
          selectedNeck: neck,
          customDesign,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  };

  const clearCart = () => setCart([]);

  const addToWishlist = (product: Product) => {
    setWishlist((prev) =>
      prev.find((i) => i.id === product.id) ? prev : [...prev, product]
    );
  };

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((i) => i.id !== id));
  };

  const isInWishlist = (id: string) => wishlist.some((i) => i.id === id);

  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 8);
    });
  };

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
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
