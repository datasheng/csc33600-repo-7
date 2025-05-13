import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserInfo from "../components/dashboard/UserInfo";
import SavedItems from "../components/dashboard/SavedItems";
import PurchasedItems from "../components/dashboard/PurchasedItems";
import VendorProductForm from "../components/dashboard/VendorProductForm";
import VendorProducts from "../components/dashboard/VendorProducts";

const Dashboard = ({ user: propUser, savedItems, setSavedItems }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [purchasedItems, setPurchasedItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Use provided user prop if available, otherwise check localStorage
    if (propUser) {
      setUser(propUser);
    } else {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        navigate("/auth"); // redirect if not logged in
      }
    }
  }, [navigate, propUser]);

  // Load purchased items from localStorage when component mounts
  useEffect(() => {
    if (user) {
      const storedPurchasedItems = localStorage.getItem(
        `purchasedItems_${user.user_id}`
      );
      if (storedPurchasedItems) {
        setPurchasedItems(JSON.parse(storedPurchasedItems));
      }
    }
  }, [user]);

  // Save purchased items to localStorage whenever it changes
  useEffect(() => {
    if (user && purchasedItems) {
      localStorage.setItem(
        `purchasedItems_${user.user_id}`,
        JSON.stringify(purchasedItems)
      );
    }
  }, [purchasedItems, user]);

  // Auto-switch to the purchased tab when an item is marked as purchased
  useEffect(() => {
    // Get the previous count from localStorage
    const getPreviousCount = () => {
      if (!user) return 0;
      try {
        const stored = localStorage.getItem(
          `previousPurchaseCount_${user.user_id}`
        );
        return stored ? parseInt(stored, 10) : 0;
      } catch (e) {
        return 0;
      }
    };

    const previousCount = getPreviousCount();
    const currentCount = purchasedItems?.length || 0;

    // If a new item was added to purchased items, switch to the purchased tab
    if (currentCount > previousCount && currentCount > 0) {
      setActiveTab("purchased");
    }

    // Update the previous count
    if (user) {
      localStorage.setItem(
        `previousPurchaseCount_${user.user_id}`,
        currentCount.toString()
      );
    }
  }, [purchasedItems, user]);

  if (!user) return null; // or loading spinner

  // Define tabs based on user type
  const tabs = [
    { id: "profile", label: "👤 Profile", component: <UserInfo user={user} /> },
    {
      id: "saved",
      label: "❤️ Liked Products",
      component: (
        <SavedItems
          userId={user.user_id}
          savedItems={savedItems}
          setSavedItems={setSavedItems}
          purchasedItems={purchasedItems}
          setPurchasedItems={setPurchasedItems}
        />
      ),
    },
    {
      id: "purchased",
      label: "🛒 Purchased",
      component: (
        <PurchasedItems
          userId={user.user_id}
          purchasedItems={purchasedItems}
          setPurchasedItems={setPurchasedItems}
        />
      ),
    },
  ];

  // Add vendor-specific tabs if user is a vendor
  if (user.is_vendor) {
    tabs.push(
      {
        id: "add-product",
        label: "📦 Add Product",
        component: <VendorProductForm userId={user.user_id} />,
      },
      {
        id: "my-products",
        label: "🧾 My Products",
        component: <VendorProducts userId={user.user_id} />,
      }
    );
  }

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-indigo-900 via-cyan-800 to-blue-900 py-6 md:py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 md:mb-8 text-center flex items-center justify-center gap-3">
          <span role="img" aria-label="dashboard">
            📊
          </span>
          Dashboard
        </h1>

        {/* Tabbed Navigation */}
        <div className="backdrop-blur-md bg-white/10 rounded-t-xl p-2 border border-white/20 overflow-x-auto">
          <div className="flex w-full min-w-max">
            {" "}
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-label={tab.id}
                className={`flex-1 min-w-[100px] text-center px-2 md:px-4 py-2 md:py-3 rounded-t-lg transition-all duration-300 font-medium relative overflow-hidden whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-lg transform scale-[1.02] border-b-2 border-cyan-300"
                    : "text-white hover:bg-white/20 hover:shadow-md active:scale-95"
                }`}
              >
                <span className="relative z-10 text-sm md:text-base">
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-700/80 via-cyan-700/80 to-blue-700/80 opacity-100 z-0"></span>
                )}
                <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-30 transition-opacity duration-300 z-0"></span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/10 p-6 rounded-b-xl shadow-xl min-h-[400px] backdrop-blur-sm border border-white/20 transition-all duration-300">
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
