import React, { useState, useEffect, useRef } from "react";
import ChatWindow from "./ChatWindow";
import { useLocation } from "react-router-dom";
import axios from "axios";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatWindowRef = useRef(null);
  const location = useLocation();

  //  Load user and stop animation
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  //  Add initial message once user is set
  useEffect(() => {
    if (user !== null || localStorage.getItem("user")) {
      const initialMessage = {
        id: 1,
        text: user
          ? `Hello ${
              user.first_name || "there"
            }! I'm Electro, your personalized shopping assistant. How can I help you ${
              user.is_vendor ? "with your shop" : "with your shopping"
            } today?`
          : "Hello! I'm Electro, your personalized shopping assistant. How can I help you with your shopping today?",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages([initialMessage]);
    }
  }, [user]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsAnimating(false);
  };

  const handleSendMessage = async (message) => {
    const userMessage = {
      id: messages.length + 1,
      text: message,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Get context from route
    let context = "";
    if (location.pathname.includes("/product/")) {
      context = "product details";
    } else if (location.pathname.includes("/cart")) {
      context = "shopping cart";
    } else if (location.pathname.includes("/dashboard")) {
      context = "vendor dashboard";
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chatbot/chat`,
        {
          message,
          context,
          isVendor: user?.is_vendor || false,
        }
      );

      setIsTyping(false);
      const botResponse = {
        id: messages.length + 2,
        text: response.data.response,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setIsTyping(false);
      const botResponse = {
        id: messages.length + 2,
        text: getPredefinedResponse(message, context, user?.is_vendor || false),
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }
  };

  const getPredefinedResponse = (message, context, isVendor) => {
    const lower = message.toLowerCase();
    if (isVendor) {
      if (lower.includes("product"))
        return "To add a new product, go to your dashboard and click 'Add Product'.";
      if (lower.includes("order"))
        return "View orders in the 'Orders' section of your dashboard.";
      if (lower.includes("analytics"))
        return "Visit 'Analytics' for detailed stats on your shop.";
      if (lower.includes("payment"))
        return "Your earnings are processed via your chosen payment method.";
    } else {
      if (lower.includes("subscribe"))
        return "Go to account settings and click 'Upgrade to Premium'.";
      if (lower.includes("vendor"))
        return "To become a vendor, register and choose 'I want to be a vendor'.";
      if (lower.includes("payment"))
        return "We accept all major credit cards and PayPal via Stripe.";
    }

    if (context === "product details")
      return isVendor
        ? "I can help with pricing, inventory, or product details."
        : "Need help with product specs or availability?";
    if (context === "shopping cart")
      return "I can help with your cart or checkout.";
    if (context === "vendor dashboard")
      return "I can help with shop management or analytics.";

    return isVendor
      ? "Ask me anything about managing your shop, products, or payments!"
      : "Ask me about shopping, payments, or how to become a vendor!";
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={toggleChat}
          className={`bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full p-4 shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 relative ${
            isAnimating ? "animate-bounce" : ""
          }`}
          aria-label="Open chat assistant"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-0 hover:opacity-30 transition-opacity duration-300"></div>
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
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse shadow-md">
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
          isTyping={isTyping}
        />
      )}
    </div>
  );
};

export default Chatbot;
