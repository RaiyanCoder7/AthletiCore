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
import { getTodayRecovery } from "@/services/firebase/recovery";

import type { AnalyticsRange } from "../AnalyticsPage";

interface AnalyticsStatsGridProps {
  range: AnalyticsRange;
}

export default function AnalyticsStatsGrid({
  range,
}: AnalyticsStatsGridProps) {
  const [overallRating, setOverallRating] =
    useState<number | null>(null);

  const [trainingLoad, setTrainingLoad] =
    useState<number | null>(null);

  const [recovery, setRecovery] =
    useState<number | null>(null);

  const [sessions, setSessions] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadAnalyticsStats = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [
          trainingSessions,
          latestPerformance,
          todayRecovery,
        ] = await Promise.all([
          getTrainingSessions(user.uid),
          getLatestPerformanceTest(user.uid),
          getTodayRecovery(user.uid),
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
           Today's Recovery
        ----------------------------- */

        if (todayRecovery) {
          setRecovery(
            todayRecovery.recoveryScore
          );
        } else {
          setRecovery(null);
        }

        /* -----------------------------
           Date Range
        ----------------------------- */

        const today = new Date();

        today.setHours(
          0,
          0,
          0,
          0
        );

        const startDate =
          new Date(today);

        if (range === "7D") {
          startDate.setDate(
            today.getDate() - 6
          );
        }

        if (range === "30D") {
          startDate.setDate(
            today.getDate() - 29
          );
        }

        if (range === "SEASON") {
          startDate.setMonth(0);
          startDate.setDate(1);
        }

        /* -----------------------------
           Completed Sessions
        ----------------------------- */

        const filteredSessions =
          trainingSessions.filter(
            (session) => {
              if (
                session.status !==
                "Completed"
              ) {
                return false;
              }

              const sessionDate =
                new Date(
                  `${session.date}T00:00:00`
                );

              return (
                sessionDate >= startDate &&
                sessionDate <= today
              );
            }
          );

        setSessions(
          filteredSessions.length
        );

        /* -----------------------------
          Training Load
        ----------------------------- */

        const completedSessions =
          trainingSessions.filter(
            (session) => {
              if (
                session.status !== "Completed"
              ) {
                return false;
              }

              const sessionDate =
                new Date(
                  `${session.date}T00:00:00`
                );

                return (
                  sessionDate >= startDate &&
                  sessionDate <= today
                );
              }
            );

            const totalMinutes =
              completedSessions.reduce(
                (total, session) => {
                  const match =
                    session.duration.match(/\d+/);

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

            let trainingLoad = 0;

            if (range === "7D") {
              // 300 minutes = 100% for a 7-day period
              trainingLoad = Math.min(
                Math.round(
                  (totalMinutes / 300) * 100
                ),
                100
              );
            }

            if (range === "30D") {
              // 1200 minutes = 100% for 30 days
              trainingLoad = Math.min(
                Math.round(
                  (totalMinutes / 1200) * 100
                ),
                100
              );
            }

            if (range === "SEASON") {
              // 5000 minutes = 100% for the season
              trainingLoad = Math.min(
                Math.round(
                  (totalMinutes / 5000) * 100
                ),
                100
              );
            }

            setTrainingLoad(trainingLoad);

        
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
  }, [range]);

  const sessionsSubtitle =
    range === "7D"
      ? "Completed in last 7 days"
      : range === "30D"
      ? "Completed in last 30 days"
      : "Completed this season";

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
        subtitle={
          range === "7D"
            ? "Last 7 days"
            : range === "30D"
            ? "Last 30 days"
            : "Current season"
        }
        icon={
          <Dumbbell size={22} />
        }
      />

      {/* Recovery */}

      <StatsCard
        title="Recovery"
        value={
          loading
            ? "..."
            : recovery !== null
            ? `${recovery}%`
            : "—"
        }
        subtitle={
          recovery !== null
            ? "Today's recovery"
            : "No recovery data"
        }
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
        subtitle={sessionsSubtitle}
        icon={
          <Activity size={22} />
        }
      />
    </section>
  );
}