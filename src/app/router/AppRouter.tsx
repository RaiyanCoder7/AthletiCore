import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
import CoachAthletesPage from "@/features/coach/athletes/CoachAthletesPage";
import AthleteDetailPage from "@/features/coach/athletes/AthleteDetailPage";
import CoachTeamsPage from "@/features/coach/teams/CoachTeamsPage";
import CoachTrainingPage from "@/features/coach/training/CoachTrainingPage";
import CoachPerformancePage from "@/features/coach/performance/CoachPerformancePage";
import TeamHubPage from "@/features/Teams/TeamHubPage";
import ManagerDashboardPage from "@/features/manager/ManagerDashboardPage";

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

            {/* 2. Coach Routes */}
            <Route element={<ProtectedRoute allowedRoles={["coach"]} />}>
              <Route path="/coach" element={<CoachDashboard />} />
              <Route
                path="/coach/athletes"
                element={<CoachAthletesPage />}
              />
              <Route
                path="/coach/athletes/:athleteId"
                element={<AthleteDetailPage />}
              />
              <Route
                path="/coach/teams"
                element={<CoachTeamsPage />}
              />
              <Route
                path="/coach/training"
                element={<CoachTrainingPage />}
              />
              <Route
                path="/coach/performance"
                element={<CoachPerformancePage />}
              />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["coach"]} />}>
              <Route path="/coach/teams/:teamId" element={<TeamHubPage />} />
            </Route>

            {/* 3. Manager Routes */}
            <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
              <Route path="/manager" element={<ManagerDashboardPage />} />
            </Route>

            {/* 4. Shared Cross-Role Routes */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* In-app fallback */}
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

        {/* Global Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}