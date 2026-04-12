import { X, Star, Upload, ShoppingCart, Heart, Package } from 'lucide-react';
import { Product } from '../context/ShopContext';
import { useShop } from '../context/ShopContext';
import { useState } from 'react';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, addToRecentlyViewed } = useShop();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customDesign, setCustomDesign] = useState<string>('');
  const [designPreview, setDesignPreview] = useState<string>('');

  if (!product || !isOpen) return null;

  const inWishlist = isInWishlist(product.id);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomDesign(file.name);
        setDesignPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor, customDesign);
    addToRecentlyViewed(product);
    onClose();
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const canAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) return false;
    if (product.colors && product.colors.length > 0 && !selectedColor) return false;
    return true;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white rounded-lg z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">Product Details</h2>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 p-2 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Section */}
            <div>
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full rounded-lg"
                />
                {product.discount && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              {/* Design Preview */}
              {designPreview && (
                <div className="mt-4 border-2 border-orange-500 rounded-lg p-4">
                  <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Package size={16} className="text-orange-500" />
                    Design Preview
                  </div>
                  <img
                    src={designPreview}
                    alt="Custom design preview"
                    className="w-full rounded"
                  />
                </div>
              )}
            </div>

            {/* Details Section */}
            <div>
              {/* Rating & Reviews */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Name */}
              <h1 className="text-3xl mb-3">{product.name}</h1>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-orange-500">₹{product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Save ₹{product.originalPrice - product.price}
                    </span>
                  </>
                )}
              </div>

              {/* Stock */}
              <div className="mb-4">
                {product.stock <= 5 ? (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md flex items-center gap-2">
                    <span className="animate-pulse">🔥</span>
                    <span className="font-semibold">Hurry! Only {product.stock} left in stock</span>
                  </div>
                ) : (
                  <div className="text-green-600 flex items-center gap-2">
                    <span>✓</span>
                    <span>In Stock ({product.stock} available)</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6">{product.description}</p>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">
                    Select Size <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border-2 rounded-md transition-all ${
                          selectedSize === size
                            ? 'border-orange-500 bg-orange-50 text-orange-500'
                            : 'border-gray-300 hover:border-orange-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">
                    Select Color <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border-2 rounded-md transition-all ${
                          selectedColor === color
                            ? 'border-orange-500 bg-orange-50 text-orange-500'
                            : 'border-gray-300 hover:border-orange-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Custom Design */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Upload Custom Design (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="design-upload"
                    accept="image/*,.pdf,.ai,.psd"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="design-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-orange-500 transition-colors bg-gray-50"
                  >
                    <Upload size={20} className="text-gray-500" />
                    <span className="text-gray-600">
                      {customDesign || 'Click to upload your design'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart()}
                  className={`flex-1 py-3 rounded-md flex items-center justify-center gap-2 transition-all ${
                    canAddToCart()
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className="px-6 py-3 border-2 border-orange-500 rounded-md hover:bg-orange-50 transition-colors"
                >
                  <Heart
                    size={20}
                    className={inWishlist ? 'fill-red-500 text-red-500' : 'text-orange-500'}
                  />
                </button>
              </div>

              {!canAddToCart() && (
                <p className="text-sm text-red-500 mt-2">
                  * Please select all required options
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
