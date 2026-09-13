import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/services/firebase/firebase";
import {
  getUserProfile,
  type UserProfile,
  type UserRole,
} from "@/services/firebase/users";
import { getRoleDashboardPath } from "@/services/firebase/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const [user, setUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userProfile = await getUserProfile(currentUser.uid);
          setProfile(userProfile);
        } catch (error) {
          console.error("Failed to load user profile in ProtectedRoute:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070B0E]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[#22C55E]" />
          <p className="mt-4 font-mono text-xs text-neutral-400">
            AUTHENTICATING COMBINE SESSION...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in via Firebase Auth, but missing Firestore profile record
  if (!profile) {
    return <Navigate to="/register" replace />;
  }

  // Logged in, but trying to access an unauthorized route
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to={getRoleDashboardPath(profile.role)} replace />;
  }

  return <Outlet />;
}