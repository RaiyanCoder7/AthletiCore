import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  Dumbbell,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";

import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";
import type { TrainingSession } from "@/services/firebase/training";

export default function UpcomingScheduleCard() {
  const [schedule, setSchedule] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchedule = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const sessions = await getTrainingSessions(user.uid);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingSessions = sessions
          .filter((session) => {
            const sessionDate = new Date(
              `${session.date}T00:00:00`
            );

            return (
              sessionDate >= today &&
              session.status !== "Completed" &&
              session.status !== "Rest"
            );
          })
          .sort((a, b) => {
            const dateComparison =
              a.date.localeCompare(b.date);

            if (dateComparison !== 0) {
              return dateComparison;
            }

            return a.time.localeCompare(b.time);
          })
          .slice(0, 3);

        setSchedule(upcomingSessions);
      } catch (error) {
        console.error(
          "Failed to load upcoming schedule:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

  return (
    <DashboardCard className="group" hover>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">
            Upcoming Schedule
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Your next scheduled training sessions
          </p>
        </div>

        <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
          <CalendarDays size={22} />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex h-32 items-center justify-center">
          <p className="text-zinc-500">
            Loading schedule...
          </p>
        </div>
      )}

      {/* Empty */}
      {!loading && schedule.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/50 p-8 text-center">
          <CalendarDays
            size={32}
            className="mx-auto text-zinc-600"
          />

          <p className="mt-4 font-medium text-white">
            No upcoming sessions
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Your upcoming training sessions will appear here.
          </p>
        </div>
      )}

      {/* Schedule */}
      {!loading && schedule.length > 0 && (
        <div className="space-y-4">
          {schedule.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-indigo-500/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-white">
                    {item.workout}
                  </h4>

                  <p className="mt-1 text-sm text-zinc-500">
                    {item.day}
                  </p>
                </div>

                <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
                  <Dumbbell size={18} />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  {item.time}
                </div>

                <div className="flex items-center gap-2">
                  <Dumbbell size={16} />
                  {item.type}
                </div>

                <div className="text-zinc-500">
                  {item.duration}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}