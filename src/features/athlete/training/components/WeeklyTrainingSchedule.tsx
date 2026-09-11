import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  Dumbbell,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";
import type { TrainingSession } from "@/services/firebase/training";

function getWeekStart(date: Date) {
  const result = new Date(date);
  const day = result.getDay();

  const difference = day === 0 ? 6 : day - 1;

  result.setDate(result.getDate() - difference);
  result.setHours(0, 0, 0, 0);

  return result;
}

function getWeekEnd(date: Date) {
  const result = new Date(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);

  return result;
}

function getSessionStatus(
  session: TrainingSession
) {
  if (session.status === "Completed") {
    return "Completed";
  }

  if (session.status === "In Progress") {
    return "In Progress";
  }

  if (session.status === "Rest") {
    return "Rest";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sessionDate = new Date(
    `${session.date}T00:00:00`
  );

  if (sessionDate.getTime() === today.getTime()) {
    return "Today";
  }

  if (sessionDate < today) {
    return "Missed";
  }

  return "Upcoming";
}

export default function WeeklyTrainingSchedule() {
  const [schedule, setSchedule] = useState<
    TrainingSession[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchedule = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const sessions =
          await getTrainingSessions(user.uid);

        const today = new Date();

        const weekStart = getWeekStart(today);
        const weekEnd = getWeekEnd(weekStart);

        const weeklySessions = sessions
          .filter((session) => {
            const sessionDate = new Date(
              `${session.date}T00:00:00`
            );

            return (
              sessionDate >= weekStart &&
              sessionDate <= weekEnd
            );
          })
          .sort((a, b) =>
            a.date.localeCompare(b.date)
          );

        setSchedule(weeklySessions);
      } catch (error) {
        console.error(
          "Failed to load training schedule:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

  return (
    <DashboardCard id="weekly-training-schedule" accent="orange">
      <SectionHeading
        title="Weekly Training Schedule"
        subtitle="Your planned workouts for this week"
        action={
          <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500">
            <CalendarDays size={20} />
          </div>
        }
      />

      <div className="mt-8 space-y-3">
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">
            Loading training schedule...
          </div>
        ) : schedule.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
              <Dumbbell
                className="text-orange-500"
                size={22}
              />
            </div>

            <p className="font-medium text-foreground">
              No training sessions this week
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Add a training session to build your
              weekly plan.
            </p>
          </div>
        ) : (
          schedule.map((item) => {
            const status = getSessionStatus(item);

            const sessionDate = new Date(
              `${item.date}T00:00:00`
            );

            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/40 p-4 transition hover:border-orange-500/40 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Date */}
                <div className="flex min-w-40 items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-muted">
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">
                      {sessionDate.toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                        }
                      )}
                    </span>

                    <span className="text-lg font-bold leading-none text-foreground">
                      {sessionDate.getDate()}
                    </span>
                  </div>

                  <div>
                    <p className="font-semibold text-foreground">
                      {item.day ||
                        sessionDate.toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                          }
                        )}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {item.type}
                    </p>
                  </div>
                </div>

                {/* Workout */}
                <div className="flex flex-1 items-center gap-3">
                  <div className="hidden rounded-xl bg-orange-500/10 p-3 text-orange-500 sm:block">
                    <Dumbbell size={18} />
                  </div>

                  <div>
                    <p className="font-medium text-foreground">
                      {item.workout}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock size={14} />

                      <span>
                        {item.time} • {item.duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                    status === "Completed"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : status === "In Progress"
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        : status === "Today"
                          ? "bg-primary/10 text-primary"
                          : status === "Missed"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : status === "Rest"
                              ? "bg-muted text-muted-foreground"
                              : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  {status}
                </span>
              </div>
            );
          })
        )}
      </div>
    </DashboardCard>
  );
}