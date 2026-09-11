import {
  Target,
  Trophy,
  TrendingUp,
  Clock,
} from "lucide-react";

import StatsCard from "@/features/athlete/dashboard/components/StatsCard";

import type { Goal } from "@/services/firebase/goals";

interface GoalStatsGridProps {
  goals: Goal[];
  loading: boolean;
}

export default function GoalStatsGrid({
  goals,
  loading,
}: GoalStatsGridProps) {
  const activeGoals = goals.filter(
    (goal) => goal.status === "Active"
  );

  const completedGoals = goals.filter(
    (goal) => goal.status === "Completed"
  );

  const averageProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce(
            (total, goal) => total + goal.progress,
            0
          ) / goals.length
        )
      : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(
    oneWeekFromNow.getDate() + 7
  );
  oneWeekFromNow.setHours(23, 59, 59, 999);

  const dueThisWeek = activeGoals.filter((goal) => {
    const deadline = new Date(
      `${goal.deadline}T00:00:00`
    );

    return (
      deadline >= today &&
      deadline <= oneWeekFromNow
    );
  }).length;

  const goalsOnTrack = activeGoals.filter(
    (goal) => goal.progress >= 50
  ).length;

  const needsAttention =
    activeGoals.length - goalsOnTrack;

  const completionRate = goals.length
    ? Math.round(
        (completedGoals.length / goals.length) * 100
      )
    : 0;

  const onTrackRate = activeGoals.length
    ? Math.round(
        (goalsOnTrack / activeGoals.length) * 100
      )
    : 0;

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {/* Active Goals — primary */}
      <StatsCard
        title="Active Goals"
        value={
          loading ? "..." : String(activeGoals.length)
        }
        subtitle={
          loading
            ? "Loading..."
            : `${dueThisWeek} due this week`
        }
        icon={<Target size={18} />}
        accentBg="bg-primary/10"
        accentText="text-primary"
        subtitleTone="neutral"
      />

      {/* Completed Goals — emerald, ring (completion rate) */}
      <StatsCard
        title="Completed Goals"
        value={
          loading
            ? "..."
            : String(completedGoals.length)
        }
        subtitle="Successfully completed"
        icon={<Trophy size={18} />}
        accentBg="bg-emerald-500/10"
        accentText="text-emerald-500"
        indicator={{
          type: "ring",
          percent: completionRate,
        }}
      />

      {/* Average Progress — indigo, ring (the value itself) */}
      <StatsCard
        title="Average Progress"
        value={
          loading ? "..." : `${averageProgress}%`
        }
        subtitle="Across all goals"
        icon={<TrendingUp size={18} />}
        accentBg="bg-indigo-500/10"
        accentText="text-indigo-500"
        indicator={{
          type: "ring",
          percent: averageProgress,
        }}
      />

      {/* Goals On Track — orange, bar (on-track rate) */}
      <StatsCard
        title="Goals On Track"
        value={
          loading ? "..." : String(goalsOnTrack)
        }
        subtitle={
          loading
            ? "Loading..."
            : `${needsAttention} needs attention`
        }
        icon={<Clock size={18} />}
        accentBg="bg-orange-500/10"
        accentText="text-orange-500"
        indicator={{
          type: "bar",
          percent: onTrackRate,
        }}
        subtitleTone="neutral"
      />

    </section>
  );
}