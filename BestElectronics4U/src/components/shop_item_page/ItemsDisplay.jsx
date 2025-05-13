import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ItemsDisplay = ({ searchQuery, user, savedItems, setSavedItems }) => {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [likedItemIds, setLikedItemIds] = useState(new Set());
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [loading, setLoading] = useState(false);

  // Check if user has paid subscription or is a vendor
  const isPaidOrVendor = user && (user.paid_user || user.is_vendor);

  const limit = 30; // items per page

  // Function to truncate URLs
  const truncateUrl = (url) => {
    try {
      if (!url) return "";

      // Remove protocol
      let cleanUrl = url.replace(/(^\w+:|^)\/\//, "");

      // Remove 'www.' if present
      cleanUrl = cleanUrl.replace(/^www\./, "");

      // Remove trailing slash
      cleanUrl = cleanUrl.replace(/\/$/, "");

      // Extract domain only (remove path)
      const domain = cleanUrl.split("/")[0];

      // If domain is already short, return it
      if (domain.length < 20) {
        return domain;
      }

      // Otherwise, truncate the domain
      return domain.substring(0, 18) + "...";
    } catch (e) {
      console.error("Error truncating URL:", e);
      // If there's an error, return a generic label
      return "Visit site";
    }
  };

  // Toggle description expansion
  const toggleDescription = (productId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const fetchItems = async (reset = false) => {
    try {
      setLoading(true);
      const currentOffset = reset ? 0 : offset;
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
        params: { offset: currentOffset, limit, query: searchQuery },
      });

      if (res.data.length < limit) setHasMore(false);
      else setHasMore(true);

      setItems(res.data);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update likedItemIds when savedItems changes
  useEffect(() => {
    if (savedItems && Array.isArray(savedItems)) {
      const productIds = savedItems.map((item) => String(item.product_id));
      setLikedItemIds(new Set(productIds));
      console.log("Updated liked items on render/refresh:", productIds);
    } else {
      setLikedItemIds(new Set());
    }
  }, [savedItems]);

  const handleSaveItem = async (product_id) => {
    if (!user) {
      alert("❌ You must be logged in to like items!");
      return;
    }

    try {
      const productIdStr = String(product_id);
      const isAlreadyLiked = likedItemIds.has(productIdStr);

      if (isAlreadyLiked) {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/saved-items`, {
          data: { user_id: user.user_id, product_id },
        });

        setSavedItems((prev) =>
          prev.filter((item) => String(item.product_id) !== productIdStr)
        );

        const newLikedIds = new Set(likedItemIds);
        newLikedIds.delete(productIdStr);
        setLikedItemIds(newLikedIds);

        console.log("Item unliked:", productIdStr);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/saved-items`, {
          user_id: user.user_id,
          product_id,
        });

        const newLikedIds = new Set(likedItemIds);
        newLikedIds.add(productIdStr);
        setLikedItemIds(newLikedIds);

        const itemToAdd = items.find(
          (item) => String(item.product_id) === productIdStr
        );
        if (itemToAdd) {
          setSavedItems((prev) => [...prev, itemToAdd]);
        } else {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/saved-items/${user.user_id}`
          );
          setSavedItems(res.data || []);
        }

        console.log("Item liked:", productIdStr);
      }
    } catch (err) {
      console.error("❌ Error managing liked item:", err);
    }
  };

  const isItemLiked = (productId) => likedItemIds.has(String(productId));

  // Fetch items when offset changes
  useEffect(() => {
    fetchItems();
    window.scrollTo({ top: 0, behavior: "smooth" }); //scroll to top on page change
  }, [offset]);

  // Reset offset & fetch on new search query
  useEffect(() => {
    setOffset(0);
    fetchItems(true);
  }, [searchQuery]);

  const handlePrevPage = () => {
    if (offset >= limit) setOffset((prev) => prev - limit);
  };

  const handleNextPage = () => {
    if (hasMore) setOffset((prev) => prev + limit);
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4">
      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {items.map((item, index) => {
          const liked = isItemLiked(item.product_id);
          return (
            <div
              key={index}
              className={`bg-white/10 border border-white/20 p-3 sm:p-4 rounded-xl shadow-lg backdrop-blur-md flex flex-col h-full relative overflow-hidden ${
                !isPaidOrVendor ? "select-none" : ""
              }`}
            >
              {/* Image */}
              <div className="w-full h-36 sm:h-48 flex justify-center items-center mb-3 sm:mb-4">
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  className={`max-h-full object-contain w-full rounded-lg ${
                    !isPaidOrVendor ? "blur-sm" : ""
                  }`}
                />
              </div>

              {/* Details */}
              <div
                className={`flex flex-col flex-grow ${
                  !isPaidOrVendor ? "blur-sm" : ""
                }`}
              >
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2 break-words line-clamp-2 hover:line-clamp-none">
                  {item.product_name}
                </h3>

                <div className="text-xs sm:text-sm text-white/80">
                  <p className="mb-1">
                    <strong>Rating:</strong> ⭐ {item.rating} (
                    {item.rating_count} reviews)
                  </p>
                  <p className="mb-1">
                    <strong>Shop:</strong> {item.shop_name || "Unknown"}
                  </p>
                  <p className="text-xs sm:text-sm text-white/80 mb-2 flex items-center">
                    <strong className="whitespace-nowrap mr-1">
                      External Site:
                    </strong>{" "}
                    <a
                      href={isPaidOrVendor ? item.external_url : "#"}
                      target={isPaidOrVendor ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="text-cyan-300 underline hover:text-cyan-100 truncate max-w-[120px] sm:max-w-[150px] inline-block align-bottom"
                      title={item.external_url}
                      onClick={(e) => !isPaidOrVendor && e.preventDefault()}
                    >
                      {truncateUrl(item.external_url)}
                    </a>
                  </p>
                </div>

                <div className="text-xs sm:text-sm text-white/80 mb-2">
                  <p
                    className={
                      expandedDescriptions[item.product_id]
                        ? ""
                        : "line-clamp-2"
                    }
                  >
                    {item.about_product}
                  </p>
                  {item.about_product && item.about_product.length > 120 && (
                    <button
                      onClick={() =>
                        isPaidOrVendor && toggleDescription(item.product_id)
                      }
                      className="text-cyan-300 hover:text-cyan-100 text-xs mt-1 transition-colors"
                      disabled={!isPaidOrVendor}
                    >
                      {expandedDescriptions[item.product_id]
                        ? "Show Less"
                        : "Read More"}
                    </button>
                  )}
                </div>

                <div className="mt-auto">
                  <p className="text-lime-300 text-lg sm:text-xl font-bold mt-2 sm:mt-3">
                    ${item.discounted_price.toFixed(2)}
                    <span className="line-through text-red-400 text-xs sm:text-sm ml-2">
                      ${item.actual_price.toFixed(2)}
                    </span>
                  </p>

                  {/* Like button */}
                  <button
                    onClick={() =>
                      isPaidOrVendor && handleSaveItem(item.product_id)
                    }
                    className={`mt-2 sm:mt-3 w-full py-1.5 sm:py-2 rounded-md transition font-semibold flex items-center justify-center gap-2 ${
                      liked
                        ? "bg-pink-500 text-white hover:bg-pink-600 active:bg-pink-700"
                        : "bg-white text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200"
                    } ${
                      !isPaidOrVendor ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    data-product-id={item.product_id}
                    disabled={!isPaidOrVendor}
                  >
                    {liked ? "Liked " : "Like "}
                    <span className="text-xl" role="img" aria-label="heart">
                      {liked ? "❤️" : "🤍"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Subscription Message Overlay for non-paid users */}
              {!isPaidOrVendor && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 sm:p-6 backdrop-blur-sm z-10">
                  <div className="bg-gradient-to-r from-indigo-800 to-cyan-800 p-1 rounded-full mb-3 sm:mb-4">
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 text-center">
                    Premium Content
                  </h3>
                  <p className="text-white/80 text-sm text-center mb-3 sm:mb-4">
                    Subscribe to view product details and make purchases
                  </p>
                  <Link
                    to="/pricing"
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 active:from-indigo-800 active:to-cyan-800 text-white text-sm sm:text-base font-medium rounded-md transition-colors"
                  >
                    View Pricing Plans
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="text-center text-white mt-4 animate-pulse">
          Loading...
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-4 sm:mt-6 gap-2 sm:gap-4">
        <button
          onClick={handlePrevPage}
          disabled={offset === 0}
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base disabled:opacity-50"
        >
          ⬅ Prev
        </button>

        <span className="text-white font-semibold text-sm sm:text-base">
          Page {Math.floor(offset / limit) + 1}
        </span>

        <button
          onClick={handleNextPage}
          disabled={!hasMore}
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base disabled:opacity-50"
        >
          Next ➡
        </button>
      </div>
    </div>
  );
};

export default ItemsDisplay;
