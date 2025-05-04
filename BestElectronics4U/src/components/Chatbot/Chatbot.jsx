import React, { useState, useEffect, useRef } from 'react';
import ChatWindow from './ChatWindow';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const chatWindowRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Set initial message based on user type
    const initialMessage = {
      id: 1,
      text: user 
        ? `Hello ${user.first_name || 'there'}! I'm Electro, your personalized shopping assistant. How can I help you ${user.is_vendor ? 'with your shop' : 'with your shopping'} today?`
        : "Hello! I'm Electro, your personalized shopping assistant. How can I help you with your shopping today?",
      sender: 'bot',
      timestamp: new Date().toISOString()
    };
    setMessages([initialMessage]);

    // Stop animation after 5 seconds
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [user]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsAnimating(false);
  };

  const handleSendMessage = async (message) => {
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    // Get context based on current page
    let context = '';
    if (location.pathname.includes('/product/')) {
      context = 'product details';
    } else if (location.pathname.includes('/cart')) {
      context = 'shopping cart';
    } else if (location.pathname.includes('/dashboard')) {
      context = 'vendor dashboard';
    }

    try {
      console.log('Sending request to:', `${import.meta.env.VITE_API_URL}/api/chatbot/chat`);
      console.log('Request data:', { message, context, isVendor: user?.is_vendor || false });
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/chatbot/chat`, {
        message,
        context,
        isVendor: user?.is_vendor || false
      });

      console.log('Response received:', response.data);
      
      const botResponse = {
        id: messages.length + 2,
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Chatbot error:', error);
      console.error('Error details:', error.message, error.response?.data, error.response?.status);
      // Fallback to predefined response if API call fails
      const botResponse = {
        id: messages.length + 2,
        text: getPredefinedResponse(message, context, user?.is_vendor || false),
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botResponse]);
    }
  };

  const getPredefinedResponse = (message, context, isVendor) => {
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
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={toggleChat}
          className={`bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors relative ${
            isAnimating ? 'animate-bounce' : ''
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          {isAnimating && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              👋
            </span>
          )}
        </button>
      ) : (
        <ChatWindow
          ref={chatWindowRef}
          messages={messages}
          onSendMessage={handleSendMessage}
          onClose={toggleChat}
          userName={user?.first_name}
          isVendor={user?.is_vendor}
        />
      )}
    </div>
  );
};

export default Chatbot; 