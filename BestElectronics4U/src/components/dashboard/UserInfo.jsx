import React, { useEffect, useState } from "react";
import axios from "axios";

const UserInfo = ({ user }) => {
  const [shop, setShop] = useState({ shop_name: "", shop_address: "" });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user.is_vendor) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/vendor/shop/${user.user_id}`)
        .then((res) => setShop(res.data))
        .catch((err) => console.error("❌ Error fetching shop info:", err));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShop((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    axios
      .post(
        `${import.meta.env.VITE_API_URL}/api/vendor/shop/${user.user_id}`,
        shop
      )
      .then(() => {
        alert("✅ Shop info updated!");
        setIsEditing(false);
      })
      .catch(() => alert("❌ Failed to update shop info"));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 p-6 rounded-xl border border-white/10 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full w-8 h-8 flex items-center justify-center">
            👤
          </span>
          User Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white/5">
            <p className="text-cyan-300 text-sm font-medium mb-1">Full Name</p>
            <p className="text-lg">
              {user.first_name} {user.last_name}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white/5">
            <p className="text-cyan-300 text-sm font-medium mb-1">
              Email Address
            </p>
            <p className="text-lg">{user.email}</p>
          </div>

          <div className="p-4 rounded-lg bg-white/5">
            <p className="text-cyan-300 text-sm font-medium mb-1">Address</p>
            <p className="text-lg">{user.address || "Not provided"}</p>
          </div>

          <div className="p-4 rounded-lg bg-white/5">
            <p className="text-cyan-300 text-sm font-medium mb-1">
              Account Type
            </p>
            <p className="text-lg">
              {user.is_vendor
                ? "Vendor"
                : user.paid_user
                ? "Paid User"
                : "Standard User"}
            </p>
          </div>
        </div>
      </div>

      {user.is_vendor && (
        <div className="bg-white/5 p-6 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full w-8 h-8 flex items-center justify-center">
                🏪
              </span>
              Vendor Shop
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition"
              >
                Edit Shop Info
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-cyan-300 mb-1">Shop Name</label>
                <input
                  name="shop_name"
                  value={shop.shop_name}
                  onChange={handleChange}
                  className="w-full bg-white/20 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-cyan-300 mb-1">Shop Address</label>
                <input
                  name="shop_address"
                  value={shop.shop_address}
                  onChange={handleChange}
                  className="w-full bg-white/20 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-cyan-300 text-sm font-medium mb-1">
                  Shop Name
                </p>
                <p className="text-lg">{shop.shop_name || "Not set"}</p>
              </div>

              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-cyan-300 text-sm font-medium mb-1">
                  Shop Address
                </p>
                <p className="text-lg">{shop.shop_address || "Not set"}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserInfo;
