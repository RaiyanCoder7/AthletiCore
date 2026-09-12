import { useEffect, useState } from "react";
import { BarChart3, Calendar, Dumbbell } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";

import type { TrainingSession } from "@/services/firebase/training";

interface DayActivity {
  day: string;
  date: string;
  sessions: number;
  isToday: boolean;
}

export default function WeeklyActivityChart() {
  const [data, setData] = useState<DayActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    const loadWeeklyActivity = async () => {
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
        const currentDayOfWeek = startOfWeek.getDay();
        const difference = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

        startOfWeek.setDate(startOfWeek.getDate() - difference);
        startOfWeek.setHours(0, 0, 0, 0);

        const weekData: DayActivity[] = [];
        let totalCount = 0;

        // Populate Monday -> Sunday
        for (let i = 0; i < 7; i++) {
          const currentDay = new Date(startOfWeek);
          currentDay.setDate(startOfWeek.getDate() + i);

          const year = currentDay.getFullYear();
          const month = String(currentDay.getMonth() + 1).padStart(2, "0");
          const date = String(currentDay.getDate()).padStart(2, "0");
          const dateString = `${year}-${month}-${date}`;

          const isCurrentToday =
            currentDay.toDateString() === today.toDateString();

          const sessionsForDay = sessions.filter(
            (session: TrainingSession) =>
              session.date === dateString && session.status !== "Rest"
          );

          totalCount += sessionsForDay.length;

          weekData.push({
            day: currentDay.toLocaleDateString("en-US", { weekday: "short" }),
            date: dateString,
            sessions: sessionsForDay.length,
            isToday: isCurrentToday,
          });
        }

        setTotalSessions(totalCount);
        setData(weekData);
      } catch (error) {
        console.error("Failed to load weekly activity:", error);
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyActivity();
  }, []);

  const hasActivity = data.some((item) => item.sessions > 0);

  // Calibrate max scale baseline (minimum 4 so a single session doesn't fill 100%)
  const maxSessionCount = Math.max(3, ...data.map((item) => item.sessions));

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Section Header with Live Weekly Count */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          title="Weekly Activity"
          subtitle="Training workload distribution"
        />

        {hasActivity && (
          <div className="mb-4 inline-flex items-center gap-1.5 self-start rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs text-muted-foreground sm:mb-0 sm:self-auto">
            <Dumbbell size={12} className="text-primary" />
            <span>
              <strong className="font-semibold text-foreground">{totalSessions}</strong>{" "}
              session{totalSessions === 1 ? "" : "s"} logged
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex min-h-[220px] flex-1 items-center justify-center">
          <p className="text-xs text-muted-foreground animate-pulse">
            Loading activity telemetry...
          </p>
        </div>
      ) : !hasActivity ? (
        /* Refined Empty State */
        <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground shadow-xs">
            <BarChart3 size={20} />
          </div>

          <p className="mt-3 text-sm font-semibold text-foreground">
            No training activity this week
          </p>

          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Complete a scheduled workout or log a training session to start visualizing your weekly volume.
          </p>
        </div>
      ) : (
        /* Modern Proportional Activity Chart */
        <div className="relative mt-6 flex min-h-[220px] flex-1 flex-col justify-end pt-6">
          {/* Faint Horizontal Reference Gridlines */}
          <div className="pointer-events-none absolute inset-x-0 bottom-8 top-4 flex flex-col justify-between opacity-40">
            <div className="border-b border-dashed border-border" />
            <div className="border-b border-dashed border-border" />
            <div className="border-b border-dashed border-border" />
          </div>

          {/* Bar Columns */}
          <div className="relative z-10 grid grid-cols-7 gap-2 sm:gap-4">
            {data.map((item) => {
              const heightPercentage = Math.round(
                (item.sessions / maxSessionCount) * 100
              );

              return (
                <div
                  key={item.date}
                  className="group flex flex-col items-center justify-end"
                >
                  {/* Session Badge (Shows on hover or if active) */}
                  <div className="mb-2 flex h-5 items-center">
                    {item.sessions > 0 ? (
                      <span className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary transition-transform group-hover:scale-110">
                        {item.sessions}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/30 group-hover:text-muted-foreground">
                        0
                      </span>
                    )}
                  </div>

                  {/* Track & Bar Column */}
                  <div className="relative flex h-36 w-full max-w-[42px] items-end justify-center rounded-xl bg-muted/40 p-1 transition-colors group-hover:bg-muted/70">
                    {item.sessions > 0 ? (
                      <div
                        className="w-full rounded-lg bg-gradient-to-t from-primary via-primary/90 to-sky-400 shadow-xs transition-all duration-500 group-hover:brightness-110"
                        style={{ height: `${Math.max(12, heightPercentage)}%` }}
                        title={`${item.day}: ${item.sessions} workout${
                          item.sessions === 1 ? "" : "s"
                        }`}
                      />
                    ) : (
                      <div className="h-1.5 w-4 rounded-full bg-border/80" />
                    )}
                  </div>

                  {/* Day Label */}
                  <div className="mt-3 flex flex-col items-center">
                    <span
                      className={`text-xs font-medium transition-colors ${
                        item.isToday
                          ? "rounded-md bg-primary/10 px-1.5 py-0.5 text-primary font-semibold"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}