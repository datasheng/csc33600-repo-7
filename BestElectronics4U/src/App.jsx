import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import Header from "./components/main_page/Header";
import Hero from "./components/main_page/Hero";
import Comments from "./components/main_page/Comments";
import Footer from "./components/main_page/Footer";
import Auth from "./pages/Auth";
import Shop from "./pages/Shop";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Success from "./pages/Success";
import Chatbot from "./components/Chatbot/Chatbot";

// ScrollToTop component that automatically scrolls to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const Home = () => (
  <>
    <Hero />
    <Comments />
  </>
);

function App() {
  const [user, setUser] = useState(null);
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Load saved items when user is loaded
      if (parsedUser?.user_id) {
        axios
          .get(
            `${import.meta.env.VITE_API_URL}/api/saved-items/${
              parsedUser.user_id
            }`
          )
          .then((res) => {
            setSavedItems(res.data || []);
          })
          .catch((err) => {
            console.error(
              "❌ Failed to fetch saved items on app load:",
              err.message
            );
          });
      }
    }
  }, []);

  return (
    <Router>
      <ScrollToTop /> {/* Add the ScrollToTop component here */}
      <div className="min-h-screen bg-neutral-900 text-white font-sans leading-relaxed flex flex-col">
        {/* ✅ Pass savedItems state to Header */}
        <Header
          user={user}
          setUser={setUser}
          savedItems={savedItems}
          setSavedItems={setSavedItems}
        />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* ✅ Pass savedItems state to Shop */}
            <Route
              path="/shop"
              element={
                <Shop
                  user={user}
                  savedItems={savedItems}
                  setSavedItems={setSavedItems}
                />
              }
            />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/auth" element={<Auth setUser={setUser} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  user={user}
                  savedItems={savedItems}
                  setSavedItems={setSavedItems}
                />
              }
            />
            <Route path="/success" element={<Success />} /> {/* ✅ Add this */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
