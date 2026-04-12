import { Heart, ShoppingCart, Star, TrendingUp, Flame } from 'lucide-react';
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
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (onQuickView) {
      onQuickView(product);
    } else {
      addToCart(product, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const getLowStockColor = () => {
    if (product.stock <= 3) return 'text-red-500';
    if (product.stock <= 10) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 relative">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.trending && (
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
            <TrendingUp size={12} />
            Trending
          </span>
        )}
        {product.discount && (
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            {product.discount}% OFF
          </span>
        )}
        {product.stock <= 5 && (
          <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 animate-pulse">
            <Flame size={12} />
            Only {product.stock} left!
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
      >
        <Heart
          size={20}
          className={inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}
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
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold">{product.rating}</span>
          </div>
          <span className="text-xs text-gray-500">({product.reviews} reviews)</span>
        </div>

        {/* Name */}
        <h3 
          className="text-lg mb-2 cursor-pointer hover:text-orange-500"
          onClick={() => onQuickView && onQuickView(product)}
        >
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-orange-500">₹{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
          )}
        </div>

        {/* Stock */}
        <div className={`text-xs mb-3 ${getLowStockColor()}`}>
          {product.stock <= 10 ? (
            <span className="font-semibold">
              {product.stock <= 3 ? '⚠️ Almost Gone!' : '🔥 Low Stock'} - {product.stock} remaining
            </span>
          ) : (
            <span className="text-green-600">✓ In Stock</span>
          )}
        </div>

        {/* Sizes Preview */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-1">Available Sizes:</div>
            <div className="flex gap-1">
              {product.sizes.slice(0, 5).map((size) => (
                <span key={size} className="text-xs border border-gray-300 px-2 py-1 rounded">
                  {size}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-2 rounded-md transition-all flex items-center justify-center gap-2 ${
            justAdded
              ? 'bg-green-500 text-white'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          <ShoppingCart size={18} />
          {justAdded ? 'Added to Cart!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}