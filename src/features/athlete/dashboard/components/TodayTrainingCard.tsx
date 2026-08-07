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
    <DashboardCard className="group" hover>
      <SectionHeading
        title="Today's Training"
        subtitle="Your scheduled workouts for today"
        action={
          <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
            <Dumbbell size={22} />
          </div>
        }
      />

      <div className="mt-6 space-y-4">
        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-zinc-800 p-5 text-center">
            <p className="text-sm text-zinc-500">
              Loading today's training...
            </p>
          </div>
        )}

        {/* No Training */}
        {!loading && sessions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-800/50 p-6 text-center">
            <Dumbbell
              size={28}
              className="mx-auto text-zinc-600"
            />

            <p className="mt-3 font-medium text-white">
              No training scheduled today
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Enjoy your recovery or add a training session.
            </p>
          </div>
        )}

        {/* Today's Sessions */}
        {!loading &&
          sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl bg-zinc-800 p-4 transition hover:bg-zinc-750"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-white">
                    {session.workout}
                  </p>

                  <p className="mt-1 text-sm text-zinc-500">
                    {session.type}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    session.status === "Completed"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {session.status}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
                <Clock size={16} />
                {session.time} • {session.duration}
              </div>
            </div>
          ))}
      </div>
    </DashboardCard>
  );
}