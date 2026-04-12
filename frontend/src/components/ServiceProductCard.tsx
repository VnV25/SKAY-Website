import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
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

  const isInWishlist = wishlist.some((item) => item.id === `service-${service.name}`);

  // Convert service to product format
  const serviceAsProduct = {
    id: `service-${service.name}`,
    name: service.name,
    category: categoryName.toLowerCase().replace(/\s+/g, '-'),
    price: service.price || 299,
    originalPrice: service.originalPrice || 499,
    discount: service.discount || 40,
    rating: service.rating || 4.8,
    reviews: service.reviews || 125,
    image: service.image || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80',
    stock: service.stock || 50,
    description: service.description,
    features: service.features || [],
    trending: service.trending || false,
    sizes: service.sizes || ['Custom'],
    colors: service.colors || ['Custom'],
  };

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    addToCart(serviceAsProduct);
    setTimeout(() => setIsAddingToCart(false), 500);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(`service-${service.name}`);
    } else {
      addToWishlist(serviceAsProduct);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
      {/* Discount Badge */}
      {serviceAsProduct.discount > 0 && (
        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
          {serviceAsProduct.discount}% OFF
        </div>
      )}

      {/* Category Badge */}
      <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10 flex items-center gap-1">
        <span>{categoryIcon}</span>
        <span className="hidden sm:inline">{categoryName}</span>
      </div>

      {/* Image */}
      <div className="relative h-64 bg-gradient-to-br from-orange-100 to-orange-50 overflow-hidden">
        <img
          src={serviceAsProduct.image}
          alt={serviceAsProduct.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={() => onQuickView(service)}
            className="bg-white text-gray-900 p-3 rounded-full hover:bg-orange-500 hover:text-white transition-colors"
          >
            <Eye size={20} />
          </button>
          <button
            onClick={handleWishlistToggle}
            className={`p-3 rounded-full transition-colors ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-900 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Stock Indicator */}
        {serviceAsProduct.stock <= 10 && (
          <div className="absolute bottom-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            🔥 Only {serviceAsProduct.stock} slots left!
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
          {serviceAsProduct.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {serviceAsProduct.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < Math.floor(serviceAsProduct.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {serviceAsProduct.rating} ({serviceAsProduct.reviews})
          </span>
        </div>

        {/* Features */}
        {service.features && service.features.length > 0 && (
          <div className="mb-3 space-y-1">
            {service.features.slice(0, 3).map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="text-green-500">✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Min Order */}
        {service.minOrder && (
          <div className="mb-3 bg-blue-50 border border-blue-200 px-3 py-2 rounded-md text-xs text-blue-700 font-semibold">
            📦 {service.minOrder}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-orange-500">
            ₹{serviceAsProduct.price}
          </span>
          {serviceAsProduct.originalPrice > serviceAsProduct.price && (
            <span className="text-sm text-gray-400 line-through">
              ₹{serviceAsProduct.originalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className={`w-full py-3 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
            isAddingToCart
              ? 'bg-green-500 text-white'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {isAddingToCart ? (
            <>
              <span>✓</span>
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingCart size={20} />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
