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

  // Effect to load user from localStorage or verify token
  useEffect(() => {
    const initializeUser = async () => {
      const storedUserString = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (token) { // Prioritize token for verification
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/auth/verify-token`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.data && response.data.user) {
            const backendUser = response.data.user;
            // Ensure the backendUser has the primary user_id
            if (backendUser.user_id) {
              localStorage.setItem("user", JSON.stringify(backendUser));
              localStorage.setItem("token", token); // Refresh/confirm token if needed, or rely on existing
              setUser(backendUser);
            } else {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              setUser(null);
            }
          } else {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setUser(null);
          }
        } catch (error) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
        }
      } else if (storedUserString) {
        try {
          const parsedUser = JSON.parse(storedUserString);
          // Basic validation: check if it has a user_id that looks like the new format or an old one for graceful degradation
          if (parsedUser && parsedUser.user_id) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem("user");
            setUser(null);
          }
        } catch (e) {
          localStorage.removeItem("user");
          setUser(null);
        }
      }
    };
    initializeUser();
  }, []);

  useEffect(() => {
    // Load saved items when user is loaded
    const userId = user?.user_id || user?.id;
    if (userId) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/saved-items/${userId}`)
        .then((res) => {
          setSavedItems(res.data || []);
        })
        .catch((err) => {
        });
    }
  }, [user]);

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
