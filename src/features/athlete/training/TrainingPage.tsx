import { useState } from "react";

import TrainingHero from "./components/TrainingHero";
import TrainingStatsGrid from "./components/TrainingStatsGrid";
import WeeklyTrainingSchedule from "./components/WeeklyTrainingSchedule";
import WorkoutSessionCards from "./components/WorkoutSessionCards";
import TrainingProgressChart from "./components/TrainingProgressChart";
import TrainingIntensityCard from "./components/TrainingIntensityCard";
import TrainingGoalsCard from "./components/TrainingGoalsCard";
import AddTrainingSession from "./components/AddTrainingSession";

export default function TrainingPage() {
  const [trainingVersion, setTrainingVersion] = useState(0);
  const [isAddTrainingOpen, setIsAddTrainingOpen] = useState(false);

  const refreshTrainingData = () => {
    setTrainingVersion((version) => version + 1);
  };

  return (
    <div className="space-y-10">

      {/* Hero */}
      <TrainingHero
        onAddTraining={() => setIsAddTrainingOpen(true)}
        onWorkoutUpdated={refreshTrainingData}
      />

      {/* Add Training Session */}
      <AddTrainingSession
        isOpen={isAddTrainingOpen}
        onClose={() => setIsAddTrainingOpen(false)}
        onAdded={refreshTrainingData}
      />

      {/* Overview */}
      <section key={`stats-${trainingVersion}`}>
        <TrainingStatsGrid />
      </section>

      {/* Weekly Plan */}
      <section
        id="weekly-training-schedule"
        key={`schedule-${trainingVersion}`}
      >
        <WeeklyTrainingSchedule />
      </section>

      {/* Workouts */}
      <section key={`workouts-${trainingVersion}`}>
        <WorkoutSessionCards />
      </section>

      {/* Performance */}
      <section className="grid gap-6 xl:grid-cols-2">
        <TrainingProgressChart />
        <TrainingIntensityCard />
      </section>

      {/* Goals */}
      <section>
        <TrainingGoalsCard />
      </section>

    </div>
  );
}