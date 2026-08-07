import { useEffect, useState } from "react";
import {
  Clock,
  Dumbbell,
  Activity,
  CalendarDays,
} from "lucide-react";

import StatsCard from "@/features/athlete/dashboard/components/StatsCard";

import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";
import type { TrainingSession } from "@/services/firebase/training";

export default function TrainingStatsGrid() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getTrainingSessions(user.uid);

        setSessions(data);
      } catch (error) {
        console.error("Failed to load training statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const completedSessions = sessions.filter(
    (session) => session.status === "Completed"
  );

  const upcomingSessions = sessions.filter(
    (session) => session.status === "Upcoming"
  );

  const totalMinutes = sessions.reduce((total, session) => {
    const match = session.duration.match(/\d+/);

    if (!match) {
      return total;
    }

    return total + Number(match[0]);
  }, 0);

  const trainingHours = (totalMinutes / 60).toFixed(1);

  if (loading) {
    return (
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Workouts Completed"
          value="..."
          subtitle="Loading"
          icon={<Dumbbell size={22} />}
        />

        <StatsCard
          title="Training Hours"
          value="..."
          subtitle="Loading"
          icon={<Clock size={22} />}
        />

        <StatsCard
          title="Upcoming Sessions"
          value="..."
          subtitle="Loading"
          icon={<CalendarDays size={22} />}
        />

        <StatsCard
          title="Total Sessions"
          value="..."
          subtitle="Loading"
          icon={<Activity size={22} />}
        />
      </section>
    );
  }

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      <StatsCard
        title="Workouts Completed"
        value={String(completedSessions.length)}
        subtitle="Completed sessions"
        icon={<Dumbbell size={22} />}
      />

      <StatsCard
        title="Training Hours"
        value={trainingHours}
        subtitle="Total scheduled time"
        icon={<Clock size={22} />}
      />

      <StatsCard
        title="Upcoming Sessions"
        value={String(upcomingSessions.length)}
        subtitle="Scheduled workouts"
        icon={<CalendarDays size={22} />}
      />

      <StatsCard
        title="Total Sessions"
        value={String(sessions.length)}
        subtitle="All training sessions"
        icon={<Activity size={22} />}
      />

    </section>
  );
}