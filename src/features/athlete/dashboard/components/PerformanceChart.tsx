import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";
import type { TrainingSession } from "@/services/firebase/training";

interface PerformanceData {
  day: string;
  score: number;
}

export default function PerformanceChart() {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPerformance = async () => {
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

        const performanceData: PerformanceData[] = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);

          date.setDate(
            today.getDate() - i
          );

          const year = date.getFullYear();

          const month = String(
            date.getMonth() + 1
          ).padStart(2, "0");

          const dayNumber = String(
            date.getDate()
          ).padStart(2, "0");

          const dateString =
            `${year}-${month}-${dayNumber}`;

          const daySessions =
            sessions.filter(
              (session: TrainingSession) =>
                session.date === dateString &&
                session.status !== "Rest"
            );

          const completedSessions =
            daySessions.filter(
              (session) =>
                session.status === "Completed"
            );

          /*
           * Daily completion percentage
           *
           * Example:
           * 2 scheduled
           * 1 completed
           * = 50%
           */
          const score =
            daySessions.length > 0
              ? Math.round(
                  (completedSessions.length /
                    daySessions.length) *
                    100
                )
              : 0;

          performanceData.push({
            day: date.toLocaleDateString(
              "en-US",
              {
                weekday: "short",
              }
            ),
            score,
          });
        }

        setData(performanceData);
      } catch (error) {
        console.error(
          "Failed to load performance data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadPerformance();
  }, []);

  /*
   * Today's completion
   */
  const todayScore =
    data[data.length - 1]?.score ?? 0;

  /*
   * Previous day's completion
   */
  const previousScore =
    data[data.length - 2]?.score ?? 0;

  /*
   * Change from previous day
   */
  const change =
    previousScore > 0
      ? Math.round(
          ((todayScore - previousScore) /
            previousScore) *
            100
        )
      : 0;

  return (
    <DashboardCard className="group" hover accent="blue">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <SectionHeading
            title="Weekly Performance"
            subtitle="Training completion over the last 7 days"
          />
        </div>

        {!loading && (
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              change >= 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>

      <div className="h-72">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              Loading performance...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              No training data available.
            </p>
          </div>
        ) : (
          /*
            The wrapping div carries text-muted-foreground so the
            chart's grid lines and axis ticks (set to "currentColor"
            below) automatically pick up the right shade for whichever
            theme is active, instead of being hardcoded hex values
            that only worked in dark mode.
          */
          <div className="h-full text-muted-foreground [&_.recharts-default-tooltip]:!rounded-xl [&_.recharts-default-tooltip]:!border-border [&_.recharts-default-tooltip]:!bg-card [&_.recharts-default-tooltip]:!text-foreground">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={data}>
                <CartesianGrid
                  stroke="currentColor"
                  strokeOpacity={0.15}
                  strokeDasharray="4 4"
                />

                <XAxis
                  dataKey="day"
                  tick={{ fill: "currentColor" }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  domain={[0, 100]}
                  allowDecimals={false}
                  tick={{ fill: "currentColor" }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  formatter={(value) => [
                    `${value}%`,
                    "Completion",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  dot={{
                    r: 5,
                    fill: "#3b82f6",
                  }}
                  activeDot={{
                    r: 8,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}