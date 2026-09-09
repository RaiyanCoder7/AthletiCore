import { useEffect, useState } from "react";
import { Clock, Dumbbell } from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";
import type { TrainingSession } from "@/services/firebase/training";

export default function TodayTrainingCard() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodayTraining = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getTrainingSessions(user.uid);

        const today = new Date();

        const todayString = [
          today.getFullYear(),
          String(today.getMonth() + 1).padStart(2, "0"),
          String(today.getDate()).padStart(2, "0"),
        ].join("-");

        const todaySessions = data.filter(
          (session) =>
            session.date === todayString &&
            session.status !== "Rest"
        );

        setSessions(todaySessions);
      } catch (error) {
        console.error(
          "Failed to load today's training:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadTodayTraining();
  }, []);

  return (
    <DashboardCard className="group" hover accent="orange">
      <SectionHeading
        title="Today's Training"
        subtitle="Your scheduled workouts for today"
        action={
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Dumbbell size={22} />
          </div>
        }
      />

      <div className="mt-6 space-y-4">
        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-muted p-5 text-center">
            <p className="text-sm text-muted-foreground">
              Loading today's training...
            </p>
          </div>
        )}

        {/* No Training */}
        {!loading && sessions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Dumbbell
                size={22}
                className="text-primary"
              />
            </div>

            <p className="mt-3 font-medium text-foreground">
              No training scheduled today
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Enjoy your recovery, or add a session to get started.
            </p>
          </div>
        )}

        {/* Today's Sessions */}
        {!loading &&
          sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl bg-muted p-4 transition hover:bg-accent"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">
                    {session.workout}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {session.type}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    session.status === "Completed"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {session.status}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} />
                {session.time} • {session.duration}
              </div>
            </div>
          ))}
      </div>
    </DashboardCard>
  );
}