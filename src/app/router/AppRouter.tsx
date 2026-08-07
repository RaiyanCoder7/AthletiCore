import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "@/app/layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";

import DashboardPage from "@/features/athlete/dashboard/DashboardPage";
import ProfilePage from "@/features/athlete/profile/ProfilePage";
import AnalyticsPage from "@/features/athlete/analytics/AnalyticsPage";
import TrainingPage from "@/features/athlete/training/TrainingPage";
import GoalsPage from "@/features/athlete/goals/GoalsPage";
import CalendarPage from "@/features/athlete/calendar/CalendarPage";
import SettingsPage from "@/features/athlete/settings/SettingsPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}