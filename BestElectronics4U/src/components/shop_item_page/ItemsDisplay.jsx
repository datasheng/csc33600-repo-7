import React, { useEffect, useState } from "react";
import axios from "axios";

const ItemsDisplay = ({ searchQuery, user, savedItems, setSavedItems }) => {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [likedItemIds, setLikedItemIds] = useState(new Set());
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // Toggle description expansion
  const toggleDescription = (productId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const fetchItems = async (reset = false) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
        params: { offset: reset ? 0 : offset, query: searchQuery },
      });

      if (res.data.length < 30) setHasMore(false);
      else setHasMore(true);

      setItems((prev) => (reset ? res.data : [...prev, ...res.data]));
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    }
  };

  // Update the useEffect that sets up likedItemIds to be more resilient
  useEffect(() => {
    if (savedItems && Array.isArray(savedItems)) {
      // Extract product_id values and ensure they're strings for consistent comparison
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
        // If already liked, unlike it
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/saved-items`, {
          data: { user_id: user.user_id, product_id },
        });

        // Update local state by removing this product ID
        setSavedItems((prev) =>
          prev.filter((item) => String(item.product_id) !== productIdStr)
        );

        // Also update the likedItemIds set immediately for instant UI feedback
        const newLikedIds = new Set(likedItemIds);
        newLikedIds.delete(productIdStr);
        setLikedItemIds(newLikedIds);

        console.log("Item unliked:", productIdStr);
        alert("Item unliked");
      } else {
        // If not liked, like it
        await axios.post(`${import.meta.env.VITE_API_URL}/api/saved-items`, {
          user_id: user.user_id,
          product_id,
        });

        // Update local state immediately for instant UI feedback
        const newLikedIds = new Set(likedItemIds);
        newLikedIds.add(productIdStr);
        setLikedItemIds(newLikedIds);

        // Get the current item's details to add to savedItems
        const itemToAdd = items.find(
          (item) => String(item.product_id) === productIdStr
        );
        if (itemToAdd) {
          setSavedItems((prev) => [...prev, itemToAdd]);
        } else {
          // Fallback to fetching complete list if we can't find the item
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/saved-items/${user.user_id}`
          );
          setSavedItems(res.data || []);
        }

        console.log("Item liked:", productIdStr);
        alert("✅ Item liked successfully!");
      }
    } catch (err) {
      console.error("❌ Error managing liked item:", err);
      alert("❌ Failed to update liked status.");
    }
  };

  // Helper function to check if a specific product is liked
  const isItemLiked = (productId) => {
    return likedItemIds.has(String(productId));
  };

  useEffect(() => {
    if (offset > 0 && hasMore) {
      fetchItems();
    }
  }, [offset]);

  useEffect(() => {
    setOffset(0);
    fetchItems(true);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 50 &&
        hasMore
      ) {
        setOffset((prev) => prev + 30);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => {
          // Check if this specific product is liked
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
                <strong>External Site:</strong>{' '}
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

                  {/* Like button with heart icon */}
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
    </div>
  );
};

export default ItemsDisplay;
