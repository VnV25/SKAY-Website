/**
 * ServiceProductCard
 * Dark glass design — matches the rest of the site.
 * Logic (cart, wishlist, quantity) is unchanged.
 */
import { ShoppingCart, Heart, Eye, Star, Minus, Plus, TrendingUp } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ServiceItem } from '../data/services';
import { useState } from 'react';

interface ServiceProductCardProps {
  service: ServiceItem;
  categoryName: string;
  categoryIcon: string;
  onQuickView: (service: ServiceItem) => void;
}

export function ServiceProductCard({ service, categoryName, categoryIcon, onQuickView }: ServiceProductCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useShop();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const isInWishlist = wishlist.some(item => item.id === `service-${service.name}`);

  // Convert service to product shape — logic unchanged
  const serviceAsProduct = {
    id:            `service-${service.name}`,
    name:          service.name,
    category:      categoryName.toLowerCase().replace(/\s+/g, '-'),
    price:         service.price         ?? 299,
    originalPrice: service.originalPrice ?? 499,
    discount:      service.discount      ?? 40,
    rating:        service.rating        ?? 4.8,
    reviews:       service.reviews       ?? 125,
    image:         service.image         ?? '/assets/img433.jpg',
    stock:         service.stock         ?? 50,
    description:   service.description,
    trending:      service.trending      ?? false,
    sizes:         service.sizes         ?? ['Custom'],
    colors:        service.colors        ?? ['Custom'],
  };

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    addToCart(serviceAsProduct, quantity);
    setTimeout(() => setIsAddingToCart(false), 1500);
  };

  const handleWishlistToggle = () => {
    isInWishlist
      ? removeFromWishlist(`service-${service.name}`)
      : addToWishlist(serviceAsProduct);
  };

  const hasDiscount = serviceAsProduct.discount > 0;

  return (
    <div className="group relative bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">

      {/* ── Badges ── */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {hasDiscount && (
          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-md">
            -{serviceAsProduct.discount}%
          </span>
        )}
        {serviceAsProduct.trending && (
          <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
            <TrendingUp size={10} /> Hot
          </span>
        )}
        {serviceAsProduct.stock <= 10 && (
          <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold animate-pulse shadow-md">
            🔥 {serviceAsProduct.stock} left
          </span>
        )}
      </div>

      {/* Category badge */}
      <div className="absolute top-3 right-3 z-10 bg-white/15 backdrop-blur-sm border border-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
        <span>{categoryIcon}</span>
      </div>

      {/* ── Image ── */}
      <div className="relative h-56 overflow-hidden cursor-pointer" onClick={() => onQuickView(service)}>
        <img
          src={serviceAsProduct.image}
          alt={serviceAsProduct.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={e => { e.stopPropagation(); onQuickView(service); }}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white flex items-center justify-center hover:bg-white/30 transition-all"
            aria-label="Quick view"
          >
            <Eye size={17} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); handleWishlistToggle(); }}
            className={`w-10 h-10 rounded-full backdrop-blur-sm border border-white/25 flex items-center justify-center transition-all ${
              isInWishlist
                ? 'bg-red-500/80 text-white'
                : 'bg-white/15 text-white hover:bg-red-500/60'
            }`}
            aria-label="Wishlist"
          >
            <Heart size={17} fill={isInWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4 space-y-3">

        {/* Name */}
        <h3
          className="text-sm font-bold text-white/90 leading-snug line-clamp-2 cursor-pointer hover:text-pink-300 transition-colors"
          onClick={() => onQuickView(service)}
        >
          {serviceAsProduct.name}
        </h3>

        {/* Description */}
        <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{serviceAsProduct.description}</p>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12}
                className={i < Math.floor(serviceAsProduct.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'} />
            ))}
          </div>
          <span className="text-white/50 text-xs">{serviceAsProduct.rating} ({serviceAsProduct.reviews})</span>
        </div>

        {/* Features */}
        {service.features && service.features.length > 0 && (
          <div className="space-y-0.5">
            {service.features.slice(0, 3).map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-white/55">
                <span className="text-green-400 flex-shrink-0">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        )}

        {/* Min order */}
        {service.minOrder && (
          <div className="bg-blue-500/15 border border-blue-500/25 px-3 py-1.5 rounded-lg text-xs text-blue-300 font-semibold">
            📦 {service.minOrder}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            ₹{serviceAsProduct.price}
          </span>
          {serviceAsProduct.originalPrice > serviceAsProduct.price && (
            <span className="text-xs text-white/35 line-through">₹{serviceAsProduct.originalPrice}</span>
          )}
        </div>

        {/* Quantity */}
        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <span className="text-xs font-semibold text-white/55">Qty</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 text-white/70 hover:bg-white/20 flex items-center justify-center disabled:opacity-30 transition-all"
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </button>
            <span className="w-5 text-center text-sm font-bold text-white">{quantity}</span>
            <button
              onClick={() => setQuantity(q => Math.min(serviceAsProduct.stock, q + 1))}
              disabled={quantity >= serviceAsProduct.stock}
              className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 text-white/70 hover:bg-white/20 flex items-center justify-center disabled:opacity-30 transition-all"
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 ${
            isAddingToCart
              ? 'bg-green-500/80 text-white border border-green-400/30'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:brightness-110 hover:scale-[1.02] shadow-lg shadow-pink-500/20'
          }`}
        >
          <ShoppingCart size={16} />
          {isAddingToCart ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
