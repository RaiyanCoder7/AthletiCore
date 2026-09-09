import React from "react";
import DashboardCard from "@/components/ui/DashboardCard";
import StatRing from "@/components/ui/StatRing";
import StatBar from "@/components/ui/StatBar";

type StatsCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  /** Icon chip background, e.g. "bg-orange-500/10". Defaults to primary. */
  accentBg?: string;
  /** Icon + ring/bar color, e.g. "text-orange-500". Defaults to primary. */
  accentText?: string;
  /** Optional visual indicator under/beside the value. */
  indicator?: { type: "ring" | "bar"; percent: number };
  /** Whether the subtitle should read as a positive highlight. */
  subtitleTone?: "positive" | "neutral";
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  accentBg = "bg-primary/10",
  accentText = "text-primary",
  indicator,
  subtitleTone = "positive",
}: StatsCardProps) {
  const barColor = accentText.replace("text-", "bg-");

  return (
    <DashboardCard className="group" hover>

      {/* Header */}
      <div className="flex items-center justify-between">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentBg} ${accentText} transition group-hover:scale-110`}
        >
          {icon}
        </div>

        {indicator?.type === "ring" && (
          <StatRing percent={indicator.percent} className={accentText} />
        )}
      </div>

      {/* Title */}
      <p className="mt-4 text-sm font-medium text-muted-foreground">
        {title}
      </p>

      {/* Value */}
      <h3 className="mt-1 text-4xl font-bold tracking-tight text-foreground">
        {value}
      </h3>

      {/* Subtitle */}
      <p
        className={`mt-2 text-sm font-medium ${
          subtitleTone === "positive"
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-muted-foreground"
        }`}
      >
        {subtitle}
      </p>

      {indicator?.type === "bar" && (
        <StatBar percent={indicator.percent} className={barColor} />
      )}

    </DashboardCard>
  );
}
