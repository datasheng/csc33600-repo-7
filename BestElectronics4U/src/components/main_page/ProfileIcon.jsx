import React from 'react';
import { Link } from 'react-router-dom';

const ProfileIcon = () => {
  return (
    <Link
      to="/auth"
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
    </Link>
  );
};

export default ProfileIcon; 