import { useEffect, useState } from "react";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { Gauge } from "lucide-react";

import { auth } from "@/services/firebase/firebase";
import { getLatestPerformanceTest } from "@/services/firebase/performance";
import type { PerformanceTest } from "@/services/firebase/performance";

interface PersonalBest {
  title: string;
  value: number;
}

export default function PersonalBestCard() {
  const [performance, setPerformance] =
    useState<PerformanceTest | null>(null);

  const [loading, setLoading] = useState(true);

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

  const personalBests: PersonalBest[] = [
    {
      title: "Sprint Speed",
      value: performance?.sprintSpeed ?? 0,
    },
    {
      title: "Strength",
      value: performance?.strength ?? 0,
    },
    {
      title: "Agility",
      value: performance?.agility ?? 0,
    },
    {
      title: "Endurance",
      value: performance?.endurance ?? 0,
    },
    {
      title: "Stamina",
      value: performance?.stamina ?? 0,
    },
  ];

  return (
    <DashboardCard hover>
      <SectionHeading
        title="Personal Bests"
        subtitle="Latest athletic performance metrics"
        action={
          <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
            <Gauge size={20} />
          </div>
        }
      />

      <div className="mt-8 space-y-6">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-zinc-500">
              Loading performance...
            </p>
          </div>
        ) : !performance ? (
          <div className="flex h-48 items-center justify-center text-center">
            <div>
              <Gauge
                size={32}
                className="mx-auto text-zinc-600"
              />

              <p className="mt-3 font-medium text-white">
                No performance data available
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Performance test results will appear here.
              </p>
            </div>
          </div>
        ) : (
          personalBests.map((item) => (
            <div key={item.title}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-zinc-300">
                  {item.title}
                </span>

                <span className="font-semibold text-white">
                  {item.value}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                  style={{
                    width: `${Math.min(item.value, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardCard>
  );
}