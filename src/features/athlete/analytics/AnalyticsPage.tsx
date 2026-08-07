import AnalyticsHero from "./components/AnalyticsHero";
import AnalyticsStatsGrid from "./components/AnalyticsStatsGrid";
import PerformanceTrendChart from "./components/PerformanceTrendChart";
import TrainingLoadChart from "./components/TrainingLoadChart";
import SkillDistributionChart from "./components/SkillDistributionChart";
import RecoveryAnalysisCard from "./components/RecoveryAnalysisCard";
import AIPerformanceInsights from "./components/AIPerformanceInsights";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">

      <AnalyticsHero />

      <AnalyticsStatsGrid />

      <section className="grid gap-6 xl:grid-cols-2">
        <PerformanceTrendChart />
        <TrainingLoadChart />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SkillDistributionChart />
        <RecoveryAnalysisCard />
      </section>

      <section>
        <AIPerformanceInsights />
      </section>

    </div>
  );
}