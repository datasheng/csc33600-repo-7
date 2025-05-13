import React, { useEffect, useState } from "react";

const PurchasedItems = ({ userId, purchasedItems, setPurchasedItems }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize loading state based on whether purchasedItems is available
    if (purchasedItems !== undefined) {
      setLoading(false);
    }
  }, [purchasedItems]);

  // Calculate total savings
  const calculateSavings = () => {
    if (!purchasedItems || !purchasedItems.length) return 0;

    return purchasedItems.reduce((total, item) => {
      if (item.actual_price && item.discounted_price) {
        const savings =
          Number(item.actual_price) - Number(item.discounted_price);
        return total + (savings > 0 ? savings : 0);
      }
      return total;
    }, 0);
  };

  // Remove a product from purchased items
  const handleRemove = (productId) => {
    // Update purchasedItems by removing the item
    setPurchasedItems((prev) =>
      prev.filter((item) => item.product_id !== productId)
    );
  };

  const totalSavings = calculateSavings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-8 h-8 flex items-center justify-center">
          🛒
        </span>
        <h2 className="text-2xl font-bold">Purchased Products</h2>
      </div>

      {/* Display total savings */}
      <div className="backdrop-blur-md bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-5 mb-6 border border-green-400/20 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="bg-green-500/20 rounded-full p-3 border border-green-400/30 flex-shrink-0 hidden md:flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg text-white font-semibold mb-1">
              Your Total Savings
            </h3>
            <p className="text-3xl font-bold text-green-400">
              ${totalSavings.toFixed(2)}
            </p>
            <p className="text-white/60 text-sm mt-1">
              You've saved this much by finding deals through our platform!
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : !purchasedItems || purchasedItems.length === 0 ? (
        <div className="backdrop-blur-sm bg-white/5 rounded-xl p-8 text-center border border-white/10 shadow-md">
          <div className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4 border border-green-400/20">
            <span className="text-3xl">🛒</span>
          </div>
          <p className="text-white/70 text-lg font-medium">
            No purchased products yet.
          </p>
          <p className="text-white/50 mt-2 max-w-md mx-auto">
            Mark products as purchased from your liked items to track your
            savings!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {purchasedItems.map((item) => (
            <div
              key={item.product_id}
              className="backdrop-blur-sm bg-white/5 rounded-xl overflow-hidden border border-white/20 hover:border-green-400/70 transition-all duration-300 group shadow-lg shadow-green-900/10 hover:shadow-emerald-600/20 flex flex-col"
            >
              <div className="relative h-48 bg-gradient-to-br from-green-900/40 via-emerald-800/40 to-teal-900/40 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-950/30 z-0"></div>
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  className="w-full h-full object-contain p-4 relative z-10 transition-transform group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 z-20">
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    className="bg-white/10 backdrop-blur-md hover:bg-red-500/70 text-white rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-all border border-white/10 shadow-lg"
                    title="Remove from purchased items"
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
                    <div className="absolute bottom-2 right-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-md text-xs font-medium z-20 shadow-md backdrop-blur-sm border border-white/10">
                      Saved $
                      {(
                        Number(item.actual_price) -
                        Number(item.discounted_price)
                      ).toFixed(2)}
                    </div>
                  )}
                <div className="absolute top-2 left-2 bg-green-500/70 text-white rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-md z-20">
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 text-white break-words line-clamp-2">
                    {item.product_name}
                  </h3>
                  <p className="text-sm text-green-300 mb-3 flex items-center gap-1">
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
                        className="px-2.5 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded text-xs transition-all shadow-md border border-white/10"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-1 text-xs text-white/60">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {new Date().toLocaleDateString()}
                  </div>
                  <span className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-300 text-xs px-2 py-1 rounded-md border border-green-500/20">
                    Purchased
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchasedItems;
