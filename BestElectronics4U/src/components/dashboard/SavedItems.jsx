import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SavedItems = ({ userId }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/saved-items/${userId}`)
      .then((res) => setItems(res.data))
      .catch((err) => console.error('❌ Failed to fetch saved items:', err));
  }, [userId]);

  return (
    <div className="bg-white/10 p-6 rounded-xl shadow space-y-4">
      <h2 className="text-2xl font-bold text-white">🛒 Saved for Later</h2>

      {items.length === 0 ? (
        <p className="text-white/70">No items saved yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="flex bg-white/5 p-4 rounded-lg border border-white/20 shadow hover:bg-white/10 transition"
            >
              {/* Image */}
              <div className="w-24 h-24 flex-shrink-0 mr-4">
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  className="w-full h-full object-contain rounded border"
                />
              </div>

              {/* Details */}
              <div className="flex flex-col justify-between text-white">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{item.product_name}</h3>
                  <p className="text-sm text-white/80">
                    Shop:{' '}
                    <span className="text-cyan-300">
                      {item.shop_name || 'Unknown'}
                    </span>
                  </p>
                </div>

                <p className="text-xs break-all mt-2 text-cyan-300">
                <a
                  href={item.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-cyan-100"
                >
                  {item.external_url}
                </a>
              </p>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItems;
