import { useEffect, useState } from "react";
import {
  Dumbbell,
  Play,
  Plus,
  X,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { auth } from "@/services/firebase/firebase";
import {
  getTrainingSessions,
  updateTrainingSessionStatus,
} from "@/services/firebase/training";

import type { TrainingSession } from "@/services/firebase/training";

interface TrainingHeroProps {
  onAddTraining?: () => void;
  onWorkoutUpdated?: () => void;
}

export default function TrainingHero({
  onAddTraining,
  onWorkoutUpdated,
}: TrainingHeroProps) {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [isWorkoutOpen, setIsWorkoutOpen] = useState(false);
  const [isWorkoutRunning, setIsWorkoutRunning] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadSessions = async () => {
    const user = auth.currentUser;

    if (!user) return;

    try {
      const data = await getTrainingSessions(user.uid);
      setSessions(data);
    } catch (error) {
      console.error("Failed to load training sessions:", error);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingSessions = sessions
    .filter((session) => {
      const sessionDate = new Date(
        `${session.date}T00:00:00`
      );

      return (
        sessionDate >= today &&
        session.status !== "Completed" &&
        session.status !== "Rest"
      );
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const nextWorkout = upcomingSessions[0];

  const handleViewTrainingPlan = () => {
    const scheduleSection = document.getElementById(
      "weekly-training-schedule"
    );

    scheduleSection?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleBeginWorkout = async () => {
    const user = auth.currentUser;

    if (!user || !nextWorkout?.id) {
      return;
    }

    setLoading(true);

    try {
      await updateTrainingSessionStatus(
        user.uid,
        nextWorkout.id,
        "In Progress"
      );

      setSessions((previous) =>
        previous.map((session) =>
          session.id === nextWorkout.id
            ? {
                ...session,
                status: "In Progress",
              }
            : session
        )
      );

      setIsWorkoutRunning(true);

      onWorkoutUpdated?.();
    } catch (error) {
      console.error("Failed to start workout:", error);
      alert("Failed to start workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWorkout = async () => {
    const user = auth.currentUser;

    if (!user || !nextWorkout?.id) {
      return;
    }

    setLoading(true);

    try {
      await updateTrainingSessionStatus(
        user.uid,
        nextWorkout.id,
        "Completed"
      );

      setSessions((previous) =>
        previous.map((session) =>
          session.id === nextWorkout.id
            ? {
                ...session,
                status: "Completed",
              }
            : session
        )
      );

      setIsWorkoutRunning(false);
      setIsWorkoutOpen(false);

      onWorkoutUpdated?.();

      await loadSessions();
    } catch (error) {
      console.error("Failed to complete workout:", error);
      alert("Failed to complete workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseWorkout = () => {
    if (!loading) {
      setIsWorkoutOpen(false);
      setIsWorkoutRunning(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 text-white">

        {/* Background Glow */}
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        {/* Add Training Session */}
        <button
          type="button"
          onClick={onAddTraining}
          className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
        >
          <Plus size={18} />
          Add Training Session
        </button>

        <div className="relative">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
            <Dumbbell size={16} />
            Training Center
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Train Smarter.
            <br />
            Perform Better.
          </h1>

          {/* Description */}
          <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">
            Follow your training plan, track every workout,
            monitor your intensity and stay consistent with
            your performance goals.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-4">

            {/* Start Workout */}
            <button
              type="button"
              onClick={() => setIsWorkoutOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-blue-700 transition hover:scale-105"
            >
              <Play size={18} />
              Start Workout
            </button>

            {/* View Training Plan */}
            <button
              type="button"
              onClick={handleViewTrainingPlan}
              className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              View Training Plan
            </button>

          </div>
        </div>
      </section>

      {/* Workout Modal */}
      {isWorkoutOpen && (
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
                    {isWorkoutRunning
                      ? "Workout in Progress"
                      : "Start Workout"}
                  </h2>

                  <p className="text-sm text-zinc-500">
                    {isWorkoutRunning
                      ? "Keep going and complete your session"
                      : "Your next scheduled workout"}
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={handleCloseWorkout}
                className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

            {/* Workout Content */}
            {nextWorkout ? (
              <div className="mt-6">

                {/* Workout Details */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

                  <div className="flex items-center justify-between">

                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {nextWorkout.workout}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        {nextWorkout.type}
                      </p>
                    </div>

                    {isWorkoutRunning && (
                      <div className="flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                        In Progress
                      </div>
                    )}

                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-zinc-800 p-3">
                      <p className="text-xs text-zinc-500">
                        Date
                      </p>

                      <p className="mt-1 font-medium text-white">
                        {nextWorkout.date}
                      </p>
                    </div>

                    <div className="rounded-xl bg-zinc-800 p-3">
                      <p className="text-xs text-zinc-500">
                        Time
                      </p>

                      <p className="mt-1 font-medium text-white">
                        {nextWorkout.time}
                      </p>
                    </div>

                    <div className="rounded-xl bg-zinc-800 p-3">
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Clock size={13} />
                        Duration
                      </div>

                      <p className="mt-1 font-medium text-white">
                        {nextWorkout.duration}
                      </p>
                    </div>

                    <div className="rounded-xl bg-zinc-800 p-3">
                      <p className="text-xs text-zinc-500">
                        Status
                      </p>

                      <p
                        className={`mt-1 font-medium ${
                          isWorkoutRunning
                            ? "text-blue-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {isWorkoutRunning
                          ? "In Progress"
                          : "Ready"}
                      </p>
                    </div>

                  </div>
                </div>

                {/* Running State */}
                {isWorkoutRunning ? (
                  <div className="mt-5">

                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 text-center">

                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                        <Dumbbell size={28} />
                      </div>

                      <h3 className="mt-4 text-lg font-semibold text-white">
                        Workout Started
                      </h3>

                      <p className="mt-2 text-sm text-zinc-500">
                        Complete your workout when you are finished.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={handleCompleteWorkout}
                      disabled={loading}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 size={18} />

                      {loading
                        ? "Saving..."
                        : "Complete Workout"}
                    </button>

                  </div>
                ) : (
                  /* Ready State */
                  <button
                    type="button"
                    onClick={handleBeginWorkout}
                    disabled={loading}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Play size={18} />

                    {loading
                      ? "Starting..."
                      : "Begin Workout"}
                  </button>
                )}

              </div>
            ) : (
              /* No Workout */
              <div className="mt-6 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-8 text-center">

                <Dumbbell
                  size={32}
                  className="mx-auto text-zinc-600"
                />

                <h3 className="mt-4 font-semibold text-white">
                  No Upcoming Workout
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  Add a training session to start your next workout.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setIsWorkoutOpen(false);
                    onAddTraining?.();
                  }}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Add Training Session
                </button>

              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}