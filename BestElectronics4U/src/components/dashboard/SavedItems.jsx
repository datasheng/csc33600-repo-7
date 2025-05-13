import React, { useEffect, useState } from "react";
import axios from "axios";

const SavedItems = ({
  userId,
  savedItems,
  setSavedItems,
  purchasedItems,
  setPurchasedItems,
}) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);

  useEffect(() => {
    // Update local items whenever the savedItems prop changes
    if (savedItems && Array.isArray(savedItems)) {
      setItems(savedItems);
      setLoading(false);
    } else if (!savedItems && userId) {
      // If no savedItems are provided but we have a userId, fetch them
      setLoading(true);
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/saved-items/${userId}`)
        .then((res) => {
          setItems(res.data);
          // Also update global state if this was a direct fetch
          if (setSavedItems) {
            setSavedItems(res.data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch saved items:", err);
          setLoading(false);
        });
    }
  }, [userId, savedItems, setSavedItems]);

  const handleRemove = async (productId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/saved-items`, {
        data: { user_id: userId, product_id: productId },
      });

      // Update local component state
      setItems((prev) => prev.filter((item) => item.product_id !== productId));

      // Also update global state for other components
      if (setSavedItems) {
        setSavedItems((prev) =>
          prev.filter((item) => item.product_id !== productId)
        );
      }
    } catch (err) {
      console.error("❌ Failed to remove item:", err);
    }
  };

  const handleMarkAsPurchased = (productId) => {
    // Find the item to mark as purchased
    const item = items.find((item) => item.product_id === productId);
    if (!item) return;

    // Add timestamp to the item
    const itemWithTimestamp = {
      ...item,
      purchase_date: new Date().toISOString(),
    };

    // Add to purchased items
    setPurchasedItems((prev) => [...(prev || []), itemWithTimestamp]);

    // Show success message
    setPurchaseSuccess({
      name: item.product_name,
      savings:
        item.actual_price && item.discounted_price
          ? (Number(item.actual_price) - Number(item.discounted_price)).toFixed(
              2
            )
          : 0,
    });

    // Clear success message after 3 seconds
    setTimeout(() => setPurchaseSuccess(null), 3000);

    // Remove from saved items
    handleRemove(productId);
  };

  return (
    <div className="space-y-6 relative">
      {purchaseSuccess && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-indigo-900/80 to-blue-900/80 backdrop-blur-md text-white p-4 rounded-lg shadow-lg z-50 animate-fadeIn border border-white/20">
          <div className="flex items-center gap-2">
            <span className="text-lg bg-green-500/30 rounded-full p-1 backdrop-blur-md border border-green-400/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
            <div>
              <p className="font-semibold">
                {purchaseSuccess.name} marked as purchased!
              </p>
              {purchaseSuccess.savings > 0 && (
                <p className="text-sm text-cyan-300">
                  You saved ${purchaseSuccess.savings}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <span className="bg-gradient-to-r from-pink-500 to-red-500 rounded-full w-8 h-8 flex items-center justify-center">
          ❤️
        </span>
        <h2 className="text-2xl font-bold">Liked Products</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
          <div className="text-5xl mb-4">❤️</div>
          <p className="text-white/70 text-lg">No products liked yet.</p>
          <p className="text-white/50 mt-2">
            Products you like while shopping will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="backdrop-blur-sm bg-white/5 rounded-xl overflow-hidden border border-white/20 hover:border-cyan-400/70 transition-all duration-300 group shadow-lg shadow-indigo-900/10 hover:shadow-cyan-600/20 flex flex-col"
            >
              <div className="relative h-48 bg-gradient-to-br from-indigo-900/40 via-cyan-800/40 to-blue-900/40 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-950/30 z-0"></div>
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  className="w-full h-full object-contain p-4 relative z-10 transition-transform group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 z-20">
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    className="bg-white/10 backdrop-blur-md hover:bg-red-500/70 text-white rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-all border border-white/10 shadow-lg"
                    title="Remove from saved items"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                {item.actual_price &&
                  item.discounted_price &&
                  Number(item.actual_price) > Number(item.discounted_price) && (
                    <div className="absolute bottom-2 right-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium z-20 shadow-md backdrop-blur-sm border border-white/10">
                      Save $
                      {(
                        Number(item.actual_price) -
                        Number(item.discounted_price)
                      ).toFixed(2)}
                    </div>
                  )}
                <div className="absolute top-2 left-2 bg-pink-500/70 text-white rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-md z-20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 text-white break-words line-clamp-2">
                    {item.product_name}
                  </h3>
                  <p className="text-sm text-cyan-300 mb-3 flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    {item.shop_name || "Unknown"}
                  </p>

                  <div className="bg-white/5 rounded-lg p-2 border border-white/10 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        {item.discounted_price && (
                          <span className="text-green-400 font-medium">
                            ${Number(item.discounted_price).toFixed(2)}
                          </span>
                        )}
                        {item.actual_price &&
                          item.actual_price !== item.discounted_price && (
                            <div className="line-through text-red-400 text-xs">
                              ${Number(item.actual_price).toFixed(2)}
                            </div>
                          )}
                      </div>
                      <a
                        href={item.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white rounded text-xs transition-all shadow-md border border-white/10"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleMarkAsPurchased(item.product_id)}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-900 via-cyan-800 to-blue-900 hover:from-indigo-800 hover:via-cyan-700 hover:to-blue-800 text-white rounded-md transition-all shadow-lg flex items-center justify-center gap-2 backdrop-blur-sm border border-white/10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Mark as Purchased
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItems;
