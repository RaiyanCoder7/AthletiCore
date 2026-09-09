import { useEffect, useState } from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { Gauge } from "lucide-react";

import { auth } from "@/services/firebase/firebase";
import {
  getLatestPerformanceTest,
} from "@/services/firebase/performance";
import type {
  PerformanceTest,
} from "@/services/firebase/performance";

interface PersonalBest {
  title: string;
  value: number;
}

export default function PersonalBestCard() {
  const [performance, setPerformance] =
    useState<PerformanceTest | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadPerformance = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data =
          await getLatestPerformanceTest(user.uid);

        setPerformance(data);
      } catch (error) {
        console.error(
          "Failed to load personal bests:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadPerformance();
  }, []);

  const personalBests: PersonalBest[] = performance
    ? [
        {
          title: "Sprint Speed",
          value: performance.sprintSpeed,
        },
        {
          title: "Strength",
          value: performance.strength,
        },
        {
          title: "Agility",
          value: performance.agility,
        },
        {
          title: "Endurance",
          value: performance.endurance,
        },
        {
          title: "Stamina",
          value: performance.stamina,
        },
        {
          title: "Accuracy",
          value: performance.accuracy,
        },
      ]
    : [];

  return (
    <DashboardCard hover accent="blue">
      <SectionHeading
        title="Personal Bests"
        subtitle="Latest athletic performance metrics"
        action={
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Gauge size={20} />
          </div>
        }
      />

      <div className="mt-8 space-y-6">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Loading performance...
            </p>
          </div>
        ) : !performance ? (
          <div className="flex h-48 items-center justify-center text-center">
            <div>
              <Gauge
                size={32}
                className="mx-auto text-muted-foreground"
              />

              <p className="mt-3 font-medium text-foreground">
                No performance data available
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Performance test results will appear here.
              </p>
            </div>
          </div>
        ) : (
          personalBests.map((item) => {
            const value = Math.max(
              0,
              Math.min(item.value, 100)
            );

            return (
              <div key={item.title}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-foreground">
                    {item.title}
                  </span>

                  <span className="text-sm font-semibold text-foreground">
                    {item.value}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-700"
                    style={{
                      width: `${value}%`,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardCard>
  );
}