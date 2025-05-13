import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import ProfileIcon from "./ProfileIcon";
import axios from "axios";

const Header = ({
  user,
  setUser,
  savedItems,
  setSavedItems,
  setShowResults,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const cartRef = useRef();

  const [cartOpen, setCartOpen] = useState(false);

  const handleHomeClick = () => {
    if (location.pathname === "/") {
      setShowResults?.(false);
    }
    window.scrollTo(0, 0);
  };

  const handleLinkClick = () => {
    window.scrollTo(0, 0);
  };

  const fetchSavedItems = async () => {
    if (user?.user_id) {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/saved-items/${user.user_id}`
        );
        setSavedItems(res.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch saved items:", err.message);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedItems();
    }
  }, [user]); // Only depend on user changes, not on savedItems.length

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRemove = async (product_id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/saved-items`, {
        data: { user_id: user.user_id, product_id },
      });
      setSavedItems((prev) =>
        prev.filter((item) => item.product_id !== product_id)
      );
    } catch (err) {
      console.error("❌ Failed to remove item:", err.message);
    }
  };

  return (
    <header className="sticky top-0 z-[999] bg-gradient-to-r from-indigo-800 via-cyan-700 to-blue-700 shadow-md px-10 py-5 flex justify-between items-center backdrop-blur-sm">
      {/* Left section - Logo */}
      <div className="flex-shrink-0">
        <Link to="/" onClick={handleHomeClick}>
          <img
            src={logo}
            alt="BestElectronics4U Logo"
            className="w-32 rounded-md"
          />
        </Link>
      </div>

      {/* Center section - Navigation Tabs */}
      <nav className="flex-grow flex justify-center">
        <ul className="flex items-center gap-4 text-white font-medium text-[1.1rem]">
          <li>
            <Link
              to="/"
              onClick={handleHomeClick}
              className={`px-4 py-2 rounded-md transition-all duration-300 relative overflow-hidden ${
                location.pathname === "/"
                  ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-lg transform scale-[1.02] border-b-2 border-cyan-300"
                  : "text-white hover:bg-white/20 hover:shadow-md active:scale-95"
              }`}
            >
              <span className="relative z-10">Home</span>
              {location.pathname === "/" && (
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-700/80 via-cyan-700/80 to-blue-700/80 opacity-100 z-0"></span>
              )}
              <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-30 transition-opacity duration-300 z-0"></span>
            </Link>
          </li>
          <li>
            <Link
              to="/shop"
              onClick={handleLinkClick}
              className={`px-4 py-2 rounded-md transition-all duration-300 relative overflow-hidden ${
                location.pathname === "/shop"
                  ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-lg transform scale-[1.02] border-b-2 border-cyan-300"
                  : "text-white hover:bg-white/20 hover:shadow-md active:scale-95"
              }`}
            >
              <span className="relative z-10">Shop</span>
              {location.pathname === "/shop" && (
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-700/80 via-cyan-700/80 to-blue-700/80 opacity-100 z-0"></span>
              )}
              <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-30 transition-opacity duration-300 z-0"></span>
            </Link>
          </li>
          {[
            { label: "Pricing", to: "/pricing" },
            { label: "About", to: "/about" },
            { label: "Contact", to: "/contact" },
          ].map(({ label, to }) => (
            <li key={to}>
              <Link
                to={to}
                onClick={handleLinkClick}
                className={`px-4 py-2 rounded-md transition-all duration-300 relative overflow-hidden ${
                  location.pathname === to
                    ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-lg transform scale-[1.02] border-b-2 border-cyan-300"
                    : "text-white hover:bg-white/20 hover:shadow-md active:scale-95"
                }`}
              >
                <span className="relative z-10">{label}</span>
                {location.pathname === to && (
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-700/80 via-cyan-700/80 to-blue-700/80 opacity-100 z-0"></span>
                )}
                <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-30 transition-opacity duration-300 z-0"></span>
              </Link>
            </li>
          ))}
          {user && (
            <li>
              <Link
                to="/dashboard"
                onClick={handleLinkClick}
                className={`px-4 py-2 rounded-md transition-all duration-300 relative overflow-hidden ${
                  location.pathname === "/dashboard"
                    ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-lg transform scale-[1.02] border-b-2 border-cyan-300"
                    : "text-white hover:bg-white/20 hover:shadow-md active:scale-95"
                }`}
              >
                <span className="relative z-10">Dashboard</span>
                {location.pathname === "/dashboard" && (
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-700/80 via-cyan-700/80 to-blue-700/80 opacity-100 z-0"></span>
                )}
                <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-30 transition-opacity duration-300 z-0"></span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Right section - Likes and Profile */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="relative" ref={cartRef}>
            <button
              onClick={() => setCartOpen((prev) => !prev)}
              className="relative text-white text-xl px-3 hover:text-pink-300 transition"
              title="Liked Products"
            >
              ❤️
              {savedItems.length > 0 && (
                <span className="absolute -top-2 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {savedItems.length}
                </span>
              )}
            </button>
            {cartOpen && (
              <div className="absolute right-0 mt-2 w-96 max-h-[70vh] overflow-y-auto bg-gradient-to-br from-indigo-900/95 via-blue-900/95 to-cyan-900/95 text-white rounded-xl shadow-xl z-50 backdrop-blur-md border border-white/20">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-indigo-800 via-cyan-700 to-blue-700 px-4 py-3 rounded-t-xl flex items-center gap-2 border-b border-white/10">
                  <span className="bg-gradient-to-r from-pink-500 to-red-500 rounded-full w-8 h-8 flex items-center justify-center">
                    ❤️
                  </span>
                  <h3 className="text-lg font-semibold text-white">
                    Liked Products
                  </h3>
                </div>

                {/* Content */}
                <div className="p-4">
                  {savedItems.length === 0 ? (
                    <div className="bg-white/5 rounded-xl p-6 text-center border border-white/10">
                      <div className="text-4xl mb-3">❤️</div>
                      <p className="text-white/70">No products liked yet.</p>
                      <p className="text-white/50 mt-2 text-sm">
                        Products you like will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedItems.map((item) => (
                        <div
                          key={item.product_id}
                          className="bg-white/10 rounded-lg overflow-hidden border border-white/10 hover:border-cyan-400 transition-all duration-300 group flex gap-3"
                        >
                          {/* Image container */}
                          <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-900/50 to-cyan-900/50 flex-shrink-0">
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="w-full h-full object-contain p-2"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex flex-col py-2 pr-2 flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-white text-sm break-words pr-2">
                                {item.product_name}
                              </h4>
                              <button
                                onClick={() => handleRemove(item.product_id)}
                                className="text-pink-500 hover:text-pink-300 transition-colors mt-0.5 ml-1 opacity-50 hover:opacity-100 flex-shrink-0"
                                title="Remove"
                              >
                                ×
                              </button>
                            </div>

                            <span className="text-cyan-300 text-xs mt-1">
                              Shop: {item.shop_name}
                            </span>

                            {/* Price */}
                            {item.discounted_price && (
                              <div className="mt-1">
                                <span className="text-green-400 font-medium text-sm">
                                  ${Number(item.discounted_price).toFixed(2)}
                                  {item.actual_price &&
                                    item.actual_price !==
                                      item.discounted_price && (
                                      <span className="line-through text-red-400 text-xs ml-1.5">
                                        ${Number(item.actual_price).toFixed(2)}
                                      </span>
                                    )}
                                </span>
                              </div>
                            )}

                            {/* View button */}
                            <div className="mt-auto pt-1">
                              <a
                                href={item.external_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-xs px-2 py-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white rounded transition-all"
                              >
                                View Product
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer - Only show if there are items */}
                  {savedItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-center">
                      <Link
                        to="/dashboard"
                        onClick={() => {
                          setCartOpen(false);
                          handleLinkClick();
                        }}
                        className="text-sm px-3 py-1.5 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded transition-colors"
                      >
                        View All Liked Products
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <ProfileIcon user={user} setUser={setUser} />
      </div>
    </header>
  );
};

export default Header;
