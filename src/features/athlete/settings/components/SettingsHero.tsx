import {
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";

export default function SettingsHero() {
  return (
    <DashboardCard className="relative overflow-hidden border-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 text-white">
      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        {/* Left */}
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
            <Settings size={16} />
            Account Settings
          </div>

          <p className="text-lg text-blue-100">
            Manage your Athleticore experience.
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Personalize Your Experience.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">
            Update your profile, training preferences, notifications
            and account settings from one place.
          </p>
        </div>

        {/* Right */}
        <div className="grid grid-cols-2 gap-4 lg:w-[340px]">
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <UserRound size={20} className="text-blue-200" />

            <p className="mt-4 text-sm text-blue-100">
              Profile
            </p>

            <p className="mt-1 text-lg font-semibold">
              Personal Info
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <ShieldCheck size={20} className="text-emerald-200" />

            <p className="mt-4 text-sm text-blue-100">
              Security
            </p>

            <p className="mt-1 text-lg font-semibold">
              Protected
            </p>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}