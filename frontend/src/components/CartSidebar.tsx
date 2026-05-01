import { X, Minus, Plus, ShoppingBag, Trash2, CheckCircle } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StripeCheckoutFormProps {
  amountInPaise: number;
  onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
  onPaymentFailure: (message: string) => void;
}

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = stripePublicKey
  ? loadStripe(stripePublicKey).catch((error) => {
      console.warn('Stripe failed to initialize:', error);
      return null;
    })
  : null;

function StripeCheckoutForm({ amountInPaise, onPaymentSuccess, onPaymentFailure }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStripePayment = async () => {
    if (!stripe || !elements) {
      onPaymentFailure("Stripe is still loading. Please wait and try again.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onPaymentFailure("Card details are missing.");
      return;
    }

    setIsProcessing(true);
    onPaymentFailure("");

    try {
      const data = await api.payments.createIntent(amountInPaise);
      if (!data?.clientSecret) throw new Error(data?.message || "Unable to initialize payment");

      const confirmation = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: cardElement, billing_details: { name: "SKAY Customer" } },
      });

      if (confirmation.error) throw new Error(confirmation.error.message || "Payment failed");

      if (confirmation.paymentIntent?.status === "succeeded" && confirmation.paymentIntent?.id) {
        await onPaymentSuccess(confirmation.paymentIntent.id);
        return;
      }

      throw new Error("Payment did not complete successfully");
    } catch (error) {
      onPaymentFailure(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Card input — keep white bg for Stripe iframe readability */}
      <div className="rounded-xl border border-white/20 bg-white p-3">
        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: { fontSize: "15px", color: "#111827", "::placeholder": { color: "#9CA3AF" } },
            },
          }}
        />
      </div>
      <button
        onClick={handleStripePayment}
        disabled={isProcessing || !stripe || !elements}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:brightness-110 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-pink-500/25"
      >
        {isProcessing ? "Processing payment..." : "Pay Now"}
      </button>
    </div>
  );
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, clearCart } = useShop();
  const { customerUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [showStripeForm, setShowStripeForm] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const amountInPaise = useMemo(() => Math.round(cartTotal * 100), [cartTotal]);

  const startCheckout = () => {
    setCheckoutError("");
    if (authLoading) { setCheckoutError('Please wait, your account is still loading.'); return; }
    if (!customerUser?.id || !customerUser?.email) { setCheckoutError('Please login to continue checkout.'); return; }
    if (!stripePromise || !stripePublicKey) { setCheckoutError("Stripe publishable key is missing. Please configure VITE_STRIPE_PUBLISHABLE_KEY."); return; }
    if (amountInPaise <= 0) { setCheckoutError("Cart total must be greater than zero."); return; }
    setShowStripeForm(true);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      if (!paymentIntentId || typeof paymentIntentId !== 'string') throw new Error('Invalid payment intent ID');
      if (!customerUser?.id) { setCheckoutError('User ID is missing. Please login again.'); return; }
      if (!customerUser?.email) { setCheckoutError('User email is missing.'); return; }
      if (cart.length === 0) { setCheckoutError('Cart is empty.'); return; }

      const total = Number(cartTotal);
      if (!Number.isFinite(total) || total <= 0) { setCheckoutError('Invalid cart total.'); return; }

      const items = cart.map((item) => ({
        productId: item.id, name: item.name, quantity: item.quantity, price: item.price,
        selectedSize: item.selectedSize || null, selectedColor: item.selectedColor || null,
        selectedSleeve: item.selectedSleeve || null, selectedType: item.selectedType || null,
        customDesign: item.customDesign || null,
      }));

      const result = await api.orders.create({
        user_id: customerUser.id, email: customerUser.email,
        total_amount: total, payment_id: paymentIntentId, items,
      });

      if (!result?.success) throw new Error(result?.error || result?.message || 'Unknown error saving order');

      setCheckoutSuccess(true);
      setCheckoutError("");
      clearCart();
      onClose();
      navigate('/payment-success');
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Payment succeeded but order save failed');
    }
  };

  const handlePaymentFailure = (message: string) => { setCheckoutError(message); };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[400px] z-50 transition-transform duration-300 flex flex-col
          bg-white/10 backdrop-blur-xl border-l border-white/15 shadow-2xl
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={20} className="text-pink-400" />
            <h2 className="font-bold text-white">Cart ({cart.length})</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/70 hover:text-white transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40">
              <ShoppingBag size={40} className="opacity-30" />
              <p className="text-sm">Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${item.selectedSleeve}-${item.selectedType}`}
                className="bg-white/10 border border-white/15 rounded-xl p-4 flex justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{item.name}</p>
                  <div className="mt-1 space-y-0.5">
                    {item.selectedSize && <p className="text-xs text-white/45">Size: {item.selectedSize}</p>}
                    {item.selectedColor && <p className="text-xs text-white/45">Color: {item.selectedColor}</p>}
                    {item.selectedSleeve && <p className="text-xs text-white/45">Sleeve: {item.selectedSleeve}</p>}
                    {item.selectedType && <p className="text-xs text-white/45">Type: {item.selectedType}</p>}
                  </div>
                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 text-white/70 hover:bg-white/20 flex items-center justify-center transition-all"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold text-white w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 text-white/70 hover:bg-white/20 flex items-center justify-center transition-all"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                    INR {item.price * item.quantity}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-300 transition-colors mt-2"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-5 py-4 border-t border-white/10 space-y-3">
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm font-medium">Total</span>
              <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                INR {cartTotal}
              </span>
            </div>

            {/* Error / Success */}
            {checkoutError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/15 px-3 py-2 text-xs text-red-400">
                {checkoutError}
              </div>
            )}
            {checkoutSuccess && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/15 px-3 py-2 text-xs text-green-400 flex items-center gap-2">
                <CheckCircle size={14} /> Payment Successful
              </div>
            )}

            {/* Checkout / Stripe */}
            {!showStripeForm ? (
              <button
                onClick={startCheckout}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:brightness-110 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-pink-500/25"
              >
                Checkout
              </button>
            ) : (
              <div>
                {stripePromise ? (
                  <Elements stripe={stripePromise}>
                    <StripeCheckoutForm
                      amountInPaise={amountInPaise}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentFailure={handlePaymentFailure}
                    />
                  </Elements>
                ) : (
                  <p className="text-red-400 text-sm">Stripe failed to initialize.</p>
                )}
              </div>
            )}

            <Link
              to="/quote"
              onClick={onClose}
              className="block text-center text-sm text-pink-400 hover:text-pink-300 transition-colors"
            >
              Need a custom quote?
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
