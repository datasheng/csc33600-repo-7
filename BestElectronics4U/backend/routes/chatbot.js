const express = require('express');
const router = express.Router();
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pool = require('../db'); // Add database connection pool

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
    // Get context-relevant information from the database
    let websiteInfo = await getContextInfo(message, context);
    
    // Get recent conversation history (up to 5 messages) to provide context
    let conversationHistory = "";
    if (req.body.history && Array.isArray(req.body.history)) {
      const limitedHistory = req.body.history.slice(-5); // Get only last 5 messages
      conversationHistory = limitedHistory.map(msg => 
        `${msg.sender === 'user' ? 'User' : 'Electro'}: ${msg.text}`
      ).join('\n');
      
      if (conversationHistory) {
        conversationHistory = `\nRecent conversation history:\n${conversationHistory}\n`;
      }
    }
    
    // Create a detailed system prompt based on our application context
    const systemPrompt = `You are Electro, a friendly and helpful shopping assistant for BestElectronics4U, an electronics e-commerce platform. 
    ${isVendor ? "You're talking to a vendor who manages their shop on the platform." : "You're talking to a customer shopping for electronics."}
    Current context: ${context}
    
    WEBSITE STRUCTURE AND FEATURES:
    - Home Page: Features a modern hero section with "Shop Now" button, customer testimonials, and promotional content
    - Shop Page: Displays product listings with search functionality and filtering options
    - About Page: Contains information about BestElectronics4U mission, offerings, and promises
    - Contact Page: Has a contact form and contact information (phone: (555) 123-4567, email: support@bestelectronics4u.com)
    - Auth Page: Where users can sign up or log in, with option to become a vendor
    - Dashboard: Personalized page where users can view their info, saved items, and vendors can manage products
    - Pricing Page: Information about subscription plans and premium features
    
    USER TYPES:
    - Regular customers: Can browse products, save items to wishlist, and make purchases
    - Paid users: Premium customers with access to special features and exclusive content
    - Vendors: Can create and manage their shop, add/edit products, and track sales
    
    PRODUCT FEATURES:
    - Products are organized by categories (Electronics, Computers, Mobile Phones, etc.)
    - Products include details like name, price, discounted price, rating, and description
    - Users can save products to their wishlist by clicking the heart icon
    - Products can be searched and filtered
    
    VENDOR FEATURES:
    - Vendors can set up their shop with name and address
    - Vendors can add and manage products in their dashboard
    - Vendors can set prices, discounts, and product details
    - Vendors can upload product images and descriptions
    
    SHOPPING FEATURES:
    - Secure checkout process through Stripe
    - Support for credit cards and other payment methods
    - Wishlists for saving favorite products
    - User accounts for order history and personal information
    
    REAL-TIME INFORMATION FROM DATABASE:
    ${websiteInfo}
    
    ${conversationHistory}
    
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

// Function to get context-relevant information from the database
async function getContextInfo(message, context) {
  const lowerMessage = message.toLowerCase();
  let info = '';
  
  try {
    // If user is asking about categories or browsing products
    if (lowerMessage.includes('category') || lowerMessage.includes('categories') || 
        lowerMessage.includes('types of products') || lowerMessage.includes('browse') || 
        lowerMessage.includes('products') || lowerMessage.includes('items')) {
      const [categories] = await pool.query(`
        SELECT c.category_id, c.category_name, c.parent_id, COUNT(p.product_id) as product_count 
        FROM category c
        LEFT JOIN product p ON c.category_id = p.category_id
        GROUP BY c.category_id
        ORDER BY product_count DESC
      `);
      
      if (categories.length > 0) {
        const topCategories = categories.slice(0, 7); // Get top 7 categories
        const categoryInfo = topCategories.map(cat => 
          `${cat.category_name} (${cat.product_count} products)`
        ).join(', ');
        info += `Our top product categories include: ${categoryInfo}. `;
      }
    }
    
    // If user is asking about popular products or trending items
    if (lowerMessage.includes('popular') || lowerMessage.includes('trending') || 
        lowerMessage.includes('best selling') || lowerMessage.includes('top') || 
        lowerMessage.includes('recommend') || lowerMessage.includes('suggestion')) {
      const [popularProducts] = await pool.query(`
        SELECT p.product_name, p.discounted_price, p.actual_price, p.rating, p.rating_count, 
               c.category_name, s.shop_name
        FROM product p
        LEFT JOIN category c ON p.category_id = c.category_id
        LEFT JOIN shop s ON p.shop_id = s.shop_id
        WHERE p.rating >= 4.0
        ORDER BY p.rating_count DESC, p.rating DESC 
        LIMIT 5
      `);
      
      if (popularProducts.length > 0) {
        const productsInfo = popularProducts.map(p => 
          `${p.product_name} (${p.rating}★, ${p.category_name || 'Electronics'}, $${p.discounted_price || p.actual_price})`
        ).join(', ');
        info += `Our most popular products include: ${productsInfo}. `;
      }
    }
    
    // If user is asking about discounts or deals
    if (lowerMessage.includes('discount') || lowerMessage.includes('deal') || 
        lowerMessage.includes('offer') || lowerMessage.includes('sale') || 
        lowerMessage.includes('cheap') || lowerMessage.includes('price') || 
        lowerMessage.includes('affordable')) {
      const [discountedProducts] = await pool.query(`
        SELECT p.product_name, p.discounted_price, p.actual_price, 
               p.discount_percentage, c.category_name
        FROM product p
        LEFT JOIN category c ON p.category_id = c.category_id
        WHERE p.discount_percentage > 10
        ORDER BY p.discount_percentage DESC 
        LIMIT 5
      `);
      
      if (discountedProducts.length > 0) {
        const discountInfo = discountedProducts.map(p => 
          `${p.product_name} (${Math.round(p.discount_percentage)}% off, now $${p.discounted_price})`
        ).join(', ');
        info += `Our best deals right now include: ${discountInfo}. `;
      } else {
        // Fallback if no significant discounts are found
        const [anyProducts] = await pool.query(`
          SELECT product_name, discounted_price, actual_price
          FROM product
          WHERE discounted_price < actual_price
          LIMIT 3
        `);
        
        if (anyProducts.length > 0) {
          info += `We have several products on sale. Check our shop page for the latest deals! `;
        }
      }
    }
    
    // If in a product context, provide info about that product or similar products
    if (context === 'product details' && (
        lowerMessage.includes('similar') || lowerMessage.includes('related') || 
        lowerMessage.includes('like this') || lowerMessage.includes('alternative'))) {
      // Let's try to identify if there's a specific product category being discussed
      const categoryWords = ['phone', 'laptop', 'camera', 'headphone', 'speaker', 'tv', 'tablet', 
                            'computer', 'accessory', 'gadget', 'appliance', 'wearable', 'smart'];
      
      let targetCategory = null;
      for (const word of categoryWords) {
        if (lowerMessage.includes(word)) {
          targetCategory = word;
          break;
        }
      }
      
      let query = 'SELECT p.product_name, p.discounted_price, p.rating, c.category_name FROM product p LEFT JOIN category c ON p.category_id = c.category_id';
      const params = [];
      
      if (targetCategory) {
        query += ' WHERE p.product_name LIKE ? OR p.about_product LIKE ? OR c.category_name LIKE ?';
        const pattern = `%${targetCategory}%`;
        params.push(pattern, pattern, pattern);
      }
      
      query += ' ORDER BY RAND() LIMIT 3';
      
      const [relatedProducts] = await pool.query(query, params);
      if (relatedProducts.length > 0) {
        const productsInfo = relatedProducts.map(p => 
          `${p.product_name} (${p.rating || 4.0}★, $${p.discounted_price || 199.99})`
        ).join(', ');
        
        info += targetCategory 
          ? `Here are some ${targetCategory} products you might like: ${productsInfo}. `
          : `You might also be interested in these related products: ${productsInfo}. `;
      }
    }
    
    // Stats about the store to make it seem more knowledgeable
    if (lowerMessage.includes('how many') || lowerMessage.includes('total') || 
        lowerMessage.includes('statistic') || lowerMessage.includes('stat') || 
        lowerMessage.includes('info') || lowerMessage.includes('about')) {
      const [productCount] = await pool.query('SELECT COUNT(*) as count FROM product');
      const [categoryCount] = await pool.query('SELECT COUNT(*) as count FROM category');
      const [vendorCount] = await pool.query('SELECT COUNT(*) as count FROM shop');
      const [avgRating] = await pool.query('SELECT AVG(rating) as avg FROM product WHERE rating > 0');
      
      info += `Our marketplace features ${productCount[0].count || 'thousands of'} products across ${categoryCount[0].count || 'many'} categories from ${vendorCount[0].count || 'various'} vendors. `;
      
      if (avgRating[0].avg) {
        info += `Our products have an average rating of ${avgRating[0].avg.toFixed(1)} stars. `;
      }
      
      // Add information about pricing range
      const [priceRange] = await pool.query(`
        SELECT MIN(discounted_price) as min_price, MAX(discounted_price) as max_price, 
               AVG(discounted_price) as avg_price
        FROM product 
        WHERE discounted_price > 0
      `);
      
      if (priceRange[0].min_price && priceRange[0].max_price) {
        info += `Our product prices range from $${priceRange[0].min_price.toFixed(2)} to $${priceRange[0].max_price.toFixed(2)}, with an average price of $${priceRange[0].avg_price.toFixed(2)}. `;
      }
    }
    
    // Handle vendor-specific questions
    if (lowerMessage.includes('vendor') || lowerMessage.includes('seller') || lowerMessage.includes('shop owner')) {
      const [topVendors] = await pool.query(`
        SELECT s.shop_name, COUNT(p.product_id) as product_count
        FROM shop s
        JOIN product p ON s.shop_id = p.shop_id
        GROUP BY s.shop_id
        ORDER BY product_count DESC
        LIMIT 3
      `);
      
      if (topVendors.length > 0) {
        info += `Some of our top vendors include: ${topVendors.map(v => 
          `${v.shop_name} (${v.product_count} products)`
        ).join(', ')}. `;
      }
      
      info += `To become a vendor, you need to register and select 'I want to be a vendor' during signup. You can then create your shop profile and start listing products. `;
    }
    
    // Handle subscription or premium user questions
    if (lowerMessage.includes('subscription') || lowerMessage.includes('premium') || 
        lowerMessage.includes('paid') || lowerMessage.includes('upgrade')) {
      info += `Our premium membership offers exclusive benefits including: early access to new products, special discounts, priority customer support, and free shipping on select items. `;
      
      // Try to get some subscription data if available
      try {
        const [subscriptionData] = await pool.query(`
          SELECT type_of_subscription, COUNT(*) as user_count, AVG(monthly_price) as avg_price
          FROM subscription
          GROUP BY type_of_subscription
        `);
        
        if (subscriptionData.length > 0) {
          const subscription = subscriptionData[0];
          info += `Our ${subscription.type_of_subscription || 'premium'} subscription is currently $${subscription.avg_price?.toFixed(2) || '9.99'} per month. `;
        } else {
          info += `Premium membership is available for just $9.99 per month or $99.99 per year. `;
        }
      } catch (error) {
        info += `Premium membership is available for just $9.99 per month or $99.99 per year. `;
      }
    }
    
    return info;
  } catch (error) {
    console.error('Error getting context info:', error);
    return '';
  }
}

module.exports = router; 