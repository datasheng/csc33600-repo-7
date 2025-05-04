const express = require('express');
const router = express.Router();
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// CORS configuration for the chatbot route
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Handle OPTIONS requests explicitly
router.options('/chat', cors(corsOptions), (req, res) => {
  res.status(204).end();
});

// Handle POST requests for chat
router.post('/chat', cors(corsOptions), chatLimiter, async (req, res) => {
  console.log('==== CHATBOT REQUEST RECEIVED ====');
  const { message, context, isVendor } = req.body;
  console.log('Request body:', JSON.stringify({ message, context, isVendor }));
  console.log('Headers:', JSON.stringify(req.headers));

  try {
    // Create a detailed system prompt based on our application context
    const systemPrompt = `You are Electro, a friendly and helpful shopping assistant for BestElectronics4U, an electronics e-commerce platform. 
    ${isVendor ? "You're talking to a vendor who manages their shop on the platform." : "You're talking to a customer shopping for electronics."}
    Current context: ${context}
    
    Important platform features:
    - Users can be regular customers or vendors
    - Vendors can manage their shops and products
    - Customers can save items to wishlists
    - Premium subscription features are available
    - Secure payment processing with Stripe
    
    Please provide natural, conversational responses that are specific to our platform. Avoid using markdown formatting, bullet points, or special characters. Keep your responses friendly and helpful.`;

    console.log('Sending request to Gemini API with prompt:', systemPrompt);
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            { text: systemPrompt },
            { text: message }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data.candidates[0].content.parts[0].text;
    // Clean up the response to remove any remaining formatting
    const cleanResult = result.replace(/[*#-]/g, '').replace(/\n/g, ' ').trim();
    console.log('Received response from Gemini:', cleanResult);
    res.json({ response: cleanResult });
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    // Fallback to predefined responses if API call fails
    const response = getPredefinedResponse(message, context, isVendor);
    res.json({ response });
  }
});

// Keep our predefined responses as fallback
function getPredefinedResponse(message, context, isVendor) {
  const lowerMessage = message.toLowerCase();
  
  if (isVendor) {
    if (lowerMessage.includes('product') || lowerMessage.includes('add') || lowerMessage.includes('list')) {
      return "To add a new product to your shop, go to your dashboard and click 'Add Product'. You'll need to provide product details, pricing, and images.";
    } else if (lowerMessage.includes('order') || lowerMessage.includes('sales')) {
      return "You can view your orders and sales in the 'Orders' section of your dashboard. This shows all customer purchases from your shop.";
    } else if (lowerMessage.includes('analytics') || lowerMessage.includes('stats')) {
      return "Visit the 'Analytics' section in your dashboard to see detailed statistics about your shop's performance, including sales trends and customer behavior.";
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('earn')) {
      return "Your earnings are automatically processed and transferred to your registered payment method. You can view your payment history in the 'Payments' section.";
    }
  } else {
    if (lowerMessage.includes('subscribe') || lowerMessage.includes('premium')) {
      return "To subscribe to premium features, go to your account settings and click on 'Upgrade to Premium'. You'll get access to exclusive deals and features!";
    } else if (lowerMessage.includes('vendor') || lowerMessage.includes('shop')) {
      return "To become a vendor, register for an account and select 'I want to be a vendor' during signup. You'll need to provide some basic information about your shop.";
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return "We accept all major credit cards, PayPal, and Stripe payments. All transactions are secure and encrypted.";
    }
  }

  // Context-specific responses
  if (context === 'product details') {
    return isVendor
      ? "I can help you with product management, pricing strategies, or inventory updates. What would you like to know?"
      : "I can help you with product specifications, pricing, or availability. What would you like to know?";
  } else if (context === 'shopping cart') {
    return "I can help you with your cart items, checkout process, or payment options. What do you need assistance with?";
  } else if (context === 'vendor dashboard') {
    return "I can help you manage your shop, products, or view analytics. What would you like to know?";
  } else {
    return isVendor
      ? "I'm here to help you manage your shop. You can ask me about products, orders, analytics, or payments."
      : "I'm here to help with your shopping experience. You can ask me about products, subscriptions, becoming a vendor, or payment methods.";
  }
}

module.exports = router; 