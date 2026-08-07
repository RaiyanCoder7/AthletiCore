import { useState } from "react";

import {
  Dumbbell,
  Gauge,
  Timer,
  Trophy,
  Target,
  Pencil,
  X,
  Save,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { updateGoalProgress } from "@/services/firebase/goals";

import type { Goal } from "@/services/firebase/goals";

interface ActiveGoalsProps {
  goals: Goal[];
  loading: boolean;
  onUpdated?: () => void;
}

function getGoalIcon(type: string) {
  switch (type) {
    case "Strength":
      return <Dumbbell size={20} />;

    case "Speed":
      return <Timer size={20} />;

    case "Endurance":
      return <Gauge size={20} />;

    case "Training":
      return <Trophy size={20} />;

    default:
      return <Target size={20} />;
  }
}

function getStatusStyle(progress: number) {
  if (progress >= 80) {
    return {
      label: "Excellent",
      className:
        "bg-emerald-500/10 text-emerald-400",
    };
  }

  if (progress >= 50) {
    return {
      label: "On Track",
      className:
        "bg-blue-500/10 text-blue-400",
    };
  }

  return {
    label: "Needs Attention",
    className:
      "bg-yellow-500/10 text-yellow-400",
  };
}

export default function ActiveGoals({
  goals,
  loading,
  onUpdated,
}: ActiveGoalsProps) {
  const [editingGoalId, setEditingGoalId] =
    useState<string | null>(null);

  const [currentValue, setCurrentValue] =
    useState("");

  const [progress, setProgress] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const activeGoals = goals.filter(
    (goal) => goal.status === "Active"
  );

  const openUpdateForm = (goal: Goal) => {
    setEditingGoalId(goal.id ?? null);
    setCurrentValue(goal.current);
    setProgress(String(goal.progress));
    setError("");
  };

  const closeUpdateForm = () => {
    setEditingGoalId(null);
    setCurrentValue("");
    setProgress("");
    setError("");
  };

  const handleUpdate = async (goal: Goal) => {
    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    if (!goal.id) {
      setError("Goal ID is missing.");
      return;
    }

    if (!currentValue.trim()) {
      setError("Please enter the current value.");
      return;
    }

    const progressNumber = Number(progress);

    if (
      progress === "" ||
      Number.isNaN(progressNumber) ||
      progressNumber < 0 ||
      progressNumber > 100
    ) {
      setError(
        "Progress must be between 0 and 100."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateGoalProgress(
        user.uid,
        goal.id,
        progressNumber,
        currentValue.trim()
      );

      closeUpdateForm();

      onUpdated?.();
    } catch (error) {
      console.error(
        "Failed to update goal:",
        error
      );

      setError(
        "Unable to update goal. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <SectionHeading
        title="Active Goals"
        subtitle="Track your current athletic targets"
      />

      {loading ? (
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-zinc-500">
            Loading your goals...
          </p>
        </div>
      ) : activeGoals.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-10 text-center">
          <Target
            size={32}
            className="mx-auto text-zinc-600"
          />

          <h3 className="mt-4 font-semibold text-white">
            No active goals
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            Create a new goal below to start tracking
            your progress.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {activeGoals.map((goal) => {
            const status = getStatusStyle(
              goal.progress
            );

            const isEditing =
              editingGoalId === goal.id;

            return (
              <DashboardCard key={goal.id}>
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                      {getGoalIcon(goal.type)}
                    </div>

                    <div>
                      <h3 className="font-semibold text-white">
                        {goal.name}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-400">
                        {goal.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Progress */}
                <div className="mt-7">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-zinc-400">
                      Progress
                    </span>

                    <span className="font-semibold text-white">
                      {goal.progress}%
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          goal.progress,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Current / Target */}
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500">
                      Current
                    </p>

                    <p className="mt-1 font-semibold text-white">
                      {goal.current}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-zinc-500">
                      Target
                    </p>

                    <p className="mt-1 font-semibold text-white">
                      {goal.target}
                    </p>
                  </div>
                </div>

                {/* Deadline */}
                <div className="mt-5 border-t border-zinc-800 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">
                      Deadline
                    </span>

                    <span className="font-medium text-zinc-300">
                      {new Date(
                        `${goal.deadline}T00:00:00`
                      ).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>

                {/* Update Button */}
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() =>
                      openUpdateForm(goal)
                    }
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    <Pencil size={16} />
                    Update Progress
                  </button>
                )}

                {/* Update Form */}
                {isEditing && (
                  <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-semibold text-white">
                        Update Goal Progress
                      </h4>

                      <button
                        type="button"
                        onClick={closeUpdateForm}
                        disabled={saving}
                        className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {error && (
                      <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Current Value */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                          Current Value
                        </label>

                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) =>
                            setCurrentValue(
                              e.target.value
                            )
                          }
                          placeholder="e.g. 12.4s"
                          disabled={saving}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500 disabled:opacity-50"
                        />
                      </div>

                      {/* Progress */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                          Progress (%)
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={progress}
                          onChange={(e) =>
                            setProgress(
                              e.target.value
                            )
                          }
                          disabled={saving}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-zinc-500">
                      Setting progress to 100% will
                      automatically complete this goal.
                    </p>

                    {/* Form Actions */}
                    <div className="mt-5 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeUpdateForm}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdate(goal)
                        }
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Save size={16} />
                        {saving
                          ? "Saving..."
                          : "Save Progress"}
                      </button>
                    </div>
                  </div>
                )}
              </DashboardCard>
            );
          })}
        </div>
      )}
    </section>
  );
}