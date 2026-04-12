import { X, Minus, Plus, ShoppingBag, Trash2, CheckCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Link } from 'react-router';
import { useState } from 'react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, checkout } = useShop();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError('');

    try {
      await checkout();
      setCheckoutSuccess(true);
      setTimeout(() => {
        setCheckoutSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Checkout failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-orange-500" size={24} />
              <h2 className="text-xl">Shopping Cart ({cart.length})</h2>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-gray-100 p-2 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <button
                  onClick={onClose}
                  className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 border-b pb-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.name}</h3>
                      {item.selectedSize && (
                        <p className="text-xs text-gray-600">Size: {item.selectedSize}</p>
                      )}
                      {item.selectedColor && (
                        <p className="text-xs text-gray-600">Color: {item.selectedColor}</p>
                      )}
                      {item.customDesign && (
                        <p className="text-xs text-green-600">✓ Custom design uploaded</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="bg-gray-100 p-1 rounded hover:bg-gray-200"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="bg-gray-100 p-1 rounded hover:bg-gray-200"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{item.price * item.quantity}</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-600 mt-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between text-lg">
                <span>Subtotal:</span>
                <span className="font-bold">₹{cartTotal}</span>
              </div>

              {checkoutError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                  {checkoutError}
                </div>
              )}

              {checkoutSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-md text-sm flex items-center gap-2">
                  <CheckCircle size={16} />
                  Order placed successfully!
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="block w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                {isCheckingOut ? 'Placing Order...' : 'Place Order'}
              </button>

              <div className="text-center text-sm text-gray-600">
                <Link
                  to="/quote"
                  onClick={onClose}
                  className="text-orange-500 hover:text-orange-600 underline"
                >
                  Need a custom quote?
                </Link>
              </div>

              <button
                onClick={onClose}
                className="w-full border border-gray-300 py-2 rounded-md hover:bg-gray-50"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
