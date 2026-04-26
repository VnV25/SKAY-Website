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
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

function StripeCheckoutForm({
  amountInPaise,
  onPaymentSuccess,
  onPaymentFailure,
}: StripeCheckoutFormProps) {
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
      console.log("Creating payment intent for amount (paise):", amountInPaise);

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("skay-token") || ""}`,
        },
        body: JSON.stringify({ amount: amountInPaise }),
      });

      const data = await response.json();
      console.log("Create payment intent response:", data);

      if (!response.ok || !data?.clientSecret) {
        throw new Error(data?.message || "Unable to initialize payment");
      }

      const confirmation = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: "SKAY Customer",
          },
        },
      });

      if (confirmation.error) {
        console.error("Stripe confirmation error:", confirmation.error);
        throw new Error(confirmation.error.message || "Payment failed");
      }

      if (confirmation.paymentIntent?.status === "succeeded" && confirmation.paymentIntent?.id) {
        console.log("Stripe payment successful:", confirmation.paymentIntent.id);
        await onPaymentSuccess(confirmation.paymentIntent.id);
        return;
      }

      throw new Error("Payment did not complete successfully");
    } catch (error) {
      console.error("Stripe checkout error:", error);
      onPaymentFailure(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="border rounded p-3">
        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: {
                fontSize: "16px",
                color: "#111827",
                "::placeholder": {
                  color: "#9CA3AF",
                },
              },
            },
          }}
        />
      </div>

      <button
        onClick={handleStripePayment}
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-orange-500 text-white p-3 rounded disabled:opacity-60"
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

    if (authLoading) {
      setCheckoutError('Please wait, your account is still loading.');
      return;
    }

    if (!customerUser?.id || !customerUser?.email) {
      setCheckoutError('Please login to continue checkout.');
      return;
    }

    if (!stripePromise || !stripePublicKey) {
      setCheckoutError("Stripe publishable key is missing. Please configure VITE_STRIPE_PUBLISHABLE_KEY.");
      return;
    }

    if (amountInPaise <= 0) {
      setCheckoutError("Cart total must be greater than zero.");
      return;
    }

    setShowStripeForm(true);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      if (!customerUser?.id || !customerUser?.email) {
        setCheckoutError('Please login to save your order.');
        return;
      }

      const items = cart.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
      }));

      if (items.length === 0) {
        throw new Error('No cart items found to save order.');
      }

      const total = Number(cartTotal);
      const payload = {
        user_id: customerUser.id,
        email: customerUser.email,
        total_amount: total,
        payment_id: paymentIntentId,
        items,
      };

      console.log('Saving order payload:', payload);

      await api.orders.create(payload);

      setCheckoutSuccess(true);
      setCheckoutError("");
      clearCart();
      onClose();
      navigate('/payment-success');
    } catch (error) {
      console.error('Order save after payment failed:', error);
      setCheckoutError(error instanceof Error ? error.message : 'Payment succeeded but order save failed');
    }
  };

  const handlePaymentFailure = (message: string) => {
    setCheckoutError(message);
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />}

      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-white z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag />
              <h2>Cart ({cart.length})</h2>
            </div>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500">Your cart is empty</div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  className="flex justify-between mb-4 border-b pb-2"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>

                    {item.selectedSize && <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>}

                    {item.selectedColor && <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>}

                    <div className="flex gap-2 mt-2 items-center">
                      <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>
                        <Minus size={14} />
                      </button>

                      <span>{item.quantity}</span>

                      <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p>{`INR ${item.price * item.quantity}`}</p>

                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 mt-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-4 border-t">
              <p className="font-semibold">{`Total: INR ${cartTotal}`}</p>

              {checkoutError && <p className="text-red-500 mt-2">{checkoutError}</p>}

              {checkoutSuccess && (
                <p className="text-green-600 flex items-center gap-2 mt-2">
                  <CheckCircle size={16} /> Payment Successful
                </p>
              )}

              {!showStripeForm ? (
                <button onClick={startCheckout} className="w-full bg-orange-500 text-white p-3 mt-3 rounded">
                  Checkout
                </button>
              ) : (
                <div className="mt-3">
                  {stripePromise ? (
                    <Elements stripe={stripePromise}>
                      <StripeCheckoutForm
                        amountInPaise={amountInPaise}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentFailure={handlePaymentFailure}
                      />
                    </Elements>
                  ) : (
                    <p className="text-red-500">Stripe failed to initialize.</p>
                  )}
                </div>
              )}

              <Link to="/quote" onClick={onClose} className="block text-center mt-3 text-orange-500 underline">
                Need custom quote?
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
