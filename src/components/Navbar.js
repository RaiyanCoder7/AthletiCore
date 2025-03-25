import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { FaBars, FaTimes, FaSignOutAlt, FaMoon, FaSun, FaUser } from "react-icons/fa"; // ✅ Added Profile icon

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  // ✅ Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // ✅ Close sidebar when clicking close button
  const closeSidebar = (event) => {
    event.stopPropagation(); // Prevents triggering outside click
    setMenuOpen(false);
  };

  // ✅ Scroll to section smoothly
  const handleScroll = (sectionId) => {
    setMenuOpen(false); // Close sidebar
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // ✅ Sign Out Function
  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // ✅ Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center px-6 py-3 relative">
        {/* ✅ Hamburger Button (Top Left) */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl focus:outline-none mr-4">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* ✅ Branding with Transparent Background */}
        <Link
          to="/"
          className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-wide"
        >
          Hacksters
        </Link>
      </div>

      {/* ✅ Sidebar Menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMenuOpen(false)}
        >
          <div
            ref={sidebarRef}
            className="fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-lg w-60 p-6 flex flex-col transition-transform translate-x-0 z-50"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* ✅ Close Button */}
            <button onClick={closeSidebar} className="self-end text-2xl mb-4">
              <FaTimes />
            </button>

            {/* ✅ Navigation Links */}
            <ul className="flex flex-col space-y-4 text-lg flex-grow">
              {["features", "impact", "contact"].map((section) => (
                <li key={section}>
                  <button
                    className="w-full text-left hover:text-blue-600 transition"
                    onClick={() => handleScroll(section)}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                </li>
              ))}
            </ul>

            {/* ✅ Profile & Sign Out Section */}
            <div className="mt-6 border-t pt-4">
              {/* Profile Button */}
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <FaUser className="text-xl" />
                <span className="text-lg">Profile</span>
              </Link>

              {/* Dark Mode & Sign Out */}
              <div className="flex justify-between items-center mt-4">
                <button onClick={() => setDarkMode(!darkMode)} className="text-2xl">
                  {darkMode ? <FaSun /> : <FaMoon />}
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-2xl text-red-500 hover:text-red-600 transition"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;