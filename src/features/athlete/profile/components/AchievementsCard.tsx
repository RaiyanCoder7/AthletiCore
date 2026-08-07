import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import {
  Trophy,
  Medal,
  Award,
  Star,
} from "lucide-react";

const achievements = [
  {
    title: "League Champion",
    icon: <Trophy size={18} />,
    color: "bg-yellow-500/10 text-yellow-400",
  },
  {
    title: "MVP Award",
    icon: <Star size={18} />,
    color: "bg-blue-500/10 text-blue-400",
  },
  {
    title: "Top Scorer",
    icon: <Award size={18} />,
    color: "bg-emerald-500/10 text-emerald-400",
  },
  {
    title: "National Medal",
    icon: <Medal size={18} />,
    color: "bg-purple-500/10 text-purple-400",
  },
];

export default function AchievementsCard() {
  return (
    <DashboardCard hover>

      <SectionHeading
        title="Achievements"
        subtitle="Career highlights"
      />

      <div className="mt-8 grid gap-4">

        {achievements.map((achievement) => (
          <div
            key={achievement.title}
            className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-800/60 p-4 transition hover:border-blue-500/40"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${achievement.color}`}
            >
              {achievement.icon}
            </div>

            <div>
              <h4 className="font-semibold text-white">
                {achievement.title}
              </h4>

              <p className="text-sm text-zinc-400">
                Achievement Unlocked
              </p>
            </div>
          </div>
        ))}

      </div>

    </DashboardCard>
  );
}