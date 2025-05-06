import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserInfo from "../components/dashboard/UserInfo";
import SavedItems from "../components/dashboard/SavedItems";
import VendorProductForm from "../components/dashboard/VendorProductForm";
import VendorProducts from "../components/dashboard/VendorProducts";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      navigate("/auth"); // redirect if not logged in
    }
  }, [navigate]);

  if (!user) return null; // or loading spinner

  // Define tabs based on user type
  const tabs = [
    { id: "profile", label: "👤 Profile", component: <UserInfo user={user} /> },
    {
      id: "saved",
      label: "🛒 Saved Items",
      component: <SavedItems userId={user.user_id} />,
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
    <div className="min-h-full w-full bg-gradient-to-br from-teal-800 via-cyan-800 to-blue-900 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
          <span role="img" aria-label="dashboard">
            📊
          </span>
          Dashboard
        </h1>

        {/* Tabbed Navigation */}
        <div className="backdrop-blur-md bg-white/10 rounded-t-xl p-2 border border-white/20">
          <div className="flex flex-wrap w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 text-center px-4 py-3 rounded-t-lg transition-colors duration-200 font-medium ${
                  activeTab === tab.id
                    ? "bg-white text-blue-700 font-semibold shadow-md"
                    : "text-white hover:bg-white/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/10 p-6 rounded-b-xl shadow-xl min-h-[400px] backdrop-blur-sm border border-white/20">
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
