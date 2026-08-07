import { useEffect, useState } from "react";

import {
  Activity,
  TrendingUp,
  HeartPulse,
  Dumbbell,
} from "lucide-react";

import StatsCard from "@/features/athlete/dashboard/components/StatsCard";

import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";
import { getLatestPerformanceTest } from "@/services/firebase/performance";

export default function AnalyticsStatsGrid() {
  const [overallRating, setOverallRating] =
    useState<number | null>(null);

  const [trainingLoad, setTrainingLoad] =
    useState<number | null>(null);

  const [sessions, setSessions] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsStats = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [
          trainingSessions,
          latestPerformance,
        ] = await Promise.all([
          getTrainingSessions(user.uid),
          getLatestPerformanceTest(user.uid),
        ]);

        /* -----------------------------
           Overall Rating
        ----------------------------- */

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

          setOverallRating(
            Math.round(average)
          );
        } else {
          setOverallRating(null);
        }

        /* -----------------------------
           Current Week Training Load
        ----------------------------- */

        const today = new Date();

        today.setHours(
          0,
          0,
          0,
          0
        );

        const startOfWeek =
          new Date(today);

        const day =
          startOfWeek.getDay();

        const difference =
          day === 0
            ? 6
            : day - 1;

        startOfWeek.setDate(
          startOfWeek.getDate() -
            difference
        );

        startOfWeek.setHours(
          0,
          0,
          0,
          0
        );

        const endOfWeek =
          new Date(startOfWeek);

        endOfWeek.setDate(
          endOfWeek.getDate() + 6
        );

        endOfWeek.setHours(
          23,
          59,
          59,
          999
        );

        const weeklySessions =
          trainingSessions.filter(
            (session) => {
              const sessionDate =
                new Date(
                  `${session.date}T00:00:00`
                );

                return (
                  sessionDate >= startOfWeek &&
                  sessionDate <= endOfWeek &&
                  session.status === "Completed"
                );
              }
            );

        const weeklyMinutes =
          weeklySessions.reduce(
            (total, session) => {
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

        const weeklyLoad =
          Math.min(
            Math.round(
              (weeklyMinutes /
                300) *
                100
            ),
            100
          );

        setTrainingLoad(
          weeklyLoad
        );

        /* -----------------------------
           Current Month Sessions
        ----------------------------- */

        const currentYear =
          today.getFullYear();

        const currentMonth =
          today.getMonth();

        const monthlySessions =
          trainingSessions.filter(
            (session) => {
              const sessionDate =
                new Date(
                  `${session.date}T00:00:00`
                );

              return (
                sessionDate.getFullYear() ===
                  currentYear &&
                sessionDate.getMonth() ===
                  currentMonth &&
                session.status ===
                  "Completed"
              );
            }
          );

        setSessions(
          monthlySessions.length
        );
      } catch (error) {
        console.error(
          "Failed to load analytics stats:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsStats();
  }, []);

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {/* Overall Rating */}
      <StatsCard
        title="Overall Rating"
        value={
          loading
            ? "..."
            : overallRating !== null
            ? String(overallRating)
            : "—"
        }
        subtitle={
          overallRating !== null
            ? "Latest performance test"
            : "No performance data"
        }
        icon={
          <TrendingUp size={22} />
        }
      />

      {/* Training Load */}
      <StatsCard
        title="Training Load"
        value={
          loading
            ? "..."
            : trainingLoad !== null
            ? `${trainingLoad}%`
            : "—"
        }
        subtitle="This week"
        icon={
          <Dumbbell size={22} />
        }
      />

      {/* Recovery */}
      <StatsCard
        title="Recovery"
        value="—"
        subtitle="Recovery data coming soon"
        icon={
          <HeartPulse size={22} />
        }
      />

      {/* Sessions */}
      <StatsCard
        title="Sessions"
        value={
          loading
            ? "..."
            : sessions !== null
            ? String(sessions)
            : "0"
        }
        subtitle="Completed this month"
        icon={
          <Activity size={22} />
        }
      />
    </section>
  );
}