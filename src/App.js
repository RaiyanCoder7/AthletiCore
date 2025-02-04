import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom"; // No BrowserRouter here!
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./ErrorBoundary"; 

// Import pages and components
import HomePage from "./pages/HomePage";
import Dashboard from "./components/Dashboard";
import InjuryTracker from "./components/InjuryTracker";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ErrorBoundary>
          <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/injury-tracker" element={<InjuryTracker />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}

export default App;