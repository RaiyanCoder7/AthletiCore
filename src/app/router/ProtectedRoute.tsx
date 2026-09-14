import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "@/services/firebase/firebase";
import { getUserProfile } from "@/services/firebase/users";

export default function ProtectedRoute({
  allowedRoles,
}: {
  allowedRoles?: string[];
}) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      try {
        const profile = await getUserProfile(user.uid);
        setRole(profile?.role?.toLowerCase() || "athlete");
      } catch (err) {
        console.error("Failed checking role in route:", err);
        setRole("athlete");
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

  if (allowedRoles && role && !allowedRoles.map(r => r.toLowerCase()).includes(role)) {
    // If coach tries to go to athlete route, send to /coach. If athlete, send to /athlete.
    return <Navigate to={role === "coach" ? "/coach" : "/athlete"} replace />;
  }

  return <Outlet />;
}