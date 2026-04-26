const Stripe = require("stripe");

const createPaymentIntent = async (req, res) => {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return res.status(500).json({
        success: false,
        message: "Stripe secret key is not configured",
      });
    }

    const { amount } = req.body;

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const normalizedAmount = Math.round(Number(amount));
    const stripe = new Stripe(stripeSecretKey);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: normalizedAmount,
      currency: "inr",
      automatic_payment_methods: { enabled: true },
    });

    console.log("PaymentIntent created:", paymentIntent.id);

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Create PaymentIntent error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create payment intent",
      error: error.message,
    });
  }
};

module.exports = {
  createPaymentIntent,
};
