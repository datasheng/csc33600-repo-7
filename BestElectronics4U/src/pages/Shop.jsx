import React, { useState } from 'react';
import ItemsDisplay from '../components/shop_item_page/ItemsDisplay';

const Shop = ({ user, savedItems, setSavedItems }) => {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('🔍 Searching for:', query);
    setSearchTerm(query); // Trigger new search
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-teal-800 via-cyan-800 to-blue-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
          <span role="img" aria-label="briefcase">💼</span>
          Product Listings
        </h1>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12 backdrop-blur-md bg-white/10 p-6 rounded-2xl shadow-xl border border-white/20">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-4 justify-center flex-wrap"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full md:w-2/3 px-4 py-2 rounded-md bg-white/20 text-white placeholder-white/70 border border-white/30 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/30 transition"
            />
            <button
              type="submit"
              className="bg-white text-indigo-700 hover:bg-indigo-100 px-6 py-2 rounded-md font-semibold transition shadow-md"
            >
              Search
            </button>
          </form>
        </div>

        {/* Items list with user and cart props passed */}
        <ItemsDisplay
          searchQuery={searchTerm}
          user={user}
          savedItems={savedItems}
          setSavedItems={setSavedItems}
        />
      </div>
    </div>
  );
};

export default Shop;
