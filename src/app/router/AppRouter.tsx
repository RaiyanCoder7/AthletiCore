import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";

import DashboardLayout from "@/app/layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

// Public Marketing & Auth Pages
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";

// Athlete features
import DashboardPage from "@/features/athlete/dashboard/DashboardPage";
import ProfilePage from "@/features/athlete/profile/ProfilePage";
import AnalyticsPage from "@/features/athlete/analytics/AnalyticsPage";
import TrainingPage from "@/features/athlete/training/TrainingPage";
import GoalsPage from "@/features/athlete/goals/GoalsPage";
import CalendarPage from "@/features/athlete/calendar/CalendarPage";
import SettingsPage from "@/features/athlete/settings/SettingsPage";

// Coach features
import CoachDashboard from "@/features/coach/dashboard/CoachDashboardPage";
import Button from "@/components/ui/Button";
import CoachAthletesPage from "@/features/coach/athletes/CoachAthletesPage";
import AthleteDetailPage from "@/features/coach/athletes/AthleteDetailPage";
import CoachTeamsPage from "@/features/coach/teams/CoachTeamsPage";
import CoachTrainingPage from "@/features/coach/training/CoachTrainingPage";
import CoachPerformancePage from "@/features/coach/performance/CoachPerformancePage";

/**
 * Temporary workspace placeholder to prevent session drops or landing page redirects
 */
function CoachWorkspacePlaceholder({ title }: { title: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-[#22C55E] shadow-lg">
        <Construction size={28} />
      </div>
      <h2 className="mt-4 text-xl font-bold text-white">{title}</h2>
      <p className="mt-1 max-w-sm text-xs text-neutral-400">
        This workspace route (<code className="font-mono text-[#22C55E]">{location.pathname}</code>) is currently under active buildout.
      </p>
      <div className="mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/coach")}
          className="gap-2"
        >
          <ArrowLeft size={14} />
          <span>Return to Coach Command</span>
        </Button>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Marketing & Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Dashboard Shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            {/* 1. Athlete Routes */}
            <Route element={<ProtectedRoute allowedRoles={["athlete"]} />}>
              <Route path="/athlete" element={<DashboardPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/training" element={<TrainingPage />} />
              <Route path="/goals" element={<GoalsPage />} />
            </Route>

            {/* 2. Coach Routes (All wired so clicks never trigger catch-all redirects) */}
            <Route element={<ProtectedRoute allowedRoles={["coach"]} />}>
              <Route path="/coach" element={<CoachDashboard />} />
              <Route
                path="/coach/athletes" element={<CoachAthletesPage />}
              />
              <Route
                path="/coach/athletes/:athleteId" element={<AthleteDetailPage />}
              />
              <Route
                path="/coach/teams" element={<CoachTeamsPage />}
              />
              <Route
                path="/coach/training" element={<CoachTrainingPage />}
              />
              <Route
                path="/coach/performance" element={<CoachPerformancePage />}
              />
            </Route>

            {/* 3. Shared Cross-Role Routes */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* In-app fallback: Keeps you on /coach instead of kicking you to the landing page */}
            <Route
              path="/coach/*"
              element={<Navigate to="/coach" replace />}
            />
            <Route
              path="/athlete/*"
              element={<Navigate to="/athlete" replace />}
            />

          </Route>
        </Route>

        {/* Global Fallback (only for unauthenticated or external URLs) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}