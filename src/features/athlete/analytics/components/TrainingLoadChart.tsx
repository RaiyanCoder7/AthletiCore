import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
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
import type { TrainingSession } from "@/services/firebase/training";

import type { AnalyticsRange } from "../AnalyticsPage";

interface TrainingLoadChartProps {
  range: AnalyticsRange;
}

interface TrainingLoadData {
  day: string;
  load: number;
}

export default function TrainingLoadChart({
  range,
}: TrainingLoadChartProps) {
  const [data, setData] = useState<TrainingLoadData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrainingData = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const sessions =
          await getTrainingSessions(user.uid);

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const startDate = new Date(today);

        let numberOfDays = 7;

        if (range === "7D") {
          startDate.setDate(
            today.getDate() - 6
          );

          numberOfDays = 7;
        }

        if (range === "30D") {
          startDate.setDate(
            today.getDate() - 29
          );

          numberOfDays = 30;
        }

        if (range === "SEASON") {
          startDate.setMonth(0);
          startDate.setDate(1);

          numberOfDays =
            Math.floor(
              (today.getTime() -
                startDate.getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1;
        }

        const trainingLoadData: TrainingLoadData[] = [];

        /*
         * For longer ranges, group the data by week.
         * This keeps the chart readable instead of
         * displaying dozens or hundreds of bars.
         */

        if (range === "SEASON") {
          const weeklyData: Record<
            string,
            number
          > = {};

          sessions.forEach(
            (session: TrainingSession) => {
              if (
                session.status !==
                "Completed"
              ) {
                return;
              }

              const sessionDate =
                new Date(
                  `${session.date}T00:00:00`
                );

              if (
                sessionDate < startDate ||
                sessionDate > today
              ) {
                return;
              }

              const day =
                sessionDate.getDay();

              const difference =
                day === 0 ? 6 : day - 1;

              const weekStart =
                new Date(sessionDate);

              weekStart.setDate(
                sessionDate.getDate() -
                  difference
              );

              const weekKey = [
                weekStart.getFullYear(),
                String(
                  weekStart.getMonth() + 1
                ).padStart(2, "0"),
                String(
                  weekStart.getDate()
                ).padStart(2, "0"),
              ].join("-");

              const match =
                session.duration.match(
                  /\d+/
                );

              if (!match) {
                return;
              }

              weeklyData[weekKey] =
                (weeklyData[weekKey] || 0) +
                Number(match[0]);
            }
          );

          Object.entries(weeklyData)
            .sort(([a], [b]) =>
              a.localeCompare(b)
            )
            .forEach(
              ([week, minutes]) => {
                trainingLoadData.push({
                  day: new Date(
                    `${week}T00:00:00`
                  ).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                    }
                  ),
                  load: Math.min(
                    Math.round(
                      (minutes / 300) * 100
                    ),
                    100
                  ),
                });
              }
            );
        } else {
          for (
            let i = 0;
            i < numberOfDays;
            i++
          ) {
            const date =
              new Date(startDate);

            date.setDate(
              startDate.getDate() + i
            );

            const dateString = [
              date.getFullYear(),
              String(
                date.getMonth() + 1
              ).padStart(2, "0"),
              String(
                date.getDate()
              ).padStart(2, "0"),
            ].join("-");

            const daySessions =
              sessions.filter(
                (
                  session: TrainingSession
                ) =>
                  session.date ===
                    dateString &&
                  session.status ===
                    "Completed"
              );

            const totalMinutes =
              daySessions.reduce(
                (total, session) => {
                  const match =
                    session.duration.match(
                      /\d+/
                    );

                  if (!match) {
                    return total;
                  }

                  return (
                    total +
                    Number(match[0])
                  );
                },
                0
              );

            const load = Math.min(
              Math.round(
                (totalMinutes / 60) * 100
              ),
              100
            );

            trainingLoadData.push({
              day:
                range === "7D"
                  ? date.toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                      }
                    )
                  : date.toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    ),
              load,
            });
          }
        }

        setData(trainingLoadData);
      } catch (error) {
        console.error(
          "Failed to load training load:",
          error
        );

        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadTrainingData();
  }, [range]);

  const rangeLabel =
    range === "7D"
      ? "Last 7 days"
      : range === "30D"
      ? "Last 30 days"
      : "Current season";

  return (
    <DashboardCard>
      <SectionHeading
        title="Training Load"
        subtitle={`${rangeLabel} training intensity`}
      />

      <div className="mt-8 h-80">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-zinc-500">
              Loading training load...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="font-medium text-white">
                No training data available
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Complete training sessions to see your load.
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart data={data}>
              <CartesianGrid
                stroke="#27272a"
                strokeDasharray="4 4"
              />

              <XAxis
                dataKey="day"
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
                  "Training Load",
                ]}
              />

              <Bar
                dataKey="load"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}