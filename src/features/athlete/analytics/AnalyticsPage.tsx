import { useState } from "react";

import AnalyticsHero from "./components/AnalyticsHero";
import AnalyticsStatsGrid from "./components/AnalyticsStatsGrid";
import PerformanceTrendChart from "./components/PerformanceTrendChart";
import TrainingLoadChart from "./components/TrainingLoadChart";
import SkillDistributionChart from "./components/SkillDistributionChart";
import RecoveryAnalysisCard from "./components/RecoveryAnalysisCard";
import AIPerformanceCard from "./components/AIPerformanceCard";

export type AnalyticsRange = "7D" | "30D" | "SEASON";

export default function AnalyticsPage() {
  const [range, setRange] =
    useState<AnalyticsRange>("7D");

  return (
    <div className="space-y-8">
      <AnalyticsHero
        range={range}
        onRangeChange={setRange}
      />

      <AnalyticsStatsGrid range={range} />

      <section className="grid gap-6 xl:grid-cols-2">
        <PerformanceTrendChart range={range} />
        <TrainingLoadChart range={range} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SkillDistributionChart />
        <RecoveryAnalysisCard />
      </section>

      <section>
        <AIPerformanceCard />
      </section>
    </div>
  );
}