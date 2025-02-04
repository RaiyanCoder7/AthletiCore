import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleScroll = (sectionId) => {
    if (location.pathname !== "/") {
      // Navigate to home first, then scroll
      navigate("/");
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } else {
      // Scroll directly if already on home page
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-2xl font-bold text-blue-600">HACKSTERS</Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <button className="text-gray-700 hover:text-blue-600" onClick={() => handleScroll("features")}>
                Features
              </button>
            </li>
            <li>
              <button className="text-gray-700 hover:text-blue-600" onClick={() => handleScroll("impact")}>
                Impact
              </button>
            </li>
            <li>
              <button className="text-gray-700 hover:text-blue-600" onClick={() => handleScroll("contact")}>
                Contact
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;