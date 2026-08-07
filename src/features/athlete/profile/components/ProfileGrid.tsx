import PersonalInfoCard from "./PersonalInfoCard";
import PerformanceSummaryCard from "./PerformanceSummaryCard";
import AchievementsCard from "./AchievementsCard";
import PersonalBestCard from "./PersonalBestCard";

interface ProfileGridProps {
  profileVersion: number;
}

export default function ProfileGrid({
  profileVersion,
}: ProfileGridProps) {
  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-2">
      <PersonalInfoCard profileVersion={profileVersion} />

      <PerformanceSummaryCard />

      <AchievementsCard />

      <PersonalBestCard />
    </div>
  );
}