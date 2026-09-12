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
import { Dumbbell, Flame } from "lucide-react";

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

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-border/80 bg-card/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-orange-500" />
        <p className="text-sm font-bold text-foreground">
          {payload[0].value}%{" "}
          <span className="text-xs font-normal text-muted-foreground">Load</span>
        </p>
      </div>
    </div>
  );
}

export default function TrainingLoadChart({ range }: TrainingLoadChartProps) {
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
        const sessions = await getTrainingSessions(user.uid);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = new Date(today);
        let numberOfDays = 7;

        if (range === "7D") {
          startDate.setDate(today.getDate() - 6);
          numberOfDays = 7;
        } else if (range === "30D") {
          startDate.setDate(today.getDate() - 29);
          numberOfDays = 30;
        } else if (range === "SEASON") {
          startDate.setMonth(0);
          startDate.setDate(1);
          numberOfDays =
            Math.floor(
              (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;
        }

        const trainingLoadData: TrainingLoadData[] = [];

        if (range === "SEASON") {
          const weeklyData: Record<string, number> = {};

          sessions.forEach((session: TrainingSession) => {
            if (session.status !== "Completed") return;

            const sessionDate = new Date(`${session.date}T00:00:00`);
            if (sessionDate < startDate || sessionDate > today) return;

            const day = sessionDate.getDay();
            const difference = day === 0 ? 6 : day - 1;

            const weekStart = new Date(sessionDate);
            weekStart.setDate(sessionDate.getDate() - difference);

            const weekKey = [
              weekStart.getFullYear(),
              String(weekStart.getMonth() + 1).padStart(2, "0"),
              String(weekStart.getDate()).padStart(2, "0"),
            ].join("-");

            const match = session.duration.match(/\d+/);
            if (!match) return;

            weeklyData[weekKey] = (weeklyData[weekKey] || 0) + Number(match[0]);
          });

          Object.entries(weeklyData)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([week, minutes]) => {
              trainingLoadData.push({
                day: new Date(`${week}T00:00:00`).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
                load: Math.min(Math.round((minutes / 300) * 100), 100),
              });
            });
        } else {
          for (let i = 0; i < numberOfDays; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const dateString = [
              date.getFullYear(),
              String(date.getMonth() + 1).padStart(2, "0"),
              String(date.getDate()).padStart(2, "0"),
            ].join("-");

            const daySessions = sessions.filter(
              (session: TrainingSession) =>
                session.date === dateString && session.status === "Completed"
            );

            const totalMinutes = daySessions.reduce((total, session) => {
              const match = session.duration.match(/\d+/);
              if (!match) return total;
              return total + Number(match[0]);
            }, 0);

            const load = Math.min(Math.round((totalMinutes / 60) * 100), 100);

            trainingLoadData.push({
              day:
                range === "7D"
                  ? date.toLocaleDateString("en-US", { weekday: "short" })
                  : date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    }),
              load,
            });
          }
        }

        setData(trainingLoadData);
      } catch (error) {
        console.error("Failed to load training load:", error);
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

  const peakLoad =
    data.length > 0 ? Math.max(...data.map((item) => item.load)) : 0;

  return (
    <DashboardCard accent="orange" hover={false}>
      {/* Header & Metrics */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          title="Training Load"
          subtitle={`${rangeLabel} workload intensity distribution`}
        />

        {!loading && data.length > 0 && (
          <div className="mb-4 inline-flex items-center gap-1.5 self-start rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400 sm:mb-0 sm:self-auto">
            <Flame size={13} />
            <span>
              Peak Output:{" "}
              <strong className="text-foreground">{peakLoad}%</strong>
            </span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-80 w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground animate-pulse">
              Calculating training volume...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground shadow-xs">
              <Dumbbell size={20} />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">
              No training workload recorded
            </p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Complete scheduled sessions to chart your exertion and volume over this period.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="training-load-gradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="oklch(0.70 0.21 45)" stopOpacity={1} />
                  <stop offset="100%" stopColor="oklch(0.60 0.22 35)" stopOpacity={0.8} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="currentColor"
                strokeOpacity={0.08}
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                stroke="currentColor"
                opacity={0.5}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />

              <YAxis
                domain={[0, 100]}
                stroke="currentColor"
                opacity={0.5}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
                ticks={[0, 25, 50, 75, 100]}
              />

              <Tooltip
                content={<CustomChartTooltip />}
                cursor={{
                  fill: "currentColor",
                  opacity: 0.05,
                }}
              />

              <Bar
                dataKey="load"
                fill="url(#training-load-gradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={range === "7D" ? 38 : range === "30D" ? 18 : 12}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}