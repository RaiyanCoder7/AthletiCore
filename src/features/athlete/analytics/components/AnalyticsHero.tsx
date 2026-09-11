import { BarChart3 } from "lucide-react";
import type { AnalyticsRange } from "../AnalyticsPage";

interface AnalyticsHeroProps {
  range: AnalyticsRange;
  onRangeChange: (range: AnalyticsRange) => void;
}

export default function AnalyticsHero({
  range,
  onRangeChange,
}: AnalyticsHeroProps) {
  const ranges: {
    id: AnalyticsRange;
    label: string;
  }[] = [
    {
      id: "7D",
      label: "Last 7 Days",
    },
    {
      id: "30D",
      label: "Last 30 Days",
    },
    {
      id: "SEASON",
      label: "Full Season",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm shadow-slate-900/[0.04] transition-colors dark:shadow-black/20 sm:p-8">
      {/* Ambient background light glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 right-1/4 h-48 w-48 rounded-full bg-indigo-500/5 blur-2xl dark:bg-indigo-500/10"
      />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Text & Header Block */}
        <div className="max-w-xl space-y-3">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <BarChart3 size={13} className="shrink-0" />
            <span>Telemetry & Insights</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Performance Analytics
          </h1>

          {/* Subtitle */}
          <p className="text-sm leading-relaxed text-muted-foreground">
            Analyze output trends, track biometric load, and benchmark your progress against previous training blocks.
          </p>
        </div>

        {/* Modern Segmented Range Switcher */}
        <div className="flex items-center rounded-xl border border-border/80 bg-muted/50 p-1 backdrop-blur-xs">
          {ranges.map((item) => {
            const isActive = range === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onRangeChange(item.id)}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition-all sm:text-sm ${
                  isActive
                    ? "bg-card text-foreground shadow-xs shadow-slate-950/5 dark:shadow-black/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}