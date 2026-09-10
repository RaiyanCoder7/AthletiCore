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

import type { AnalyticsRange } from "../AnalyticsPage";

interface PerformanceTrendChartProps {
  range: AnalyticsRange;
}

interface PerformanceData {
  date: string;
  performance: number;
}

export default function PerformanceTrendChart({
  range,
}: PerformanceTrendChartProps) {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPerformanceTrend = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const tests =
          await getPerformanceTests(user.uid);

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const startDate = new Date(today);

        if (range === "7D") {
          startDate.setDate(
            today.getDate() - 6
          );
        }

        if (range === "30D") {
          startDate.setDate(
            today.getDate() - 29
          );
        }

        if (range === "SEASON") {
          // Current year season
          startDate.setMonth(0);
          startDate.setDate(1);
        }

        const filteredTests = tests.filter(
          (test) => {
            const testDate = new Date(
              `${test.date}T00:00:00`
            );

            return (
              testDate >= startDate &&
              testDate <= today
            );
          }
        );

        const performanceData =
          filteredTests.map((test) => {
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

        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadPerformanceTrend();
  }, [range]);

  const rangeLabel =
    range === "7D"
      ? "Last 7 days"
      : range === "30D"
      ? "Last 30 days"
      : "Current season";

  return (
    <DashboardCard accent="blue">
      <SectionHeading
        title="Performance Trend"
        subtitle={`${rangeLabel} performance progression`}
      />

      <div className="mt-8 h-80">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              Loading performance trend...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="font-medium text-foreground">
                No performance data available
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                No performance tests found for this period.
              </p>
            </div>
          </div>
        ) : (
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
                  dataKey="date"
                  stroke="currentColor"
                />

                <YAxis
                  domain={[0, 100]}
                  stroke="currentColor"
                />

                <Tooltip
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
          </div>
        )}
      </div>
    </DashboardCard>
  );
}