import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ItemsDisplay = ({ searchQuery, user, savedItems, setSavedItems }) => {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchItems = async (reset = false) => {
    try {
      const res = await axios.get('http://localhost:5000/products', {
        params: { offset: reset ? 0 : offset, query: searchQuery }
      });

      if (res.data.length < 30) setHasMore(false);
      else setHasMore(true);

      setItems(prev => reset ? res.data : [...prev, ...res.data]);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    }
  };

  const handleSaveItem = async (product_id) => {
    if (!user) {
      alert('❌ You must be logged in to save items!');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/saved-items', {
        user_id: user.user_id,
        product_id
      });

      // Re-fetch saved items and update shared state
      const res = await axios.get(`http://localhost:5000/api/saved-items/${user.user_id}`);
      setSavedItems(res.data || []);

      alert('✅ Item saved to cart!');
    } catch (err) {
      console.error('❌ Error saving item:', err);
      alert('❌ Failed to save item.');
    }
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
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 50 &&
        hasMore
      ) {
        setOffset(prev => prev + 30);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="space-y-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white/10 border border-white/20 p-4 rounded-xl shadow-lg backdrop-blur-md flex flex-col md:flex-row gap-4"
          >
            {/* Image */}
            <div className="md:w-1/3 w-full flex justify-center items-center">
              <img
                src={item.image_url}
                alt={item.product_name}
                className="max-h-48 object-contain w-full rounded-lg"
              />
            </div>

            {/* Details */}
            <div className="md:w-2/3 w-full flex flex-col justify-between">
              <h3 className="text-lg md:text-xl font-semibold text-white mb-1 line-clamp-2">
                {item.product_name}
              </h3>

              <p className="text-sm text-white/80 mb-1">
                <strong>Rating:</strong> ⭐ {item.rating} ({item.rating_count} reviews)
              </p>

              <p className="text-sm text-white/80 mb-1">
                <strong>Shop:</strong> {item.shop_name || 'Unknown'}
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

              <p className="text-sm text-white/80 mb-2 line-clamp-3">
                {item.about_product}
              </p>

              <p className="text-lime-300 text-xl font-bold mt-1">
                ${item.discounted_price.toFixed(2)}
                <span className="line-through text-red-400 text-sm ml-2">
                  ${item.actual_price.toFixed(2)}
                </span>
              </p>

              {/* Save for later button */}
              <button
                onClick={() => handleSaveItem(item.product_id)}
                className="mt-4 w-full bg-white text-indigo-700 py-2 rounded-md hover:bg-indigo-100 transition font-semibold"
              >
                Save for Later 🛒
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemsDisplay;
