import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Dumbbell,
  Play,
  Plus,
  X,
  Loader2,
  Calendar,
} from "lucide-react";

import Button from "@/components/ui/Button";
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
      const sessionDate = new Date(`${session.date}T00:00:00`);
      return (
        sessionDate >= today &&
        session.status !== "Completed" &&
        session.status !== "Rest"
      );
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const nextWorkout = upcomingSessions[0];

  const handleViewTrainingPlan = () => {
    const scheduleSection = document.getElementById("weekly-training-schedule");
    scheduleSection?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleBeginWorkout = async () => {
    const user = auth.currentUser;
    if (!user || !nextWorkout?.id) return;

    setLoading(true);
    try {
      await updateTrainingSessionStatus(user.uid, nextWorkout.id, "In Progress");
      setSessions((previous) =>
        previous.map((session) =>
          session.id === nextWorkout.id
            ? { ...session, status: "In Progress" }
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
    if (!user || !nextWorkout?.id) return;

    setLoading(true);
    try {
      await updateTrainingSessionStatus(user.uid, nextWorkout.id, "Completed");
      setSessions((previous) =>
        previous.map((session) =>
          session.id === nextWorkout.id
            ? { ...session, status: "Completed" }
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
      {/* Hero Container */}
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm shadow-slate-900/[0.04] transition-colors dark:shadow-black/20 sm:p-8">
        {/* Ambient training domain glow (Orange) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-500/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 right-1/4 h-48 w-48 rounded-full bg-amber-500/5 blur-2xl dark:bg-amber-500/10"
        />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Content Block */}
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
              <Dumbbell size={13} className="shrink-0" />
              <span>Training Center</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Train Smarter. Perform Better.
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Follow your scheduled training load, log active sessions, and maintain consistent intensity toward your performance goals.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsWorkoutOpen(true)}
                className="bg-orange-600 text-white hover:bg-orange-500 focus-visible:ring-orange-500/30"
              >
                <Play size={15} />
                <span>Start Workout</span>
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={handleViewTrainingPlan}
              >
                <Calendar size={15} className="text-muted-foreground" />
                <span>View Training Plan</span>
              </Button>
            </div>
          </div>

          {/* Quick Add Button */}
          <div className="shrink-0">
            <Button
              variant="outline"
              size="md"
              onClick={onAddTraining}
              className="w-full sm:w-auto"
            >
              <Plus size={16} />
              <span>Add Training Session</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Workout Modal */}
      {isWorkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl shadow-slate-950/10 dark:shadow-black/40">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-2.5 text-orange-600 dark:text-orange-400">
                  <Dumbbell size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {isWorkoutRunning ? "Workout in Progress" : "Start Workout"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isWorkoutRunning
                      ? "Session active. Complete when finished."
                      : "Your next scheduled session"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseWorkout}
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Workout Body */}
            {nextWorkout ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {nextWorkout.workout}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {nextWorkout.type}
                      </p>
                    </div>

                    {isWorkoutRunning && (
                      <div className="flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
                        Active
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-card p-2.5 border border-border/40">
                      <span className="text-muted-foreground">Date</span>
                      <p className="mt-0.5 font-medium text-foreground">
                        {nextWorkout.date}
                      </p>
                    </div>
                    <div className="rounded-lg bg-card p-2.5 border border-border/40">
                      <span className="text-muted-foreground">Time</span>
                      <p className="mt-0.5 font-medium text-foreground">
                        {nextWorkout.time}
                      </p>
                    </div>
                    <div className="rounded-lg bg-card p-2.5 border border-border/40">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock size={12} /> Duration
                      </span>
                      <p className="mt-0.5 font-medium text-foreground">
                        {nextWorkout.duration}
                      </p>
                    </div>
                    <div className="rounded-lg bg-card p-2.5 border border-border/40">
                      <span className="text-muted-foreground">Status</span>
                      <p
                        className={`mt-0.5 font-medium ${
                          isWorkoutRunning
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-foreground"
                        }`}
                      >
                        {isWorkoutRunning ? "In Progress" : "Scheduled"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isWorkoutRunning ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleCompleteWorkout}
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    <span>Complete Workout</span>
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleBeginWorkout}
                    disabled={loading}
                    className="w-full bg-orange-600 text-white hover:bg-orange-500"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Play size={16} />
                    )}
                    <span>Begin Workout</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-border p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <Dumbbell size={22} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  No Upcoming Workouts
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Schedule a session to start tracking your load.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsWorkoutOpen(false);
                    onAddTraining?.();
                  }}
                  className="mt-4"
                >
                  Add Training Session
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}