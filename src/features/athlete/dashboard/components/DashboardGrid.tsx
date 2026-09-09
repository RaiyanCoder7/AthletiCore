import TodayTrainingCard from "./TodayTrainingCard";
import RecentActivityCard from "./RecentActivityCard";
import PerformanceChart from "./PerformanceChart";
import GoalProgressCard from "./GoalProgressCard";
import UpcomingScheduleCard from "./UpcomingScheduleCard";
import WeeklyActivityChart from "./WeeklyActivityChart";
import DashboardCard from "@/components/ui/DashboardCard";

export default function DashboardGrid() {
  return (
    <div className="mt-8 space-y-6">

      {/* Row 1 */}
      <section className="grid gap-6 xl:grid-cols-2">
        <TodayTrainingCard />
        <RecentActivityCard />
        <DashboardCard className="min-h-[420px] xl:col-span-2" accent="orange">
          <WeeklyActivityChart />
        </DashboardCard>
      </section>

      {/* Row 2 */}
      <section className="grid gap-6 xl:grid-cols-3">
        <div
          id="dashboard-performance"
          className="xl:col-span-2"
        >
          <PerformanceChart />
        </div>

        <GoalProgressCard />
      </section>

      {/* Row 3 */}
      <section>
        <UpcomingScheduleCard />
      </section>

    </div>
  );
}