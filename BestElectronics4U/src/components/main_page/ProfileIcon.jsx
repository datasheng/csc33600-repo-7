import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const ProfileIcon = ({ user, setUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition duration-200"
        aria-label="Profile"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-gradient-to-br from-indigo-900/95 via-blue-900/95 to-cyan-900/95 text-white rounded-xl shadow-xl z-50 backdrop-blur-md border border-white/20">
          {user ? (
            <>
              <div className="sticky top-0 bg-gradient-to-r from-indigo-800 via-cyan-700 to-blue-700 px-4 py-3 rounded-t-xl flex items-center gap-2 border-b border-white/10">
                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-8 h-8 flex items-center justify-center">
                  👤
                </span>
                <p className="font-semibold">
                  Welcome,{" "}
                  {user.first_name ||
                    (user.user_name ? user.user_name.split(" ")[0] : "User")}
                  !
                </p>
              </div>

              <div className="p-3">
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center mb-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white rounded-md transition-colors"
                >
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="block w-full text-center px-4 py-2 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="sticky top-0 bg-gradient-to-r from-indigo-800 via-cyan-700 to-blue-700 px-4 py-3 rounded-t-xl flex items-center gap-2 border-b border-white/10">
                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-8 h-8 flex items-center justify-center">
                  👤
                </span>
                <p className="font-semibold">Account</p>
              </div>

              <div className="p-3">
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white rounded-md transition-colors"
                >
                  Login / Register
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileIcon;
