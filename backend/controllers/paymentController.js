const Stripe = require('stripe');
const jwt    = require('jsonwebtoken');

/**
 * POST /api/create-payment-intent
 *
 * Creates a Stripe PaymentIntent.
 * Optionally validates the customer JWT so we can associate the payment
 * with a user — but we do NOT block payment if the token is missing,
 * because the CartSidebar already guards that on the frontend.
 *
 * Body: { amount: number }   — amount in smallest currency unit (paise for INR)
 */
const createPaymentIntent = async (req, res) => {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      console.error('[Payment] STRIPE_SECRET_KEY is not set');
      return res.status(500).json({
        success: false,
        message: 'Payment service is not configured. Please contact support.',
      });
    }

    // ── Optional: identify the user from the JWT ──────────────────────────
    let userId = null;
    const authHeader = req.headers.authorization ?? '';
    if (authHeader.toLowerCase().startsWith('bearer ') && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(authHeader.slice(7).trim(), process.env.JWT_SECRET);
        userId = decoded.userId ?? decoded.id ?? null;
      } catch (jwtErr) {
        // Non-fatal — we still allow the payment to proceed
        console.warn('[Payment] JWT verification failed (non-fatal):', jwtErr.message);
      }
    }

    // ── Validate amount ───────────────────────────────────────────────────
    const rawAmount = req.body?.amount;
    const amount    = Number(rawAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid positive amount is required.',
      });
    }

    const normalizedAmount = Math.round(amount); // must be integer paise

    // ── Create PaymentIntent ──────────────────────────────────────────────
    const stripe = new Stripe(stripeSecretKey);

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   normalizedAmount,
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
      ...(userId ? { metadata: { userId } } : {}),
    });

    console.log(`[Payment] PaymentIntent created: ${paymentIntent.id}${userId ? ` for user ${userId}` : ''}`);

    return res.status(200).json({
      success:      true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error('[Payment] createPaymentIntent error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment intent. Please try again.',
    });
  }
};

module.exports = { createPaymentIntent };
