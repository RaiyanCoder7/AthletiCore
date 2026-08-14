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

import {
  getTrainingSessions,
} from "@/services/firebase/training";

import type {
  TrainingSession,
} from "@/services/firebase/training";

import {
  getLatestPerformanceTest,
} from "@/services/firebase/performance";

import {
  getTodayRecovery,
} from "@/services/firebase/recovery";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/services/firebase/firebase";

interface PerformanceStats {
  fitness: number | null;
  goals: number | null;
  recovery: number | null;
  trainingHours: number;
  sessions: number;
}

export default function PerformanceSummaryCard() {
  const [stats, setStats] =
    useState<PerformanceStats>({
      fitness: null,
      goals: null,
      recovery: null,
      trainingHours: 0,
      sessions: 0,
    });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadPerformanceSummary =
      async () => {
        const user = auth.currentUser;

        if (!user) {
          setLoading(false);
          return;
        }

        try {
          /* -----------------------------
             Load Firebase data
          ----------------------------- */

          const [
            trainingSessions,
            latestPerformance,
            todayRecovery,
            goalsSnapshot,
          ] = await Promise.all([
            getTrainingSessions(user.uid),
            getLatestPerformanceTest(
              user.uid
            ),
            getTodayRecovery(user.uid),
            getDocs(
              collection(
                db,
                "users",
                user.uid,
                "goals"
              )
            ),
          ]);

          /* -----------------------------
             Fitness
          ----------------------------- */

          let fitness: number | null =
            null;

          if (latestPerformance) {
            const average =
              (
                latestPerformance.sprintSpeed +
                latestPerformance.strength +
                latestPerformance.stamina +
                latestPerformance.agility +
                latestPerformance.accuracy +
                latestPerformance.endurance
              ) / 6;

            fitness = Math.round(
              average
            );
          }

          /* -----------------------------
             Recovery
          ----------------------------- */

          const recovery =
            todayRecovery
              ? todayRecovery.recoveryScore
              : null;

          /* -----------------------------
             Goals
          ----------------------------- */

          const goals =
            goalsSnapshot.size;

          /* -----------------------------
             Training Sessions
          ----------------------------- */

          const completedSessions =
            trainingSessions.filter(
              (
                session: TrainingSession
              ) =>
                session.status ===
                "Completed"
            );

          /* -----------------------------
             Training Minutes
          ----------------------------- */

          const totalMinutes =
            completedSessions.reduce(
              (
                total,
                session
              ) => {
                const match =
                  session.duration.match(
                    /\d+/
                  );

                if (!match) {
                  return total;
                }

                return (
                  total +
                  Number(match[0])
                );
              },
              0
            );

          const totalHours =
            totalMinutes / 60;

          /* -----------------------------
             Update stats
          ----------------------------- */

          setStats({
            fitness,
            goals,
            recovery,
            trainingHours:
              Number(
                totalHours.toFixed(1)
              ),
            sessions:
              completedSessions.length,
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
      value: loading
        ? "..."
        : stats.fitness !== null
        ? `${stats.fitness}%`
        : "—",
      subtitle:
        stats.fitness !== null
          ? "Latest performance rating"
          : "No performance data",
      icon: (
        <Activity size={20} />
      ),
      color:
        "text-green-400 bg-green-500/10",
    },

    {
      title: "Matches",
      value: "—",
      subtitle: "No match data",
      icon: (
        <Trophy size={20} />
      ),
      color:
        "text-yellow-400 bg-yellow-500/10",
    },

    {
      title: "Goals",
      value: loading
        ? "..."
        : String(stats.goals ?? 0),
      subtitle:
        stats.goals !== null
          ? "Total goals"
          : "No goal data",
      icon: (
        <Target size={20} />
      ),
      color:
        "text-blue-400 bg-blue-500/10",
    },

    {
      title: "Recovery",
      value: loading
        ? "..."
        : stats.recovery !== null
        ? `${stats.recovery}%`
        : "—",
      subtitle:
        stats.recovery !== null
          ? "Today's recovery"
          : "No recovery data",
      icon: (
        <HeartPulse size={20} />
      ),
      color:
        "text-red-400 bg-red-500/10",
    },

    {
      title: "Training",
      value: loading
        ? "..."
        : `${stats.trainingHours}h`,
      subtitle:
        "Completed training time",
      icon: (
        <Clock size={20} />
      ),
      color:
        "text-purple-400 bg-purple-500/10",
    },

    {
      title: "Sessions",
      value: loading
        ? "..."
        : String(stats.sessions),
      subtitle:
        "Completed training sessions",
      icon: (
        <Dumbbell size={20} />
      ),
      color:
        "text-cyan-400 bg-cyan-500/10",
    },
  ];

  return (
    <DashboardCard hover>
      <SectionHeading
        title="Performance Summary"
        subtitle="Overall athlete performance"
      />

      <div className="mt-8 grid grid-cols-2 gap-4">
        {statsData.map(
          (item) => (
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
          )
        )}
      </div>
    </DashboardCard>
  );
}