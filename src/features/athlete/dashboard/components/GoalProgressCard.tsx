import { useEffect, useState } from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";

interface Goal {
  title: string;
  current: number;
  target: number;
  unit: string;
  progress: number;
}

export default function GoalProgressCard() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGoals = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const sessions = await getTrainingSessions(user.uid);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Start of current week (Monday)
        const startOfWeek = new Date(today);

        const day = startOfWeek.getDay();

        const difference =
          day === 0 ? 6 : day - 1;

        startOfWeek.setDate(
          startOfWeek.getDate() - difference
        );

        startOfWeek.setHours(0, 0, 0, 0);

        // End of current week (Sunday)
        const endOfWeek = new Date(startOfWeek);

        endOfWeek.setDate(
          endOfWeek.getDate() + 6
        );

        endOfWeek.setHours(23, 59, 59, 999);

        // Sessions scheduled this week
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

        // Completed sessions
        const completedSessions =
          weeklySessions.filter(
            (session) =>
              session.status === "Completed"
          );

        // Calculate total training minutes
        const weeklyMinutes =
          weeklySessions.reduce(
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

        const weeklyHours =
          weeklyMinutes / 60;

        // Goals
        const workoutTarget = 5;
        const sessionTarget = 6;
        const hoursTarget = 10;

        const workoutProgress = Math.min(
          Math.round(
            (completedSessions.length /
              workoutTarget) *
              100
          ),
          100
        );

        const sessionProgress = Math.min(
          Math.round(
            (weeklySessions.length /
              sessionTarget) *
              100
          ),
          100
        );

        const hoursProgress = Math.min(
          Math.round(
            (weeklyHours /
              hoursTarget) *
              100
          ),
          100
        );

        setGoals([
          {
            title: "Complete 5 Workouts",
            current: completedSessions.length,
            target: workoutTarget,
            unit: "workouts",
            progress: workoutProgress,
          },
          {
            title: "Weekly Training Sessions",
            current: weeklySessions.length,
            target: sessionTarget,
            unit: "sessions",
            progress: sessionProgress,
          },
          {
            title: "Training Hours",
            current: Number(
              weeklyHours.toFixed(1)
            ),
            target: hoursTarget,
            unit: "hours",
            progress: hoursProgress,
          },
        ]);
      } catch (error) {
        console.error(
          "Failed to load goal progress:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  return (
    <DashboardCard className="group" hover>
      <SectionHeading
        title="Goal Progress"
        subtitle="Track your current objectives"
      />

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-zinc-500">
            Loading goals...
          </p>
        </div>
      ) : goals.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-zinc-500">
            No training data available.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {goals.map((goal) => (
            <div key={goal.title}>
              <div className="mb-2 flex justify-between gap-4">
                <div>
                  <span className="text-sm text-zinc-300">
                    {goal.title}
                  </span>

                  <p className="mt-1 text-xs text-zinc-500">
                    {goal.current} / {goal.target}{" "}
                    {goal.unit}
                  </p>
                </div>

                <span className="text-sm font-semibold text-white">
                  {goal.progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                  style={{
                    width: `${goal.progress}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}