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

  const stats = [
    {
      title: "Active Goals",
      value: loading
        ? "..."
        : String(activeGoals.length),
      subtitle: loading
        ? "Loading..."
        : `${dueThisWeek} due this week`,
      icon: <Target size={22} />,
    },
    {
      title: "Completed Goals",
      value: loading
        ? "..."
        : String(completedGoals.length),
      subtitle: "Successfully completed",
      icon: <Trophy size={22} />,
    },
    {
      title: "Average Progress",
      value: loading
        ? "..."
        : `${averageProgress}%`,
      subtitle: "Across all goals",
      icon: <TrendingUp size={22} />,
    },
    {
      title: "Goals On Track",
      value: loading
        ? "..."
        : String(goalsOnTrack),
      subtitle: loading
        ? "Loading..."
        : `${needsAttention} needs attention`,
      icon: <Clock size={22} />,
    },
  ];

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
        />
      ))}
    </section>
  );
}