import { ArrowRight, Target } from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";

import type { Goal } from "@/services/firebase/goals";

interface GoalsHeroProps {
  goals: Goal[];
}

export default function GoalsHero({
  goals,
}: GoalsHeroProps) {
  const activeGoals = goals.filter(
    (goal) => goal.status === "Active"
  );

  const completedGoals = goals.filter(
    (goal) => goal.status === "Completed"
  );

  const averageProgress =
    goals.length > 0
      ? Math.round(
        goals.reduce(
          (total, goal) =>
            total + goal.progress,
          0
        ) / goals.length
      )
    : 0;

  return (
    <DashboardCard className="relative overflow-hidden border-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 text-white">
      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        {/* Left */}
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
            <Target size={16} />
            Athlete Goals
          </div>

          <p className="text-lg text-blue-100">
            Stay focused. Keep improving.
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Turn Your Goals Into Results.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">
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
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-blue-700 transition duration-300 hover:scale-105"
          >
            Create New Goal
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Right */}
        <div className="grid grid-cols-2 gap-4 lg:w-[340px]">

          {/* Active Goals */}
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-blue-100">
              Active Goals
            </p>

            <p className="mt-2 text-3xl font-bold">
              {activeGoals.length}
            </p>
          </div>

          {/* Completed Goals */}
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-blue-100">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold">
              {completedGoals.length}
            </p>
          </div>

          {/* Average Progress */}
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-blue-100">
              Avg. Progress
            </p>

            <p className="mt-2 text-3xl font-bold">
              {averageProgress}%
            </p>
          </div>

          {/* Goal Progress */}
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-blue-100">
              Total Goals
            </p>

            <p className="mt-2 text-3xl font-bold">
              {goals.length}
            </p>
          </div>

        </div>
      </div>
    </DashboardCard>
  );
}