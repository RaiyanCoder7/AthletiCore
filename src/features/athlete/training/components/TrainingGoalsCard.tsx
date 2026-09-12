import { useEffect, useState } from "react";
import { CheckCircle2, Target, Trophy, Zap } from "lucide-react";

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
  icon: React.ReactNode;
  color: string;
  iconBg: string;
  iconText: string;
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
        const sessions = await getTrainingSessions(user.uid);
        const today = new Date();

        /* Current Week Calculation */
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        const difference = day === 0 ? 6 : day - 1;

        startOfWeek.setDate(startOfWeek.getDate() - difference);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const weeklySessions = sessions.filter((session) => {
          const sessionDate = new Date(`${session.date}T00:00:00`);
          return (
            sessionDate >= startOfWeek &&
            sessionDate <= endOfWeek &&
            session.status !== "Rest"
          );
        });

        const completedSessions = weeklySessions.filter(
          (session) => session.status === "Completed"
        );

        const completedMinutes = completedSessions.reduce((total, session) => {
          const match = session.duration.match(/\d+/);
          if (!match) return total;
          return total + Number(match[0]);
        }, 0);

        const completedHours = completedMinutes / 60;

        setGoals([
          {
            title: "Scheduled Workouts",
            current: weeklySessions.length,
            target: 6,
            unit: "sessions",
            icon: <Target size={18} />,
            color: "bg-primary",
            iconBg: "bg-primary/10 border-primary/20",
            iconText: "text-primary",
          },
          {
            title: "Training Volume",
            current: Number(completedHours.toFixed(1)),
            target: 10,
            unit: "hours",
            icon: <Zap size={18} />,
            color: "bg-indigo-500",
            iconBg: "bg-indigo-500/10 border-indigo-500/20",
            iconText: "text-indigo-600 dark:text-indigo-400",
          },
          {
            title: "Sessions Completed",
            current: completedSessions.length,
            target: 5,
            unit: "sessions",
            icon: <Trophy size={18} />,
            color: "bg-amber-500",
            iconBg: "bg-amber-500/10 border-amber-500/20",
            iconText: "text-amber-600 dark:text-amber-400",
          },
        ]);
      } catch (error) {
        console.error("Failed to load training goals:", error);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  return (
    <DashboardCard accent="orange" hover={false}>
      <SectionHeading
        title="Training Goals"
        subtitle="Weekly milestone & volume objectives"
      />

      {loading ? (
        <div className="mt-6 flex h-36 items-center justify-center">
          <p className="text-xs text-muted-foreground animate-pulse">
            Calculating weekly targets...
          </p>
        </div>
      ) : goals.length === 0 ? (
        <div className="mt-6 flex h-36 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            No training objectives active for this week.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {goals.map((goal) => {
            const progress =
              goal.target > 0
                ? Math.min(Math.round((goal.current / goal.target) * 100), 100)
                : 0;
            const isFinished = progress >= 100;

            return (
              <div
                key={goal.title}
                className="flex flex-col justify-between rounded-xl border border-border/70 bg-muted/30 p-4 transition-colors hover:border-border hover:bg-muted/50"
              >
                {/* Header: Icon + Metric details */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border ${goal.iconBg} ${goal.iconText}`}
                    >
                      {goal.icon}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                        isFinished
                          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border border-border/60 bg-card text-foreground shadow-2xs"
                      }`}
                    >
                      {isFinished && <CheckCircle2 size={11} />}
                      {progress}%
                    </span>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-semibold tracking-tight text-foreground">
                      {goal.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {goal.current} / {goal.target} {goal.unit}
                    </p>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="mt-4">
                  <StatBar
                    percent={progress}
                    className={
                      isFinished
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : goal.color
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}