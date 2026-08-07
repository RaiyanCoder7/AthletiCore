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
import { getPerformanceTests } from "@/services/firebase/performance";

interface PerformanceData {
  date: string;
  performance: number;
}

export default function PerformanceTrendChart() {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPerformanceTrend = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const tests =
          await getPerformanceTests(user.uid);

        const performanceData =
          tests.map((test) => {
            const average =
              (
                test.sprintSpeed +
                test.strength +
                test.stamina +
                test.agility +
                test.accuracy +
                test.endurance
              ) / 6;

            const formattedDate =
              new Date(
                `${test.date}T00:00:00`
              ).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                }
              );

            return {
              date: formattedDate,
              performance: Math.round(
                average
              ),
            };
          });

        setData(performanceData);
      } catch (error) {
        console.error(
          "Failed to load performance trend:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadPerformanceTrend();
  }, []);

  return (
    <DashboardCard>
      <SectionHeading
        title="Performance Trend"
        subtitle="Performance progression over time"
      />

      <div className="mt-8 h-80">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-zinc-500">
              Loading performance trend...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="font-medium text-white">
                No performance data available
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Add performance tests to see your progress.
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart data={data}>
              <CartesianGrid
                stroke="#27272a"
                strokeDasharray="4 4"
              />

              <XAxis
                dataKey="date"
                stroke="#71717a"
              />

              <YAxis
                domain={[0, 100]}
                stroke="#71717a"
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "12px",
                }}
                formatter={(value) => [
                  `${value}%`,
                  "Performance",
                ]}
              />

              <Line
                type="monotone"
                dataKey="performance"
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