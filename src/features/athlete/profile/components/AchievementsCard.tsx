import { useEffect, useState } from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import {
  Trophy,
  Medal,
  Award,
  Star,
} from "lucide-react";

import { auth } from "@/services/firebase/firebase";
import {
  getAthleteAchievements,
  type AthleteAchievement,
} from "@/services/firebase/profile";

const iconMap = {
  trophy: Trophy,
  medal: Medal,
  award: Award,
  star: Star,
};

export default function AchievementsCard() {
  const [achievements, setAchievements] =
    useState<AthleteAchievement[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadAchievements = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data =
          await getAthleteAchievements(user.uid);

        setAchievements(data);
      } catch (error) {
        console.error(
          "Failed to load achievements:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, []);

  return (
    <DashboardCard hover>
      <SectionHeading
        title="Achievements"
        subtitle="Career highlights"
      />

      <div className="mt-8 grid gap-4">
        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Loading achievements...
            </p>
          </div>
        ) : achievements.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Trophy size={24} />
            </div>

            <h4 className="mt-4 font-semibold text-card-foreground">
              No achievements yet
            </h4>

            <p className="mt-2 text-sm text-muted-foreground">
              Your achievements will appear here as they are added.
            </p>
          </div>
        ) : (
          achievements.map((achievement) => {
            const Icon =
              iconMap[
                achievement.type || "trophy"
              ] || Trophy;

            return (
              <div
                key={achievement.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={18} />
                </div>

                <div className="min-w-0">
                  <h4 className="font-semibold text-card-foreground">
                    {achievement.title}
                  </h4>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {achievement.description ||
                      "Achievement unlocked"}
                  </p>

                  {achievement.date && (
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {achievement.date}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardCard>
  );
}