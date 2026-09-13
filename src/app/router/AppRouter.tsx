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
import CoachDashboard from "@/features/coach/dashboard/CoachDashboard";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* =========================================================
            Protected Routes
           ========================================================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            {/* 1. Athlete-Only Features */}
            <Route element={<ProtectedRoute allowedRoles={["athlete"]} />}>
              <Route path="/athlete" element={<DashboardPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/training" element={<TrainingPage />} />
              <Route path="/goals" element={<GoalsPage />} />
            </Route>

            {/* 2. Coach-Only Features */}
            <Route element={<ProtectedRoute allowedRoles={["coach"]} />}>
              <Route path="/coach" element={<CoachDashboard />} />
            </Route>

            {/* 3. Manager-Only Features */}
            <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
              <Route
                path="/manager"
                element={
                  <div className="flex h-96 items-center justify-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      Manager Workspace (Coming Soon)
                    </p>
                  </div>
                }
              />
            </Route>

            {/* 4. Shared Routes (Accessible to Athlete, Coach, & Manager) */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/settings" element={<SettingsPage />} />

          </Route>
        </Route>

        {/* Global Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}