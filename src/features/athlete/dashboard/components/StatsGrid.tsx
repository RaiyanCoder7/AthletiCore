import { useEffect, useState } from "react";
import {
  Trophy,
  Dumbbell,
  HeartPulse,
  Target,
} from "lucide-react";

import StatsCard from "./StatsCard";

import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";
import { getTodayRecovery } from "@/services/firebase/recovery";

import type { TrainingSession } from "@/services/firebase/training";

export default function StatsGrid() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [recovery, setRecovery] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [trainingData, recoveryData] =
          await Promise.all([
            getTrainingSessions(user.uid),
            getTodayRecovery(user.uid),
          ]);

        setSessions(trainingData);

        setRecovery(
          recoveryData?.recoveryScore ?? null
        );
      } catch (error) {
        console.error(
          "Failed to load dashboard data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  /* --------------------------------
     Current Week
  -------------------------------- */

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);

  const day = startOfWeek.getDay();
  const difference = day === 0 ? 6 : day - 1;

  startOfWeek.setDate(
    startOfWeek.getDate() - difference
  );

  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);

  endOfWeek.setDate(
    endOfWeek.getDate() + 6
  );

  endOfWeek.setHours(23, 59, 59, 999);

  /* --------------------------------
     Weekly Sessions
  -------------------------------- */

  const weeklySessions = sessions.filter((session) => {
    const sessionDate = new Date(
      `${session.date}T00:00:00`
    );

    return (
      sessionDate >= startOfWeek &&
      sessionDate <= endOfWeek &&
      session.status !== "Rest"
    );
  });

  /* --------------------------------
     Completed Sessions
  -------------------------------- */

  const completedSessions = weeklySessions.filter(
    (session) => session.status === "Completed"
  );

  /* --------------------------------
     Weekly Performance
  -------------------------------- */

  const weeklyGoal = 6;

  const performance = Math.min(
    Math.round(
      (completedSessions.length / weeklyGoal) * 100
    ),
    100
  );

  /* --------------------------------
     Display Values
  -------------------------------- */

  const trainingDisplay = loading
    ? "..."
    : String(weeklySessions.length);

  const performanceDisplay = loading
    ? "..."
    : `${performance}%`;

  const completedDisplay = loading
    ? "..."
    : String(completedSessions.length);

  const recoveryDisplay = loading
    ? "..."
    : recovery !== null
    ? `${recovery}%`
    : "—";

  const recoverySubtitle =
    recovery !== null
      ? "Today's recovery"
      : "No recovery data";

  return (
    <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {/* Performance */}
      <StatsCard
        title="Performance"
        value={performanceDisplay}
        subtitle={
          loading
            ? "Loading"
            : "Weekly completion"
        }
        icon={<Trophy size={24} />}
      />

      {/* Training Sessions */}
      <StatsCard
        title="Training Sessions"
        value={trainingDisplay}
        subtitle="This week"
        icon={<Dumbbell size={24} />}
      />

      {/* Recovery */}
      <StatsCard
        title="Recovery"
        value={recoveryDisplay}
        subtitle={recoverySubtitle}
        icon={<HeartPulse size={24} />}
      />

      {/* Goals Completed */}
      <StatsCard
        title="Goals Completed"
        value={completedDisplay}
        subtitle="Completed workouts"
        icon={<Target size={24} />}
      />

    </section>
  );
}