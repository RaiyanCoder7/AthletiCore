import { ArrowRight, Target } from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";

import type { Goal } from "@/services/firebase/goals";

interface GoalsHeroProps {
  goals: Goal[];
}

export default function GoalsHero({
  goals,
}: GoalsHeroProps) {
  return (
    <DashboardCard className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white lg:p-10">

      {/* Diagonal texture — consistent with the other hero banners */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="goals-hero-diagonal"
            width="24"
            height="24"
            patternTransform="rotate(35)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="24" stroke="white" strokeWidth="8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#goals-hero-diagonal)" />
      </svg>

      {/* Background Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />

      <div className="relative max-w-2xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-blue-100 backdrop-blur">
          <Target size={13} />
          Athlete Goals
        </div>

        <p className="text-sm text-blue-100">
          Stay focused. Keep improving.
        </p>

        <h1 className="mt-2 text-3xl font-bold leading-tight lg:text-5xl">
          Turn Your Goals Into Results.
        </h1>

        <p className="mt-4 max-w-lg text-sm leading-6 text-blue-100 lg:text-base">
          Set meaningful targets, track your progress and
          stay consistent throughout your athletic journey.
        </p>

        <button
          onClick={() => {
            document
              .getElementById("create-goal")
              ?.scrollIntoView({
                behavior: "smooth",
              });
          }}
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
        >
          Create New Goal
          <ArrowRight size={18} />
        </button>
      </div>
    </DashboardCard>
  );
}