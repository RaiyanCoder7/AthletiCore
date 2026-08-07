import { useEffect, useState } from "react";
import {
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";

interface Goal {
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

export default function TrainingGoalsCard() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGoals = async () => {
      const user = auth.currentUser;

      if (!user) {
        setGoals([]);
        setLoading(false);
        return;
      }

      try {
        const sessions = await getTrainingSessions(
          user.uid
        );

        const today = new Date();

        /* -----------------------------
           Current Week
        ----------------------------- */

        const startOfWeek = new Date(today);

        const day = startOfWeek.getDay();

        const difference =
          day === 0 ? 6 : day - 1;

        startOfWeek.setDate(
          startOfWeek.getDate() - difference
        );

        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);

        endOfWeek.setDate(
          endOfWeek.getDate() + 6
        );

        endOfWeek.setHours(
          23,
          59,
          59,
          999
        );

        /* -----------------------------
           Weekly Sessions
        ----------------------------- */

        const weeklySessions = sessions.filter(
          (session) => {
            const sessionDate = new Date(
              `${session.date}T00:00:00`
            );

            return (
              sessionDate >= startOfWeek &&
              sessionDate <= endOfWeek &&
              session.status !== "Rest"
            );
          }
        );

        /* -----------------------------
           Completed Sessions
        ----------------------------- */

        const completedSessions =
          weeklySessions.filter(
            (session) =>
              session.status === "Completed"
          );

        /* -----------------------------
           Completed Training Hours
        ----------------------------- */

        const completedMinutes =
          completedSessions.reduce(
            (total, session) => {
              const match =
                session.duration.match(/\d+/);

              if (!match) {
                return total;
              }

              return (
                total + Number(match[0])
              );
            },
            0
          );

        const completedHours =
          completedMinutes / 60;

        /* -----------------------------
           Set Goals
        ----------------------------- */

        setGoals([
          {
            title: "Weekly Workouts",
            current: weeklySessions.length,
            target: 6,
            unit: "sessions",
            icon: <Target size={20} />,
            color: "bg-blue-500",
          },
          {
            title: "Training Hours",
            current: Number(
              completedHours.toFixed(1)
            ),
            target: 10,
            unit: "hours",
            icon: <Zap size={20} />,
            color: "bg-violet-500",
          },
          {
            title: "Completed Workouts",
            current:
              completedSessions.length,
            target: 5,
            unit: "sessions",
            icon: <Trophy size={20} />,
            color: "bg-amber-500",
          },
        ]);
      } catch (error) {
        console.error(
          "Failed to load training goals:",
          error
        );

        setGoals([]);
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  return (
    <DashboardCard>
      <SectionHeading
        title="Training Goals"
        subtitle="Track your current training targets"
      />

      {loading ? (
        <div className="mt-8 flex h-32 items-center justify-center">
          <p className="text-zinc-500">
            Loading training goals...
          </p>
        </div>
      ) : goals.length === 0 ? (
        <div className="mt-8 flex h-32 items-center justify-center">
          <p className="text-zinc-500">
            No training data available.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {goals.map((goal) => {
            const progress =
              goal.target > 0
                ? Math.min(
                    Math.round(
                      (goal.current /
                        goal.target) *
                        100
                    ),
                    100
                  )
                : 0;

            return (
              <div
                key={goal.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-800/40 p-5"
              >
                {/* Icon + Title */}

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-zinc-700 p-3 text-white">
                    {goal.icon}
                  </div>

                  <div>
                    <h4 className="font-semibold text-white">
                      {goal.title}
                    </h4>

                    <p className="text-xs text-zinc-500">
                      {goal.current} /{" "}
                      {goal.target}{" "}
                      {goal.unit}
                    </p>
                  </div>
                </div>

                {/* Progress */}

                <div className="mt-6">
                  <div className="mb-2 flex justify-between">
                    <span className="text-xs text-zinc-500">
                      Progress
                    </span>

                    <span className="text-xs font-semibold text-zinc-300">
                      {progress}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-zinc-700">
                    <div
                      className={`h-full rounded-full ${goal.color} transition-all duration-500`}
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}