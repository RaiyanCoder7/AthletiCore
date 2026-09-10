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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsStats = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        /*
         * --------------------------------
         * Load Training Sessions
         * --------------------------------
         */

        const trainingSessions =
          await getTrainingSessions(user.uid);

        /*
         * --------------------------------
         * Load Latest Performance
         * --------------------------------
         */

        let latestPerformance = null;

        try {
          latestPerformance =
            await getLatestPerformanceTest(
              user.uid
            );
        } catch (error) {
          console.error(
            "Failed to load performance data:",
            error
          );
        }

        /*
         * --------------------------------
         * Load Today's Recovery
         * --------------------------------
         */

        let todayRecovery = null;

        try {
          todayRecovery =
            await getTodayRecovery(user.uid);
        } catch (error) {
          console.error(
            "Failed to load recovery data:",
            error
          );
        }

        /*
         * --------------------------------
         * Overall Rating
         * --------------------------------
         */

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

        /*
         * --------------------------------
         * Recovery
         * --------------------------------
         */

        if (todayRecovery) {
          setRecovery(
            todayRecovery.recoveryScore
          );
        } else {
          setRecovery(null);
        }

        /*
         * --------------------------------
         * Date Range
         * --------------------------------
         */

        const today = new Date();

        today.setHours(
          23,
          59,
          59,
          999
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

        startDate.setHours(
          0,
          0,
          0,
          0
        );

        /*
         * --------------------------------
         * Completed Sessions
         * --------------------------------
         */

        const completedSessions =
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
          completedSessions.length
        );

        /*
         * --------------------------------
         * Training Load
         * --------------------------------
         */

        const totalMinutes =
          completedSessions.reduce(
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

        let calculatedTrainingLoad = 0;

        if (range === "7D") {
          calculatedTrainingLoad =
            Math.min(
              Math.round(
                (totalMinutes / 300) * 100
              ),
              100
            );
        }

        if (range === "30D") {
          calculatedTrainingLoad =
            Math.min(
              Math.round(
                (totalMinutes / 1200) * 100
              ),
              100
            );
        }

        if (range === "SEASON") {
          calculatedTrainingLoad =
            Math.min(
              Math.round(
                (totalMinutes / 5000) * 100
              ),
              100
            );
        }

        setTrainingLoad(
          calculatedTrainingLoad
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
  }, [range]);

  const sessionsSubtitle =
    range === "7D"
      ? "Completed in last 7 days"
      : range === "30D"
      ? "Completed in last 30 days"
      : "Completed this season";

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {/* Overall Rating — score-based, ring, primary */}
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
        icon={<TrendingUp size={18} />}
        accentBg="bg-primary/10"
        accentText="text-primary"
        indicator={{
          type: "ring",
          percent: overallRating ?? 0,
        }}
        subtitleTone={
          overallRating !== null ? "positive" : "neutral"
        }
      />

      {/* Training Load — count-based, bar, orange */}
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
        icon={<Dumbbell size={18} />}
        accentBg="bg-orange-500/10"
        accentText="text-orange-500"
        indicator={{
          type: "bar",
          percent: trainingLoad ?? 0,
        }}
        subtitleTone="neutral"
      />

      {/* Recovery — score-based, ring, rose */}
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
        icon={<HeartPulse size={18} />}
        accentBg="bg-rose-500/10"
        accentText="text-rose-500"
        indicator={{
          type: "ring",
          percent: recovery ?? 0,
        }}
        subtitleTone={
          recovery !== null ? "positive" : "neutral"
        }
      />

      {/* Sessions — count-based, emerald */}
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
        icon={<Activity size={18} />}
        accentBg="bg-emerald-500/10"
        accentText="text-emerald-500"
      />

    </section>
  );
}