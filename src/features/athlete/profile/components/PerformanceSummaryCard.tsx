import { useEffect, useState } from "react";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import {
  Activity,
  Trophy,
  Target,
  HeartPulse,
  Clock,
  Dumbbell,
} from "lucide-react";

import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";
import type { TrainingSession } from "@/services/firebase/training";

interface PerformanceStats {
  trainingHours: number;
  sessions: number;
}

export default function PerformanceSummaryCard() {
  const [stats, setStats] = useState<PerformanceStats>({
    trainingHours: 0,
    sessions: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPerformanceSummary = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const sessions =
          await getTrainingSessions(user.uid);

        // Ignore Rest sessions
        const trainingSessions =
          sessions.filter(
            (session: TrainingSession) =>
              session.status !== "Rest"
          );

        // Calculate total training minutes
        const totalMinutes =
          trainingSessions.reduce(
            (total, session) => {
              const match =
                session.duration.match(/\d+/);

              if (!match) {
                return total;
              }

              return (
                total + Number(match[0])
              );
            },
            0
          );

        const totalHours =
          totalMinutes / 60;

        setStats({
          trainingHours: Number(
            totalHours.toFixed(1)
          ),
          sessions: trainingSessions.length,
        });
      } catch (error) {
        console.error(
          "Failed to load performance summary:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadPerformanceSummary();
  }, []);

  const statsData = [
    {
      title: "Fitness",
      value: "—",
      subtitle: "Data unavailable",
      icon: <Activity size={20} />,
      color: "text-green-400 bg-green-500/10",
    },
    {
      title: "Matches",
      value: "—",
      subtitle: "No match data",
      icon: <Trophy size={20} />,
      color: "text-yellow-400 bg-yellow-500/10",
    },
    {
      title: "Goals",
      value: "—",
      subtitle: "Goal data unavailable",
      icon: <Target size={20} />,
      color: "text-blue-400 bg-blue-500/10",
    },
    {
      title: "Recovery",
      value: "—",
      subtitle: "Recovery data unavailable",
      icon: <HeartPulse size={20} />,
      color: "text-red-400 bg-red-500/10",
    },
    {
      title: "Training",
      value: loading
        ? "..."
        : `${stats.trainingHours}h`,
      subtitle: "Total training time",
      icon: <Clock size={20} />,
      color: "text-purple-400 bg-purple-500/10",
    },
    {
      title: "Sessions",
      value: loading
        ? "..."
        : String(stats.sessions),
      subtitle: "Total training sessions",
      icon: <Dumbbell size={20} />,
      color: "text-cyan-400 bg-cyan-500/10",
    },
  ];

  return (
    <DashboardCard hover>
      <SectionHeading
        title="Performance Summary"
        subtitle="Overall athlete performance"
      />

      <div className="mt-8 grid grid-cols-2 gap-4">
        {statsData.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-zinc-800 bg-zinc-800/60 p-4 transition hover:border-blue-500/40"
          >
            <div
              className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}
            >
              {item.icon}
            </div>

            <p className="text-sm text-zinc-400">
              {item.title}
            </p>

            <h3 className="mt-2 text-2xl font-bold text-white">
              {item.value}
            </h3>

            <p className="mt-1 text-xs text-zinc-500">
              {item.subtitle}
            </p>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}