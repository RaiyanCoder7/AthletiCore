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
    <section className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 p-8">
      <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
        <BarChart3 size={16} />
        Analytics Dashboard
      </div>

      <h1 className="mt-6 text-5xl font-bold text-white">
        Performance Analytics
      </h1>

      <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-400">
        Analyse your performance trends, monitor recovery,
        compare weekly progress and gain insights from your
        training sessions.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        {ranges.map((item) => {
          const isActive =
            range === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                onRangeChange(item.id)
              }
              className={
                isActive
                  ? "rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
                  : "rounded-xl border border-zinc-700 px-5 py-3 font-medium text-zinc-300 transition hover:border-blue-500 hover:text-white"
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}