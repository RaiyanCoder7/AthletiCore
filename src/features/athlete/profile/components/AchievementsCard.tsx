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

const icons = {
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
          await getAthleteAchievements(
            user.uid
          );

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

      {loading ? (
        <div className="mt-8 py-8 text-center text-sm text-muted-foreground">
          Loading achievements...
        </div>
      ) : achievements.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-8 text-center">
          <Trophy
            className="mx-auto text-muted-foreground"
            size={32}
          />

          <h4 className="mt-4 font-semibold text-foreground">
            No achievements yet
          </h4>

          <p className="mt-1 text-sm text-muted-foreground">
            Your achievements will appear here
            when they are added.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {achievements.map(
            (achievement) => {
              const Icon =
                icons[
                  achievement.type ??
                    "trophy"
                ];

              return (
                <div
                  key={achievement.id}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-muted/30 p-4 transition hover:border-primary/40"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground">
                      {achievement.title}
                    </h4>

                    <p className="text-sm text-muted-foreground">
                      {achievement.description ||
                        "Achievement unlocked"}
                    </p>

                    {achievement.date && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {achievement.date}
                      </p>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </DashboardCard>
  );
}