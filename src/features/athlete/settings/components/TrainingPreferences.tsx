import { useEffect, useState } from "react";
import {
  Dumbbell,
  Gauge,
  HeartPulse,
  Target,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import {
  getUserProfile,
  updateUserProfile,
} from "@/services/firebase/users";

const DAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export default function TrainingPreferences() {
  const [trainingLevel, setTrainingLevel] =
    useState("Advanced");

  const [primaryGoal, setPrimaryGoal] =
    useState("Performance");

  const [trainingDays, setTrainingDays] =
    useState<string[]>([
      "Mon",
      "Wed",
      "Fri",
      "Sat",
    ]);

  const [sessionDuration, setSessionDuration] =
    useState(60);

  const [recoveryTracking, setRecoveryTracking] =
    useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* -----------------------------
     Load Preferences
  ----------------------------- */

  useEffect(() => {
    const loadPreferences = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);

        if (profile) {
          if (profile.trainingLevel) {
            setTrainingLevel(profile.trainingLevel);
          }

          if (profile.primaryGoal) {
            setPrimaryGoal(profile.primaryGoal);
          }

          if (Array.isArray(profile.trainingDays)) {
            setTrainingDays(profile.trainingDays);
          }

          if (profile.sessionDuration) {
            setSessionDuration(profile.sessionDuration);
          }

          if (
            typeof profile.recoveryTracking ===
            "boolean"
          ) {
            setRecoveryTracking(
              profile.recoveryTracking
            );
          }
        }
      } catch (error) {
        console.error(
          "Failed to load training preferences:",
          error
        );

        setError(
          "Unable to load your training preferences."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  /* -----------------------------
     Toggle Training Day
  ----------------------------- */

  const toggleTrainingDay = (day: string) => {
    setTrainingDays((currentDays) => {
      if (currentDays.includes(day)) {
        return currentDays.filter(
          (currentDay) => currentDay !== day
        );
      }

      return [...currentDays, day];
    });
  };

  /* -----------------------------
     Save Preferences
  ----------------------------- */

  const handleSave = async () => {
    const user = auth.currentUser;

    if (!user) {
      setError(
        "You must be logged in to save preferences."
      );
      return;
    }

    if (trainingDays.length === 0) {
      setError(
        "Please select at least one training day."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await updateUserProfile(user.uid, {
        trainingLevel,
        primaryGoal,
        trainingDays,
        sessionDuration,
        recoveryTracking,
      });

      setMessage(
        "Training preferences saved successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save training preferences:",
        error
      );

      setError(
        "Unable to save preferences. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section>
        <SectionHeading
          title="Training Preferences"
          subtitle="Customize your training experience"
        />

        <DashboardCard className="mt-6">
          <div className="py-8 text-center text-sm text-zinc-500">
            Loading your preferences...
          </div>
        </DashboardCard>
      </section>
    );
  }

  return (
    <section>
      <SectionHeading
        title="Training Preferences"
        subtitle="Customize your training experience"
      />

      <DashboardCard className="mt-6">
        {/* Messages */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {message}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Training Level */}

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Training Level
            </label>

            <div className="relative">
              <Gauge
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <select
                value={trainingLevel}
                onChange={(e) =>
                  setTrainingLevel(e.target.value)
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Professional</option>
              </select>
            </div>
          </div>

          {/* Primary Goal */}

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Primary Goal
            </label>

            <div className="relative">
              <Target
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <select
                value={primaryGoal}
                onChange={(e) =>
                  setPrimaryGoal(e.target.value)
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500"
              >
                <option>Performance</option>
                <option>Strength</option>
                <option>Speed</option>
                <option>Endurance</option>
                <option>Recovery</option>
              </select>
            </div>
          </div>

          {/* Training Days */}

          <div>
            <label className="mb-3 block text-sm font-medium text-zinc-300">
              Training Days
            </label>

            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const selected =
                  trainingDays.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      toggleTrainingDay(day)
                    }
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      selected
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session Duration */}

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Preferred Session Duration
            </label>

            <div className="relative">
              <Dumbbell
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <select
                value={sessionDuration}
                onChange={(e) =>
                  setSessionDuration(
                    Number(e.target.value)
                  )
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500"
              >
                <option value={30}>
                  30 minutes
                </option>

                <option value={45}>
                  45 minutes
                </option>

                <option value={60}>
                  60 minutes
                </option>

                <option value={90}>
                  90 minutes
                </option>

                <option value={120}>
                  120 minutes
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Recovery Preference */}

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-800/30 p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <HeartPulse size={20} />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-white">
                Recovery Tracking
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Use recovery data to help adjust your
                training recommendations.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setRecoveryTracking(
                  (current) => !current
                )
              }
              aria-label="Toggle recovery tracking"
              className={`relative h-6 w-11 rounded-full transition ${
                recoveryTracking
                  ? "bg-blue-600"
                  : "bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  recoveryTracking
                    ? "right-1"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save */}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Preferences"}
          </button>
        </div>
      </DashboardCard>
    </section>
  );
}