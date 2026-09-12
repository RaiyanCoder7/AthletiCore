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
import { CalendarCheck2, Flame } from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";

interface ChartData {
  week: string;
  sessions: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-border/80 bg-card/95 px-3.5 py-2 shadow-xl backdrop-blur-md">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <div className="mt-0.5 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-orange-500" />
        <p className="text-sm font-bold text-foreground">
          {payload[0].value}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            Session{payload[0].value === 1 ? "" : "s"}
          </span>
        </p>
      </div>
    </div>
  );
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
          weekStart.setDate(today.getDate() - i * 7);
          weekStart.setHours(0, 0, 0, 0);

          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);

          const completedSessionsThisWeek = sessions.filter((session) => {
            if (session.status !== "Completed") return false;

            const sessionDate = new Date(`${session.date}T00:00:00`);
            return sessionDate >= weekStart && sessionDate <= weekEnd;
          });

          weeks.push({
            week: `Wk ${6 - i}`,
            sessions: completedSessionsThisWeek.length,
          });
        }

        setData(weeks);
      } catch (error) {
        console.error("Failed to load training progress:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadTrainingProgress();
  }, []);

  const totalCompleted = data.reduce((acc, curr) => acc + curr.sessions, 0);
  const maxSessions = Math.max(4, ...data.map((d) => d.sessions));

  return (
    <DashboardCard accent="orange" hover={false}>
      {/* Header with Aggregate Volume Chip */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          title="Training Activity"
          subtitle="Completed sessions over the rolling 6-week block"
        />

        {!loading && data.length > 0 && (
          <div className="mb-4 inline-flex items-center gap-1.5 self-start rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400 sm:mb-0 sm:self-auto">
            <CalendarCheck2 size={13} />
            <span>
              <strong className="text-foreground">{totalCompleted}</strong> Total Sessions
            </span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-80 w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground animate-pulse">
              Aggregating weekly workload history...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground shadow-xs">
              <Flame size={20} />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">
              No historical sessions found
            </p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Log completed workouts to track your week-by-week consistency and progress curve.
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
                  id="training-progress-gradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="oklch(0.70 0.21 45)" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="oklch(0.70 0.21 45)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="currentColor"
                strokeOpacity={0.08}
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="week"
                stroke="currentColor"
                opacity={0.5}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />

              <YAxis
                domain={[0, maxSessions]}
                allowDecimals={false}
                stroke="currentColor"
                opacity={0.5}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
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
                dataKey="sessions"
                stroke="oklch(0.70 0.21 45)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#training-progress-gradient)"
                activeDot={{
                  r: 5,
                  fill: "oklch(0.70 0.21 45)",
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