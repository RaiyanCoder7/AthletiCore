import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";

interface ChartData {
  week: string;
  sessions: number;
}

export default function TrainingProgressChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrainingProgress = async () => {
      const user = auth.currentUser;

      if (!user) {
        setData([]);
        setLoading(false);
        return;
      }

      try {
        const sessions = await getTrainingSessions(user.uid);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weeks: ChartData[] = [];

        for (let i = 5; i >= 0; i--) {
          const weekStart = new Date(today);

          weekStart.setDate(
            today.getDate() - i * 7
          );

          weekStart.setHours(0, 0, 0, 0);

          const weekEnd = new Date(weekStart);

          weekEnd.setDate(
            weekStart.getDate() + 6
          );

          weekEnd.setHours(23, 59, 59, 999);

          const completedSessionsThisWeek =
            sessions.filter((session) => {
              if (session.status !== "Completed") {
                return false;
              }

              const sessionDate = new Date(
                `${session.date}T00:00:00`
              );

              return (
                sessionDate >= weekStart &&
                sessionDate <= weekEnd
              );
            });

          weeks.push({
            week: `Week ${6 - i}`,
            sessions:
              completedSessionsThisWeek.length,
          });
        }

        setData(weeks);
      } catch (error) {
        console.error(
          "Failed to load training progress:",
          error
        );

        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadTrainingProgress();
  }, []);

  return (
    <DashboardCard>
      <SectionHeading
        title="Training Activity"
        subtitle="Completed training sessions over the last 6 weeks"
      />

      <div className="mt-8 h-80">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-zinc-500">
              Loading training progress...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="font-medium text-zinc-300">
              No training data available
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Complete training sessions to see your
              progress here.
            </p>
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -10,
                bottom: 0,
              }}
            >
              <CartesianGrid
                stroke="#27272a"
                strokeDasharray="4 4"
              />

              <XAxis
                dataKey="week"
                stroke="#71717a"
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                allowDecimals={false}
                stroke="#71717a"
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                formatter={(value) => [
                  `${value} session${
                    value === 1 ? "" : "s"
                  }`,
                  "Completed",
                ]}
              />

              <Line
                type="monotone"
                dataKey="sessions"
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
        )}
      </div>
    </DashboardCard>
  );
}