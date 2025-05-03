import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
console.log(stripePromise);

const PricingCard = ({ title, price, period, features, isPopular, priceId, mode }) => {
  const handleCheckout = async () => {
    try {
      const stripe = await stripePromise;
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priceId, mode }), // ✅ Send correct mode
      });

      const session = await response.json();

      if (!session.id) {
        throw new Error('Stripe session ID missing from response');
      }

      const result = await stripe.redirectToCheckout({ sessionId: session.id });

      if (result.error) {
        console.error('Stripe redirect error:', result.error.message);
      }
    } catch (err) {
      console.error('Checkout error:', err.message);
    }
  };


  return (
    <div className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border ${isPopular ? 'border-cyan-400' : 'border-white/20'}`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-cyan-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <div className="flex items-baseline justify-center gap-1 mb-6">
          <span className="text-4xl font-bold text-white">${price}</span>
          {period && <span className="text-white/70">/{period}</span>}
        </div>
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-white/90">
              <svg className="w-5 h-5 text-cyan-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={handleCheckout}
          className={`block w-full py-3 px-6 rounded-lg text-center font-semibold transition duration-200 ${
            isPopular
              ? 'bg-cyan-400 text-black hover:bg-cyan-300'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

const Pricing = () => {
  const plans = [
    {
      title: 'Monthly',
      price: '2',
      priceId: 'price_1RKmZKQvPHTql1pnv0MpHQQE',
      period: 'month',
      features: [
        'Access to all product listings',
        'Price comparison tools',
        'Perfect for one-time purchases',
        'Great for seasonal shopping',
        'Cancel anytime',
      ],
      mode: 'subscription',
    },
    {
      title: 'Lifetime',
      price: '100',
      priceId: 'price_1RKmfIQvPHTql1pnJ8omUM6F',
      period: null,
      features: [
        'Unlimited lifetime access',
        'All features included',
        'Priority support',
        'Early access to new features',
        'Perfect for tech enthusiasts',
      ],
      isPopular: true,
      mode: 'payment',
    },
  ];

  

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-indigo-900 via-cyan-800 to-blue-900 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-white/80">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Money Back Guarantee</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Not satisfied with our service? Get a full refund within the first 30 days.
            No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;