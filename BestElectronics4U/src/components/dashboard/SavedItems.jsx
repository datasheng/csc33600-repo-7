import React, { useEffect, useState } from "react";
import axios from "axios";

const SavedItems = ({ userId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/saved-items/${userId}`)
      .then((res) => {
        setItems(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch saved items:", err);
        setLoading(false);
      });
  }, [userId]);

  const handleRemove = async (productId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/saved-items`, {
        data: { user_id: userId, product_id: productId },
      });
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
    } catch (err) {
      console.error("❌ Failed to remove item:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full w-8 h-8 flex items-center justify-center">
          🛒
        </span>
        <h2 className="text-2xl font-bold">Saved Items</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-white/70 text-lg">No items saved yet.</p>
          <p className="text-white/50 mt-2">
            Items you save while shopping will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-cyan-400 transition-all duration-300 group"
            >
              <div className="relative h-48 bg-gradient-to-br from-indigo-900/50 to-cyan-900/50">
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  className="w-full h-full object-contain p-4"
                />
                <button
                  onClick={() => handleRemove(item.product_id)}
                  className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from saved items"
                >
                  ❌
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 text-white truncate">
                  {item.product_name}
                </h3>
                <p className="text-sm text-cyan-300 mb-3">
                  Shop: {item.shop_name || "Unknown"}
                </p>

                <div className="flex justify-between items-center">
                  <a
                    href={item.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white rounded text-sm transition-colors"
                  >
                    View Product
                  </a>

                  {item.discounted_price && (
                    <span className="text-green-400 font-medium">
                      ${item.discounted_price}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItems;
