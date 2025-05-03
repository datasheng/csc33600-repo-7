

require('dotenv').config(); // At top of file
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const bodyParser = require('body-parser');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Parse JSON body for create-checkout-session
router.use(express.json());

// Create Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  const { priceId, mode = 'subscription', userId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        userId: userId || 'unknown',
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Stripe session creation failed' });
  }
});

// Webhook endpoint (raw body required)
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const paymentData = {
      user: session.customer_email,
      amount: session.amount_total / 100,
      paidAt: new Date().toISOString(),
    };

    console.log('✅ Payment received:', paymentData);
  }

  res.status(200).json({ received: true });
});

module.exports = router;
