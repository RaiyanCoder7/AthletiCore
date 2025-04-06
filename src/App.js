import React, { Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./services/firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./ErrorBoundary";


// Lazy load pages and components
const HomePage = React.lazy(() => import("./pages/HomePage"));
const Login = React.lazy(() => import("./components/Login"));
const SignUp = React.lazy(() => import("./components/SignUp"));
const AthleteDashboard = React.lazy(() => import("./components/AthleteDashboard"));
const CoachDashboard = React.lazy(() => import("./components/CoachDashboard"));
const Profile = React.lazy(() => import("./components/Profile"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          setUserRole(userSnap.exists() ? userSnap.data().role : "user");
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole("user"); // Default role
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ AuthCheck Component to protect routes
  const AuthCheck = ({ children, allowedRoles }) => {
    if (loading) return <div className="text-center p-4">Loading...</div>; // Show loading state
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ErrorBoundary>
          <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
            <Routes>
              {/* ✅ Home Page */}
              <Route path="/" element={<HomePage />} />

              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Protected Routes */}
              <Route 
                path="/AthleteDashboard" 
                element={
                  <AuthCheck allowedRoles={["athlete"]}>
                    <AthleteDashboard />
                  </AuthCheck>
                } 
              />

              <Route 
                path="/CoachDashboard" 
                element={
                  <AuthCheck allowedRoles={["coach"]}>
                    <CoachDashboard />
                  </AuthCheck>
                } 
              />

              {/* ✅ New Profile Route */}
              <Route 
                path="/profile" 
                element={
                  <AuthCheck allowedRoles={["coach", "athlete"]}>
                    <Profile />
                    </AuthCheck>
                } 
              />

              {/* Catch-all 404 Route */}
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