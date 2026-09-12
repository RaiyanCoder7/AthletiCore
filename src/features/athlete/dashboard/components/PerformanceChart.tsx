import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";
import type { TrainingSession } from "@/services/firebase/training";

interface PerformanceData {
  day: string;
  score: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-border/80 bg-card/95 px-3 py-2 shadow-xl backdrop-blur-md">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-foreground">
        {payload[0].value}%{" "}
        <span className="text-xs font-normal text-muted-foreground">Completion</span>
      </p>
    </div>
  );
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
        const sessions = await getTrainingSessions(user.uid);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const performanceData: PerformanceData[] = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);

          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const dayNumber = String(date.getDate()).padStart(2, "0");
          const dateString = `${year}-${month}-${dayNumber}`;

          const daySessions = sessions.filter(
            (session: TrainingSession) =>
              session.date === dateString && session.status !== "Rest"
          );

          const completedSessions = daySessions.filter(
            (session) => session.status === "Completed"
          );

          const score =
            daySessions.length > 0
              ? Math.round((completedSessions.length / daySessions.length) * 100)
              : 0;

          performanceData.push({
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            score,
          });
        }

        setData(performanceData);
      } catch (error) {
        console.error("Failed to load performance data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPerformance();
  }, []);

  const todayScore = data[data.length - 1]?.score ?? 0;
  const previousScore = data[data.length - 2]?.score ?? 0;

  const change =
    previousScore > 0
      ? Math.round(((todayScore - previousScore) / previousScore) * 100)
      : todayScore > 0
      ? 100
      : 0;

  const isPositive = change >= 0;

  return (
    <DashboardCard accent="blue" hover={false}>
      {/* Section Header with Delta Metric */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          title="Weekly Performance"
          subtitle="Training completion over the last 7 days"
        />

        {!loading && (
          <div
            className={`inline-flex items-center gap-1 self-start rounded-full border px-2.5 py-1 text-xs font-semibold sm:self-auto ${
              isPositive
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-destructive/20 bg-destructive/10 text-destructive"
            }`}
          >
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            <span>
              {isPositive ? "+" : ""}
              {change}% vs yesterday
            </span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground animate-pulse">
              Aggregating biometric data...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              No training sessions recorded for this timeframe.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="performance-gradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary, #3b82f6)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-primary, #3b82f6)"
                    stopOpacity={0}
                  />
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
                  stroke: "currentColor",
                  strokeOpacity: 0.15,
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
              />

              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--color-primary, #3b82f6)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#performance-gradient)"
                activeDot={{
                  r: 5,
                  fill: "var(--color-primary, #3b82f6)",
                  stroke: "var(--color-card, #ffffff)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}