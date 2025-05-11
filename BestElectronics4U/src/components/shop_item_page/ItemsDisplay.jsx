import React, { useEffect, useState } from "react";
import axios from "axios";

const ItemsDisplay = ({ searchQuery, user, savedItems, setSavedItems }) => {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [likedItemIds, setLikedItemIds] = useState(new Set());
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [loading, setLoading] = useState(false);

  const limit = 30; // items per page

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
      console.log(
        `Fetching products from ${
          import.meta.env.VITE_API_URL
        }/products with offset ${currentOffset}`
      );

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
        params: { offset: currentOffset, limit, query: searchQuery },
      });

      console.log(`Received ${res.data?.length || 0} products from backend`);

      if (res.data.length < limit) setHasMore(false);
      else setHasMore(true);

      setItems(res.data);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      console.error(
        "Error details:",
        error.response?.data || "No response data"
      );
      console.error("Status code:", error.response?.status || "No status code");
      alert(
        `❌ Failed to fetch products. Please try again. (${error.message})`
      );
    } finally {
      setLoading(false);
    }
  };

  // Update likedItemIds when savedItems changes
  useEffect(() => {
    if (savedItems && Array.isArray(savedItems)) {
      const productIds = savedItems.map((item) => String(item.product_id));
      setLikedItemIds(new Set(productIds));
      // console.log("Updated liked items on render/refresh:", productIds);
    } else {
      setLikedItemIds(new Set());
    }
  }, [savedItems]);

  const handleSaveItem = async (product_id) => {
    if (!user) {
      alert("❌ You must be logged in to like items!");
      return;
    }

    // Get proper user ID
    const userId = user.user_id || user.id;
    if (!userId) {
      console.error("No user ID found in user object:", user);
      alert("❌ User ID not found. Please log in again.");
      return;
    }

    try {
      const productIdStr = String(product_id);
      const isAlreadyLiked = likedItemIds.has(productIdStr);

      // console.log(
      //   `${
      //     isAlreadyLiked ? "Unliking" : "Liking"
      //   } product: ${productIdStr} for user: ${userId}`
      // );

      if (isAlreadyLiked) {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/saved-items`, {
          data: { user_id: userId, product_id: String(product_id) },
        });

        setSavedItems((prev) =>
          prev.filter((item) => String(item.product_id) !== productIdStr)
        );

        const newLikedIds = new Set(likedItemIds);
        newLikedIds.delete(productIdStr);
        setLikedItemIds(newLikedIds);

        // console.log("Item unliked:", productIdStr);
        alert("✓ Item removed from saved items");
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/saved-items`,
          {
            user_id: userId,
            product_id: String(product_id),
          }
        );

        // console.log("Save item response:", response.data);

        const newLikedIds = new Set(likedItemIds);
        newLikedIds.add(productIdStr);
        setLikedItemIds(newLikedIds);

        const itemToAdd = items.find(
          (item) => String(item.product_id) === productIdStr
        );
        if (itemToAdd) {
          setSavedItems((prev) => [...prev, itemToAdd]);
        } else {
          // Get proper user ID
          const userId = user.user_id || user.id;
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/saved-items/${userId}`
          );
          setSavedItems(res.data || []);
        }

        // console.log("Item liked:", productIdStr);
        alert("✅ Item liked successfully!");
      }
    } catch (err) {
      console.error("❌ Error managing liked item:", err);
      console.error("Error details:", err.response?.data || "No response data");
      console.error("Status code:", err.response?.status || "No status code");

      // Provide more specific error messages based on the error
      let errorMessage = `Failed to update liked status: ${err.message}`;

      if (err.response?.data?.message) {
        // Use the server's error message if available
        errorMessage = `${err.response.data.message}`;
      } else if (err.response?.status === 401) {
        errorMessage = "You need to log in again to like items.";
      } else if (err.response?.status === 400) {
        errorMessage = "Invalid request. Please try again.";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }

      alert(`❌ ${errorMessage}`);
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
    <div className="max-w-6xl mx-auto p-4">
      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => {
          const liked = isItemLiked(item.product_id);
          return (
            <div
              key={index}
              className="bg-white/10 border border-white/20 p-4 rounded-xl shadow-lg backdrop-blur-md flex flex-col h-full"
            >
              {/* Image */}
              <div className="w-full h-48 flex justify-center items-center mb-4">
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  className="max-h-full object-contain w-full rounded-lg"
                />
              </div>

              {/* Details */}
              <div className="flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-white mb-2 break-words line-clamp-2 hover:line-clamp-none">
                  {item.product_name}
                </h3>

                <div className="text-sm text-white/80">
                  <p className="mb-1">
                    <strong>Rating:</strong> ⭐ {item.rating} (
                    {item.rating_count} reviews)
                  </p>
                  <p className="mb-1">
                    <strong>Shop:</strong> {item.shop_name || "Unknown"}
                  </p>
                  <p className="text-sm text-white/80 break-words mb-2">
                    <strong>External Site:</strong>{" "}
                    <a
                      href={item.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 underline break-all hover:text-cyan-100"
                    >
                      {item.external_url}
                    </a>
                  </p>
                </div>

                <div className="text-sm text-white/80 mb-2">
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
                      onClick={() => toggleDescription(item.product_id)}
                      className="text-cyan-300 hover:text-cyan-100 text-xs mt-1 transition-colors"
                    >
                      {expandedDescriptions[item.product_id]
                        ? "Show Less"
                        : "Read More"}
                    </button>
                  )}
                </div>

                <div className="mt-auto">
                  <p className="text-lime-300 text-xl font-bold mt-3">
                    ${item.discounted_price.toFixed(2)}
                    <span className="line-through text-red-400 text-sm ml-2">
                      ${item.actual_price.toFixed(2)}
                    </span>
                  </p>

                  {/* Like button */}
                  <button
                    onClick={() => handleSaveItem(item.product_id)}
                    className={`mt-3 w-full py-2 rounded-md transition font-semibold flex items-center justify-center gap-2 ${
                      liked
                        ? "bg-pink-500 text-white hover:bg-pink-600"
                        : "bg-white text-indigo-700 hover:bg-indigo-100"
                    }`}
                    data-product-id={item.product_id}
                  >
                    {liked ? "Liked " : "Like "}
                    <span className="text-xl" role="img" aria-label="heart">
                      {liked ? "❤️" : "🤍"}
                    </span>
                  </button>
                </div>
              </div>
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
      <div className="flex justify-center items-center mt-6 gap-4">
        <button
          onClick={handlePrevPage}
          disabled={offset === 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          ⬅ Prev
        </button>

        <span className="text-white font-semibold">
          Page {Math.floor(offset / limit) + 1}
        </span>

        <button
          onClick={handleNextPage}
          disabled={!hasMore}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Next ➡
        </button>
      </div>
    </div>
  );
};

export default ItemsDisplay;
