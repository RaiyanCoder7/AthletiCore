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
      label: "Season",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white lg:p-8">

      {/* Diagonal texture — consistent with the dashboard hero and auth pages */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="analytics-hero-diagonal"
            width="24"
            height="24"
            patternTransform="rotate(35)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="24" stroke="white" strokeWidth="8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#analytics-hero-diagonal)" />
      </svg>

      {/* Background glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />

      <div className="relative max-w-2xl">

        {/* Badge pill */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-blue-100 backdrop-blur">
          <BarChart3 size={13} />
          Analytics Dashboard
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold leading-tight lg:text-4xl">
          Performance Analytics
        </h1>

        {/* Description */}
        <p className="mt-3 max-w-lg text-sm leading-6 text-blue-100 lg:text-base">
          Analyse your performance trends, monitor recovery, and
          compare weekly progress with insights from your training
          sessions.
        </p>

        {/* Range toggle */}
        <div className="relative mt-6 flex flex-wrap gap-3">
          {ranges.map((item) => {
            const isActive = range === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onRangeChange(item.id)}
                className={
                  isActive
                    ? "rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                    : "rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                }
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