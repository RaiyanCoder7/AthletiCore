import { useEffect, useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";

import type { TrainingSession } from "@/services/firebase/training";

interface DayActivity {
  day: string;
  date: string;
  sessions: number;
  value: number;
}

export default function WeeklyActivityChart() {
  const [data, setData] = useState<DayActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeeklyActivity = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const sessions =
          await getTrainingSessions(user.uid);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Start of current week (Monday)
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        const difference = day === 0 ? 6 : day - 1;

        startOfWeek.setDate(
          startOfWeek.getDate() - difference
        );
        startOfWeek.setHours(0, 0, 0, 0);

        const weekData: DayActivity[] = [];

        // Create Monday -> Sunday
        for (let i = 0; i < 7; i++) {
          const currentDay = new Date(startOfWeek);

          currentDay.setDate(
            startOfWeek.getDate() + i
          );

          const year = currentDay.getFullYear();
          const month = String(
            currentDay.getMonth() + 1
          ).padStart(2, "0");
          const date = String(
            currentDay.getDate()
          ).padStart(2, "0");

          const dateString =
            `${year}-${month}-${date}`;

          const sessionsForDay = sessions.filter(
            (session: TrainingSession) =>
              session.date === dateString &&
              session.status !== "Rest"
          );

          weekData.push({
            day: currentDay.toLocaleDateString(
              "en-US",
              {
                weekday: "short",
              }
            ),
            date: dateString,
            sessions: sessionsForDay.length,
            value: 0,
          });
        }

        // Find busiest training day
        const maximumSessions = Math.max(
          ...weekData.map(
            (item) => item.sessions
          )
        );

        // Convert session counts to percentages
        const formattedData = weekData.map(
          (item) => ({
            ...item,
            value:
              maximumSessions === 0
                ? 0
                : Math.round(
                    (item.sessions /
                      maximumSessions) *
                      100
                  ),
          })
        );

        setData(formattedData);
      } catch (error) {
        console.error(
          "Failed to load weekly activity:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyActivity();
  }, []);

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Header */}
      <div>
        <SectionHeading
          title="Weekly Activity"
          subtitle="Training sessions this week"
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-zinc-500">
            Loading weekly activity...
          </p>
        </div>
      ) : (
        /* Chart */
        <div className="mt-8 flex flex-1 items-end gap-4">
          {data.map((item) => (
            <div
              key={item.date}
              className="flex h-full flex-1 flex-col items-center justify-end"
            >
              {/* Session count */}
              <span className="mb-2 text-xs font-medium text-zinc-400">
                {item.sessions}
              </span>

              {/* Bar */}
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-500 hover:scale-105"
                style={{
                  height:
                    item.value === 0
                      ? "4px"
                      : `${item.value}%`,
                }}
                title={`${item.sessions} training session${
                  item.sessions === 1 ? "" : "s"
                }`}
              />

              {/* Day */}
              <span className="mt-3 text-sm text-zinc-500">
                {item.day}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}