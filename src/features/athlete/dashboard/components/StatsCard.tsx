import React from "react";
import DashboardCard from "@/components/ui/DashboardCard";

type StatsCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
}: StatsCardProps) {
  return (
    <DashboardCard className="group" hover>

      {/* Header */}
      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-muted-foreground">
          {title}
        </p>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:scale-110 group-hover:bg-primary/20">
          {icon}
        </div>

      </div>

      {/* Value */}
      <h3 className="mt-6 text-5xl font-bold tracking-tight text-foreground">
        {value}
      </h3>

      {/* Subtitle */}
      <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
        {subtitle}
      </p>

    </DashboardCard>
  );
}
