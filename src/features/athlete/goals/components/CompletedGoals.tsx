import {
  CheckCircle2,
  Trophy,
  Medal,
  Star,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import type { Goal } from "@/services/firebase/goals";

interface CompletedGoalsProps {
  goals: Goal[];
  loading: boolean;
}

function getGoalIcon(type: string) {
  switch (type) {
    case "Performance":
      return <Medal size={20} />;

    case "Strength":
      return <Trophy size={20} />;

    case "Speed":
      return <Star size={20} />;

    case "Training":
      return <CheckCircle2 size={20} />;

    default:
      return <Trophy size={20} />;
  }
}

export default function CompletedGoals({
  goals,
  loading,
}: CompletedGoalsProps) {
  const completedGoals = goals.filter(
    (goal) => goal.status === "Completed"
  );

  return (
    <section>
      <SectionHeading
        title="Completed Goals"
        subtitle="Your recently achieved milestones"
      />

      {loading ? (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-zinc-500">
            Loading completed goals...
          </p>
        </div>
      ) : completedGoals.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-10 text-center">
          <CheckCircle2
            size={32}
            className="mx-auto text-zinc-600"
          />

          <h3 className="mt-4 font-semibold text-white">
            No completed goals yet
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            Keep working on your active goals. Completed
            goals will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {completedGoals.map((goal) => (
            <DashboardCard
              key={goal.id}
              className="group"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400 transition group-hover:scale-105">
                  {getGoalIcon(goal.type)}
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-white">
                    {goal.name}
                  </h3>

                  <p className="mt-1 text-sm text-emerald-400">
                    {goal.current} / {goal.target}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {goal.completedAt
                      ? `Completed ${new Date(
                          goal.completedAt as string
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}`
                      : "Completed"}
                  </p>
                </div>
              </div>

              {/* Completed Progress */}
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">
                    Progress
                  </span>

                  <span className="font-semibold text-emerald-400">
                    100%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full w-full rounded-full bg-emerald-500" />
                </div>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}
    </section>
  );
}