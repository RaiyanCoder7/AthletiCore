import { useCallback, useEffect, useState } from "react";

import GoalsHero from "./components/GoalsHero";
import GoalStatsGrid from "./components/GoalStatsGrid";
import ActiveGoals from "./components/ActiveGoals";
import CompletedGoals from "./components/CompletedGoals";
import CreateGoalCard from "./components/CreateGoalCard";

import { auth } from "@/services/firebase/firebase";
import { getGoals } from "@/services/firebase/goals";
import type { Goal } from "@/services/firebase/goals";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGoals = useCallback(async () => {
    const user = auth.currentUser;

    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getGoals(user.uid);

      setGoals(data);
    } catch (error) {
      console.error("Failed to load goals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  return (
    <div className="space-y-8">
      <GoalsHero goals={goals} />

      <GoalStatsGrid
        goals={goals}
        loading={loading}
      />

      <ActiveGoals
        goals={goals}
        loading={loading}
        onUpdated={loadGoals}
      />

      <CompletedGoals
        goals={goals}
        loading={loading}
      />

      <div id="create-goal">
        <CreateGoalCard
          onCreated={loadGoals}
        />
      </div>
    </div>
  );
}