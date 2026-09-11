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

  const completionPercent = sessions.length
    ? Math.round(
        (completedSessions.length / sessions.length) * 100
      )
    : 0;

  if (loading) {
    return (
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Workouts Completed"
          value="..."
          subtitle="Loading"
          icon={<Dumbbell size={18} />}
          accentBg="bg-emerald-500/10"
          accentText="text-emerald-500"
          subtitleTone="neutral"
        />

        <StatsCard
          title="Training Hours"
          value="..."
          subtitle="Loading"
          icon={<Clock size={18} />}
          accentBg="bg-orange-500/10"
          accentText="text-orange-500"
          subtitleTone="neutral"
        />

        <StatsCard
          title="Upcoming Sessions"
          value="..."
          subtitle="Loading"
          icon={<CalendarDays size={18} />}
          accentBg="bg-indigo-500/10"
          accentText="text-indigo-500"
          subtitleTone="neutral"
        />

        <StatsCard
          title="Total Sessions"
          value="..."
          subtitle="Loading"
          icon={<Activity size={18} />}
          accentBg="bg-primary/10"
          accentText="text-primary"
          subtitleTone="neutral"
        />
      </section>
    );
  }

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {/* Workouts Completed — count-based, bar, emerald */}
      <StatsCard
        title="Workouts Completed"
        value={String(completedSessions.length)}
        subtitle="Completed sessions"
        icon={<Dumbbell size={18} />}
        accentBg="bg-emerald-500/10"
        accentText="text-emerald-500"
        indicator={{
          type: "bar",
          percent: completionPercent,
        }}
      />

      {/* Training Hours — orange */}
      <StatsCard
        title="Training Hours"
        value={trainingHours}
        subtitle="Total scheduled time"
        icon={<Clock size={18} />}
        accentBg="bg-orange-500/10"
        accentText="text-orange-500"
      />

      {/* Upcoming Sessions — indigo, matches schedule */}
      <StatsCard
        title="Upcoming Sessions"
        value={String(upcomingSessions.length)}
        subtitle="Scheduled workouts"
        icon={<CalendarDays size={18} />}
        accentBg="bg-indigo-500/10"
        accentText="text-indigo-500"
        subtitleTone="neutral"
      />

      {/* Total Sessions — primary */}
      <StatsCard
        title="Total Sessions"
        value={String(sessions.length)}
        subtitle="All training sessions"
        icon={<Activity size={18} />}
        accentBg="bg-primary/10"
        accentText="text-primary"
        subtitleTone="neutral"
      />

    </section>
  );
}