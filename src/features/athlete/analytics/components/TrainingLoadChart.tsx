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

interface TrainingLoadData {
  day: string;
  load: number;
}

export default function TrainingLoadChart() {
  const [data, setData] = useState<TrainingLoadData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrainingData = async () => {
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

        // Monday of current week
        const startOfWeek = new Date(today);

        const day = startOfWeek.getDay();

        const difference =
          day === 0 ? 6 : day - 1;

        startOfWeek.setDate(
          startOfWeek.getDate() - difference
        );

        const trainingLoadData: TrainingLoadData[] = [];

        for (let i = 0; i < 7; i++) {
          const date = new Date(startOfWeek);

          date.setDate(
            startOfWeek.getDate() + i
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
              (session: TrainingSession) =>
                session.date === dateString &&
                session.status === "Completed"
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

          // 60 minutes = 100% daily training load
          const load = Math.min(
            Math.round(
              (totalMinutes / 60) * 100
            ),
            100
          );

          trainingLoadData.push({
            day: date.toLocaleDateString(
              "en-US",
              {
                weekday: "short",
              }
            ),
            load,
          });
        }

        setData(trainingLoadData);
      } catch (error) {
        console.error(
          "Failed to load training load:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadTrainingData();
  }, []);

  return (
    <DashboardCard>
      <SectionHeading
        title="Training Load"
        subtitle="Daily completed training intensity"
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