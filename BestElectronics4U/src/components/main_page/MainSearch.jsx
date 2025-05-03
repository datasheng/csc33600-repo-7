import React, { useState } from 'react';

const MainSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', query);
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <section className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-16 px-6 text-white">
      <div className="max-w-3xl mx-auto text-center backdrop-blur-md bg-white/10 p-10 rounded-2xl shadow-xl border border-white/20">
        <h2 className="text-3xl font-extrabold mb-6 drop-shadow">🔍 Find Electronics Near You</h2>
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-4 justify-center flex-wrap"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter product or location..."
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
    </section>
  );
};

export default MainSearch;
