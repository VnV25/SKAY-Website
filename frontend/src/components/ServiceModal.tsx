import { X, ShoppingCart, Heart, Star, Check } from 'lucide-react';
import { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ServiceItem } from '../data/services';

interface ServiceModalProps {
  service: ServiceItem | null;
  categoryName: string;
  categoryIcon: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceModal({ service, categoryName, categoryIcon, isOpen, onClose }: ServiceModalProps) {
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useShop();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (!service || !isOpen) return null;

  const serviceAsProduct = {
    id: `service-${service.name}`,
    name: service.name,
    category: categoryName.toLowerCase().replace(/\s+/g, '-'),
    price: service.price || 299,
    originalPrice: service.originalPrice || 499,
    discount: service.discount || 40,
    rating: service.rating || 4.8,
    reviews: service.reviews || 125,
    image: service.image || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    stock: service.stock || 50,
    description: service.description,
    features: service.features || [],
    trending: service.trending || false,
    sizes: service.sizes || ['Custom'],
    colors: service.colors || ['Custom'],
  };

  const isInWishlist = wishlist.some((item) => item.id === serviceAsProduct.id);

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    for (let i = 0; i < quantity; i++) {
      addToCart(serviceAsProduct);
    }
    setTimeout(() => {
      setIsAddingToCart(false);
      onClose();
    }, 800);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(serviceAsProduct.id);
    } else {
      addToWishlist(serviceAsProduct);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl bg-white rounded-lg shadow-2xl z-50 overflow-hidden animate-in zoom-in-95">
        <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
          {/* Image Section */}
          <div className="md:w-1/2 relative bg-gradient-to-br from-orange-100 to-orange-50">
            <img
              src={serviceAsProduct.image}
              alt={serviceAsProduct.name}
              className="w-full h-64 md:h-full object-cover"
            />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {serviceAsProduct.discount > 0 && (
                <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                  {serviceAsProduct.discount}% OFF
                </div>
              )}
              <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <span>{categoryIcon}</span>
                <span>{categoryName}</span>
              </div>
            </div>

            {serviceAsProduct.stock <= 10 && (
              <div className="absolute bottom-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                🔥 Only {serviceAsProduct.stock} slots left!
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="md:w-1/2 p-6 md:p-8 relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            {/* Category */}
            <div className="text-sm text-orange-500 font-semibold mb-2 flex items-center gap-2">
              <span>{categoryIcon}</span>
              <span>{categoryName}</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold mb-3">{serviceAsProduct.name}</h2>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.floor(serviceAsProduct.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {serviceAsProduct.rating} ({serviceAsProduct.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-bold text-orange-500">
                ₹{serviceAsProduct.price}
              </span>
              {serviceAsProduct.originalPrice > serviceAsProduct.price && (
                <span className="text-xl text-gray-400 line-through">
                  ₹{serviceAsProduct.originalPrice}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-6">{serviceAsProduct.description}</p>

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-lg">Includes:</h3>
                <div className="space-y-2">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Min Order */}
            {service.minOrder && (
              <div className="mb-6 bg-blue-50 border-2 border-blue-200 px-4 py-3 rounded-lg text-blue-700 font-semibold">
                📦 {service.minOrder}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-md font-bold"
                >
                  −
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(serviceAsProduct.stock, quantity + 1))}
                  className="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-md font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`flex-1 py-4 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
                  isAddingToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {isAddingToCart ? (
                  <>
                    <span>✓</span>
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleWishlistToggle}
                className={`p-4 rounded-md transition-colors ${
                  isInWishlist
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white'
                }`}
              >
                <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-1">✓</div>
                <div className="text-xs text-gray-600">Quality Guaranteed</div>
              </div>
              <div>
                <div className="text-2xl mb-1">🚚</div>
                <div className="text-xs text-gray-600">Fast Delivery</div>
              </div>
              <div>
                <div className="text-2xl mb-1">💯</div>
                <div className="text-xs text-gray-600">100% Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
