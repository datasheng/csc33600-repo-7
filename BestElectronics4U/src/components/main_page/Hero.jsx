import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import background from "../../assets/background.jpg";

const Hero = ({ user: propUser }) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  // 🧠 Fallback to localStorage if prop not passed
  const user =
    propUser ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("user"));
      } catch {
        return null;
      }
    })();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleShopNow = () => {
    navigate("/shop");
    window.scrollTo(0, 0);
  };

  return (
    <section
      className="h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center text-white px-6 overflow-hidden relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${background})`,
        backgroundAttachment: "fixed",
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-xl"></div>
        <div className="absolute top-1/4 -right-16 w-80 h-80 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-full blur-xl"></div>
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-xl"></div>
      </div>

      {/* Hero Text Content */}
      <div className="max-w-4xl z-10 text-center">
        <div
          className={`transform transition-all duration-1000 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-white">
            Welcome to BestElectronics4U
          </h1>
        </div>

        <div
          className={`transform transition-all duration-1000 delay-300 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <p className="text-lg sm:text-xl md:text-2xl mb-2 md:mb-3 text-white/90">
            Your one-stop shop for the best electronics.
          </p>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-10 text-white/90">
            We offer a wide range of real products that can be found in real
            stores.
          </p>
        </div>

        {/* Shop Button */}
        <div
          className={`transform transition-all duration-1000 delay-500 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <button
            onClick={handleShopNow}
            className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-white overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
          >
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-80 group-hover:h-80 opacity-10"></span>
            <span className="relative flex items-center">
              Shop Now
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 ml-2 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-10 h-10 text-white/70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
