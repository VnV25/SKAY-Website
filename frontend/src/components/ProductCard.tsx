import { Heart, ShoppingCart, Star, TrendingUp, Flame, Minus, Plus } from 'lucide-react';
import { Product } from '../context/ShopContext';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShop();
  const { settings } = useAdmin();
  const [justAdded, setJustAdded] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (onQuickView) {
      onQuickView(product);
    } else {
      addToCart(product, Math.max(1, quantity));
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(0, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(product.stock || current + 1, current + 1));
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const getStockLabel = () => {
    if (product.stock <= 3) return { text: '⚠️ Almost Gone!', class: 'text-red-400' };
    if (product.stock <= 10) return { text: '🔥 Low Stock', class: 'text-orange-400' };
    return { text: '✓ In Stock', class: 'text-green-400' };
  };

  const stockInfo = getStockLabel();

  return (
    <div className="group relative bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl overflow-hidden
      shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">

      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.trending && (
          <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
            <TrendingUp size={11} />
            Trending
          </span>
        )}
        {product.discount && (
          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md">
            {product.discount}% OFF
          </span>
        )}
        {product.stock <= 5 && (
          <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 animate-pulse shadow-md">
            <Flame size={11} />
            Only {product.stock} left!
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 z-10 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full p-2 hover:bg-white/25 hover:scale-110 transition-all duration-200 shadow-md"
      >
        <Heart
          size={18}
          className={inWishlist ? 'fill-red-400 text-red-400' : 'text-white/70'}
        />
      </button>

      {/* Image */}
      <div
        className="relative h-48 overflow-hidden cursor-pointer"
        onClick={() => onQuickView && onQuickView(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <Star size={13} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-white/90">{product.rating}</span>
          </div>
          <span className="text-xs text-white/40">({product.reviews} reviews)</span>
        </div>

        {/* Name */}
        <h3
          className="text-sm font-semibold text-white/90 leading-snug cursor-pointer hover:text-pink-400 transition-colors duration-200 line-clamp-2"
          onClick={() => onQuickView && onQuickView(product)}
        >
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            ₹{product.price}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-white/35 line-through">₹{product.originalPrice}</span>
          )}
        </div>

        {/* Stock */}
        <div className={`text-xs font-semibold ${stockInfo.class}`}>
          {product.stock <= 10
            ? `${stockInfo.text} — ${product.stock} remaining`
            : stockInfo.text}
        </div>

        {/* Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div>
            <div className="text-xs text-white/40 mb-1">Available Sizes:</div>
            <div className="flex gap-1 flex-wrap">
              {product.sizes.slice(0, 5).map((size) => (
                <span
                  key={size}
                  className="text-xs border border-white/20 bg-white/5 text-white/60 px-2 py-0.5 rounded-md"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2">
          <span className="text-xs font-semibold text-white/60">Qty</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decreaseQuantity}
              disabled={quantity <= 0}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 border border-white/15 text-white/70 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 transition-all duration-200"
              aria-label={`Decrease ${product.name} quantity`}
            >
              <Minus size={12} />
            </button>
            <span className="w-6 text-center text-sm font-bold text-white">{quantity}</span>
            <button
              type="button"
              onClick={increaseQuantity}
              disabled={quantity >= product.stock}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 border border-white/15 text-white/70 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 transition-all duration-200"
              aria-label={`Increase ${product.name} quantity`}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 ${
            justAdded
              ? 'bg-green-500/80 text-white border border-green-400/30'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:brightness-110 hover:scale-[1.02] shadow-lg shadow-pink-500/20'
          }`}
        >
          <ShoppingCart size={16} />
          {justAdded ? 'Added to Cart!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
