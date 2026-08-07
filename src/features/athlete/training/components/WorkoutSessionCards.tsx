import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Dumbbell,
  X,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import {
  getTrainingSessions,
  updateTrainingSessionStatus,
} from "@/services/firebase/training";

import type { TrainingSession } from "@/services/firebase/training";

export default function WorkoutSessionCards() {
  const [workouts, setWorkouts] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedWorkout, setSelectedWorkout] =
    useState<TrainingSession | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  /* -----------------------------
     Load Workouts
  ----------------------------- */

  const loadWorkouts = async () => {
    const user = auth.currentUser;

    if (!user) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    try {
      const sessions = await getTrainingSessions(user.uid);

      setWorkouts(sessions);
    } catch (error) {
      console.error(
        "Failed to load workout sessions:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  /* -----------------------------
     Start Workout
  ----------------------------- */

  const handleStartWorkout = async () => {
    const user = auth.currentUser;

    if (!user || !selectedWorkout?.id) {
      return;
    }

    setActionLoading(true);

    try {
      await updateTrainingSessionStatus(
        user.uid,
        selectedWorkout.id,
        "In Progress"
      );

      // Reload from Firebase
      await loadWorkouts();

      // Update currently selected workout
      setSelectedWorkout((current) =>
        current
          ? {
              ...current,
              status: "In Progress",
            }
          : null
      );
    } catch (error) {
      console.error(
        "Failed to start workout:",
        error
      );

      alert(
        "Failed to start workout. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* -----------------------------
     Complete Workout
  ----------------------------- */

  const handleCompleteWorkout = async () => {
    const user = auth.currentUser;

    if (!user || !selectedWorkout?.id) {
      return;
    }

    setActionLoading(true);

    try {
      await updateTrainingSessionStatus(
        user.uid,
        selectedWorkout.id,
        "Completed"
      );

      // Reload from Firebase
      await loadWorkouts();

      // Update currently selected workout
      setSelectedWorkout((current) =>
        current
          ? {
              ...current,
              status: "Completed",
            }
          : null
      );
    } catch (error) {
      console.error(
        "Failed to complete workout:",
        error
      );

      alert(
        "Failed to complete workout. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* -----------------------------
     Loading State
  ----------------------------- */

  if (loading) {
    return (
      <section>
        <SectionHeading
          title="Workout Sessions"
          subtitle="Recent and active training sessions"
        />

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-zinc-400">
            Loading workout sessions...
          </p>
        </div>
      </section>
    );
  }

  /* -----------------------------
     Empty State
  ----------------------------- */

  if (workouts.length === 0) {
    return (
      <section>
        <SectionHeading
          title="Workout Sessions"
          subtitle="Recent and active training sessions"
        />

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <Dumbbell
            size={32}
            className="mx-auto text-zinc-600"
          />

          <p className="mt-4 font-medium text-white">
            No workout sessions yet
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Add a training session to see it here.
          </p>
        </div>
      </section>
    );
  }

  /* -----------------------------
     Workout Cards
  ----------------------------- */

  return (
    <>
      <section>
        <SectionHeading
          title="Workout Sessions"
          subtitle="Recent and active training sessions"
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {workouts.map((workout) => {
            const isCompleted =
              workout.status === "Completed";

            const isInProgress =
              workout.status === "In Progress";

            const progress = isCompleted
              ? 100
              : isInProgress
                ? 50
                : 0;

            return (
              <DashboardCard
                key={workout.id}
                className="group"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400">
                    <Dumbbell size={22} />
                  </div>

                  {isCompleted ? (
                    <CheckCircle2
                      size={20}
                      className="text-emerald-400"
                    />
                  ) : (
                    <Activity
                      size={20}
                      className={
                        isInProgress
                          ? "animate-pulse text-blue-400"
                          : "text-yellow-400"
                      }
                    />
                  )}
                </div>

                {/* Title */}
                <h3 className="mt-6 text-lg font-semibold text-white">
                  {workout.workout}
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  {workout.type}
                </p>

                {/* Details */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {/* Duration */}
                  <div className="rounded-xl bg-zinc-800/60 p-3">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Clock size={14} />

                      <span className="text-xs">
                        Duration
                      </span>
                    </div>

                    <p className="mt-1 font-medium text-white">
                      {workout.duration}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="rounded-xl bg-zinc-800/60 p-3">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Clock size={14} />

                      <span className="text-xs">
                        Time
                      </span>
                    </div>

                    <p className="mt-1 font-medium text-white">
                      {workout.time}
                    </p>
                  </div>

                  {/* Type */}
                  <div className="rounded-xl bg-zinc-800/60 p-3">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Dumbbell size={14} />

                      <span className="text-xs">
                        Type
                      </span>
                    </div>

                    <p className="mt-1 font-medium text-white">
                      {workout.type}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="rounded-xl bg-zinc-800/60 p-3">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Activity size={14} />

                      <span className="text-xs">
                        Status
                      </span>
                    </div>

                    <p
                      className={`mt-1 font-medium ${
                        isCompleted
                          ? "text-emerald-400"
                          : isInProgress
                            ? "text-blue-400"
                            : "text-yellow-400"
                      }`}
                    >
                      {workout.status}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-6">
                  <div className="mb-2 flex justify-between">
                    <span className="text-xs text-zinc-500">
                      Progress
                    </span>

                    <span className="text-xs font-medium text-zinc-300">
                      {progress}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? "bg-emerald-500"
                          : "bg-blue-500"
                      }`}
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Action */}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedWorkout(workout)
                  }
                  className={`mt-6 w-full rounded-xl py-3 text-sm font-semibold transition ${
                    isCompleted
                      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                      : "bg-blue-600 text-white hover:bg-blue-500"
                  }`}
                >
                  {isCompleted
                    ? "View Workout"
                    : isInProgress
                      ? "Continue Workout"
                      : "Start Workout"}
                </button>
              </DashboardCard>
            );
          })}
        </div>
      </section>

      {/* Workout Modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <Dumbbell size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedWorkout.workout}
                  </h2>

                  <p className="text-sm text-zinc-500">
                    {selectedWorkout.type}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedWorkout(null)
                }
                className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Details */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-zinc-900 p-4">
                <p className="text-xs text-zinc-500">
                  Date
                </p>

                <p className="mt-1 font-medium text-white">
                  {selectedWorkout.date}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-900 p-4">
                <p className="text-xs text-zinc-500">
                  Time
                </p>

                <p className="mt-1 font-medium text-white">
                  {selectedWorkout.time}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-900 p-4">
                <p className="text-xs text-zinc-500">
                  Duration
                </p>

                <p className="mt-1 font-medium text-white">
                  {selectedWorkout.duration}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-900 p-4">
                <p className="text-xs text-zinc-500">
                  Status
                </p>

                <p
                  className={`mt-1 font-medium ${
                    selectedWorkout.status ===
                    "Completed"
                      ? "text-emerald-400"
                      : selectedWorkout.status ===
                        "In Progress"
                        ? "text-blue-400"
                        : "text-yellow-400"
                  }`}
                >
                  {selectedWorkout.status}
                </p>
              </div>
            </div>

            {/* Completed */}
            {selectedWorkout.status ===
            "Completed" ? (
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
                <CheckCircle2
                  size={32}
                  className="mx-auto text-emerald-400"
                />

                <h3 className="mt-3 font-semibold text-white">
                  Workout Completed
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Great job! This training session has
                  been completed.
                </p>
              </div>
            ) : (
              <div className="mt-6">
                {selectedWorkout.status ===
                "In Progress" ? (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleCompleteWorkout}
                    className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading
                      ? "Saving..."
                      : "Complete Workout"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleStartWorkout}
                    className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading
                      ? "Starting..."
                      : "Begin Workout"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}