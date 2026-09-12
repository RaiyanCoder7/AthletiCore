import { useEffect, useState } from "react";
import { CheckCircle2, Target } from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";
import StatBar from "@/components/ui/StatBar";

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
        const difference = day === 0 ? 6 : day - 1;

        startOfWeek.setDate(startOfWeek.getDate() - difference);
        startOfWeek.setHours(0, 0, 0, 0);

        // End of current week (Sunday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Sessions scheduled this week
        const weeklySessions = sessions.filter((session) => {
          const sessionDate = new Date(`${session.date}T00:00:00`);
          return (
            sessionDate >= startOfWeek &&
            sessionDate <= endOfWeek &&
            session.status !== "Rest"
          );
        });

        // Completed sessions
        const completedSessions = weeklySessions.filter(
          (session) => session.status === "Completed"
        );

        // Calculate total training minutes
        const weeklyMinutes = weeklySessions.reduce((total, session) => {
          const match = session.duration.match(/\d+/);
          if (!match) return total;
          return total + Number(match[0]);
        }, 0);

        const weeklyHours = weeklyMinutes / 60;

        // Targets
        const workoutTarget = 5;
        const sessionTarget = 6;
        const hoursTarget = 10;

        const workoutProgress = Math.min(
          Math.round((completedSessions.length / workoutTarget) * 100),
          100
        );

        const sessionProgress = Math.min(
          Math.round((weeklySessions.length / sessionTarget) * 100),
          100
        );

        const hoursProgress = Math.min(
          Math.round((weeklyHours / hoursTarget) * 100),
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
            current: Number(weeklyHours.toFixed(1)),
            target: hoursTarget,
            unit: "hours",
            progress: hoursProgress,
          },
        ]);
      } catch (error) {
        console.error("Failed to load goal progress:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  const completedGoalsCount = goals.filter((g) => g.progress >= 100).length;

  return (
    <DashboardCard accent="emerald" hover={false}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          title="Goal Progress"
          subtitle="Track your weekly athletic targets"
        />

        {!loading && goals.length > 0 && (
          <div className="mb-4 inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 sm:mb-0 sm:self-auto">
            <Target size={12} />
            <span>
              {completedGoalsCount} of {goals.length} achieved
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex h-52 items-center justify-center">
          <p className="text-xs text-muted-foreground animate-pulse">
            Calculating goal milestones...
          </p>
        </div>
      ) : goals.length === 0 ? (
        <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            No active goal milestones for this week.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-5">
          {goals.map((goal) => {
            const isCompleted = goal.progress >= 100;

            return (
              <div
                key={goal.title}
                className="rounded-xl border border-border/60 bg-muted/30 p-3.5 transition-colors hover:border-border/80 hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      {isCompleted && (
                        <CheckCircle2
                          size={14}
                          className="shrink-0 text-emerald-600 dark:text-emerald-400"
                        />
                      )}
                      <p className="text-sm font-semibold tracking-tight text-foreground">
                        {goal.title}
                      </p>
                    </div>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {goal.current} / {goal.target} {goal.unit}
                    </p>
                  </div>

                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                      isCompleted
                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border border-border/70 bg-card text-foreground"
                    }`}
                  >
                    {goal.progress}%
                  </span>
                </div>

                <StatBar
                  percent={goal.progress}
                  className={
                    isCompleted
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-xs"
                      : "bg-gradient-to-r from-emerald-500/80 to-emerald-400/80"
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}