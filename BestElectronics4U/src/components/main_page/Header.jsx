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
              className={`px-4 py-2 rounded-md transition duration-200 ${
                location.pathname === "/"
                  ? "bg-white text-blue-700 font-semibold shadow-md"
                  : "hover:bg-white/20 hover:text-white"
              }`}
            >
              Home
            </Link>
          </li>
          <li>
            <button
              onClick={() => {
                if (!user) {
                  alert("You must be logged in to view the shop.");
                } else if (!user.paid_user && !user.is_vendor) {
                  alert("You must be a paid user or vendor to view this page.");
                } else {
                  navigate("/shop");
                  window.scrollTo(0, 0);
                }
              }}
              className={`px-4 py-2 rounded-md transition duration-200 ${
                location.pathname === "/shop"
                  ? "bg-white text-blue-700 font-semibold shadow-md"
                  : "hover:bg-white/20 hover:text-white"
              }`}
            >
              Shop
            </button>
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
                className={`px-4 py-2 rounded-md transition duration-200 ${
                  location.pathname === to
                    ? "bg-white text-blue-700 font-semibold shadow-md"
                    : "hover:bg-white/20 hover:text-white"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
          {user && (
            <li>
              <Link
                to="/dashboard"
                onClick={handleLinkClick}
                className={`px-4 py-2 rounded-md transition duration-200 ${
                  location.pathname === "/dashboard"
                    ? "bg-white text-blue-700 font-semibold shadow-md"
                    : "hover:bg-white/20 hover:text-white"
                }`}
              >
                Dashboard
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
              title="Liked Items"
            >
              ❤️
              {savedItems.length > 0 && (
                <span className="absolute -top-2 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {savedItems.length}
                </span>
              )}
            </button>
            {cartOpen && (
              <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto bg-white text-black rounded-lg shadow-xl z-50 p-4 border border-gray-300">
                <h3 className="text-lg font-semibold mb-2 border-b pb-2">
                  Liked Items
                </h3>
                {savedItems.length === 0 ? (
                  <p className="text-sm text-gray-500">No liked items yet.</p>
                ) : (
                  savedItems.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex gap-3 mb-4 border-b pb-2"
                    >
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-16 h-16 object-contain rounded border"
                      />
                      <div className="flex flex-col text-sm flex-1">
                        <span className="font-medium">{item.product_name}</span>
                        <span className="text-gray-600 text-xs">
                          Shop: {item.shop_name}
                        </span>
                        <a
                          href={item.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-xs mt-1"
                        >
                          View Product
                        </a>
                      </div>
                      <button
                        onClick={() => handleRemove(item.product_id)}
                        className="text-red-500 hover:text-red-700 text-sm ml-1"
                        title="Remove"
                      >
                        ❌
                      </button>
                    </div>
                  ))
                )}
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
