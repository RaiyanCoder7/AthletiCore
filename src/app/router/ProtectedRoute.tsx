import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "@/services/firebase/firebase";
import { getUserRole } from "@/services/firebase/users";
import type { UserRole } from "@/services/firebase/users";

export default function ProtectedRoute({
  allowedRoles,
}: {
  allowedRoles?: UserRole[];
}) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);

      if (!user) {
        setIsAuthenticated(false);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const userRole = await getUserRole(user.uid);

        if (!userRole) {
          // Never silently treat a missing/invalid profile as an athlete.
          setIsAuthenticated(true);
          setRole(null);
          return;
        }

        setIsAuthenticated(true);
        setRole(userRole);
      } catch (err) {
        console.error("Failed checking role in route:", err);
        setIsAuthenticated(true);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#070B0E] text-neutral-400">
        <p className="animate-pulse font-mono text-xs uppercase tracking-widest text-[#22C55E]">
          Validating Security Clearance...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated account without a valid application role/profile.
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const dashboard =
      role === "coach"
        ? "/coach"
        : role === "manager"
        ? "/manager"
        : "/athlete";

    return <Navigate to={dashboard} replace />;
  }

  return <Outlet />;
}
