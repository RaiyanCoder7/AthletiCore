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
import { Activity, TrendingUp } from "lucide-react";

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
  timestamp: number;
  performance: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: PerformanceData }>;
  label?: string;
}

function CustomChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-border/80 bg-card/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <p className="text-sm font-bold text-foreground">
          {payload[0].value}%{" "}
          <span className="text-xs font-normal text-muted-foreground">Overall Index</span>
        </p>
      </div>
    </div>
  );
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
        const tests = await getPerformanceTests(user.uid);

        if (!tests || tests.length === 0) {
          setData([]);
          setLoading(false);
          return;
        }

        const now = new Date();
        const endOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999
        );
        const startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
          0
        );

        if (range === "7D") {
          startDate.setDate(startDate.getDate() - 6);
        } else if (range === "30D") {
          startDate.setDate(startDate.getDate() - 29);
        } else if (range === "SEASON") {
          startDate.setMonth(0, 1);
        }

        const validPoints: PerformanceData[] = [];

        tests.forEach((test: any) => {
          if (!test?.date) return;

          const parsedDate = new Date(
            typeof test.date === "string" && !test.date.includes("T")
              ? `${test.date}T00:00:00`
              : test.date
          );

          if (isNaN(parsedDate.getTime())) return;
          if (parsedDate < startDate || parsedDate > endOfToday) return;

          const sprint = Number(test.sprintSpeed) || 0;
          const strength = Number(test.strength) || 0;
          const stamina = Number(test.stamina) || 0;
          const agility = Number(test.agility) || 0;
          const accuracy = Number(test.accuracy) || 0;
          const endurance = Number(test.endurance) || 0;

          const average =
            (sprint + strength + stamina + agility + accuracy + endurance) / 6;

          validPoints.push({
            date: parsedDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            timestamp: parsedDate.getTime(),
            performance: Math.round(average),
          });
        });

        validPoints.sort((a, b) => a.timestamp - b.timestamp);
        setData(validPoints);
      } catch (error) {
        console.error("Failed to load performance trend:", error);
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

  const scores = data.map((d) => d.performance);
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 100;
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  // Calibrate Y-Axis bounds to zoom in on variations while keeping breathing room
  const yDomainMin = Math.max(0, Math.floor((minScore - 15) / 10) * 10);
  const yDomainMax = Math.min(100, Math.ceil((maxScore + 10) / 10) * 10);

  return (
    <DashboardCard accent="blue" hover={false} className="min-w-0">
      {/* Header & Metric Badge */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          title="Performance Trend"
          subtitle={`${rangeLabel} progression & output index`}
        />

        {!loading && data.length > 0 && (
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:self-auto">
            <Activity size={13} />
            <span>
              Average Index:{" "}
              <strong className="text-foreground">{averageScore}%</strong> ({data.length}{" "}
              test{data.length === 1 ? "" : "s"})
            </span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-[320px] w-full min-w-0">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground animate-pulse">
              Aggregating benchmark trends...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground shadow-xs">
              <TrendingUp size={20} />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">
              No performance benchmarks recorded
            </p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Run a physical performance test to log metrics and plot historical output across this timeframe.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320} minHeight={280}>
            <AreaChart
              data={data}
              margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="date"
                stroke="currentColor"
                opacity={0.5}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />

              <YAxis
                domain={[yDomainMin, yDomainMax]}
                stroke="currentColor"
                opacity={0.5}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
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
                dataKey="performance"
                stroke="var(--color-primary, #3b82f6)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#trend-gradient)"
                // Render prominent dots on each data point
                dot={{
                  r: 5,
                  fill: "var(--color-primary, #3b82f6)",
                  stroke: "var(--color-card, #111827)",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 7,
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