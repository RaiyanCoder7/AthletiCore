import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Gauge,
  HeartPulse,
  Loader2,
  Save,
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
  const [trainingLevel, setTrainingLevel] = useState("Advanced");
  const [primaryGoal, setPrimaryGoal] = useState("Performance");
  const [trainingDays, setTrainingDays] = useState<string[]>([
    "Mon",
    "Wed",
    "Fri",
    "Sat",
  ]);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [recoveryTracking, setRecoveryTracking] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* -----------------------------
      Load Preferences
  ----------------------------- */

  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      const user = auth.currentUser;

      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);

        if (!isMounted) return;

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

          if (typeof profile.recoveryTracking === "boolean") {
            setRecoveryTracking(profile.recoveryTracking);
          }
        }
      } catch (err) {
        console.error("Failed to load training preferences:", err);
        if (isMounted) {
          setError("Unable to load your training preferences.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, []);

  /* -----------------------------
      Toggle Training Day
  ----------------------------- */

  const toggleTrainingDay = (day: string) => {
    setTrainingDays((currentDays) => {
      if (currentDays.includes(day)) {
        return currentDays.filter((currentDay) => currentDay !== day);
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
      setError("You must be logged in to save preferences.");
      return;
    }

    if (trainingDays.length === 0) {
      setError("Please select at least one training day.");
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

      setMessage("Training preferences saved successfully.");
    } catch (err) {
      console.error("Failed to save training preferences:", err);
      setError("Unable to save preferences. Please try again.");
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

        <DashboardCard className="relative mt-6 overflow-hidden border-border bg-card shadow-xs transition-colors">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500" aria-hidden="true" />
          
          <div className="space-y-6 py-2">
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="h-3.5 w-24 animate-pulse rounded bg-muted/60" />
                  <div className="h-10 w-full animate-pulse rounded-xl bg-muted/40" />
                </div>
              ))}
            </div>
            <div className="h-20 w-full animate-pulse rounded-2xl bg-muted/40" />
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

      <DashboardCard className="relative mt-6 overflow-hidden border-border bg-card shadow-xs transition-colors">
        {/* Top Accent Strip (Training to Recovery domain: Orange-Amber-Rose) */}
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500"
          aria-hidden="true"
        />

        {/* Error Feedback */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Feedback */}
        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="mt-0.5 shrink-0" size={16} />
            <span>{message}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Training Level */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Training Level
            </label>

            <div className="relative">
              <Gauge
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />

              <select
                value={trainingLevel}
                onChange={(e) => setTrainingLevel(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-all hover:bg-muted/60 focus:border-orange-500 focus:bg-background focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="Beginner" className="bg-card text-foreground">Beginner</option>
                <option value="Intermediate" className="bg-card text-foreground">Intermediate</option>
                <option value="Advanced" className="bg-card text-foreground">Advanced</option>
                <option value="Professional" className="bg-card text-foreground">Professional</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />
            </div>
          </div>

          {/* Primary Goal */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Primary Goal
            </label>

            <div className="relative">
              <Target
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />

              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-all hover:bg-muted/60 focus:border-orange-500 focus:bg-background focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="Performance" className="bg-card text-foreground">Performance</option>
                <option value="Strength" className="bg-card text-foreground">Strength</option>
                <option value="Speed" className="bg-card text-foreground">Speed</option>
                <option value="Endurance" className="bg-card text-foreground">Endurance</option>
                <option value="Recovery" className="bg-card text-foreground">Recovery</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />
            </div>
          </div>

          {/* Training Days */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Training Days
              </label>
              <span className="text-[11px] font-medium text-muted-foreground">
                {trainingDays.length} {trainingDays.length === 1 ? "day" : "days"} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {DAYS.map((day) => {
                const selected = trainingDays.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleTrainingDay(day)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide transition-all ${
                      selected
                        ? "bg-orange-600 text-white shadow-xs dark:bg-orange-500 dark:text-zinc-950"
                        : "border border-border bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session Duration */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Preferred Session Duration
            </label>

            <div className="relative">
              <Clock
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />

              <select
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Number(e.target.value))}
                className="w-full appearance-none rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-all hover:bg-muted/60 focus:border-orange-500 focus:bg-background focus:ring-2 focus:ring-orange-500/20"
              >
                <option value={30} className="bg-card text-foreground">30 minutes</option>
                <option value={45} className="bg-card text-foreground">45 minutes</option>
                <option value={60} className="bg-card text-foreground">60 minutes</option>
                <option value={90} className="bg-card text-foreground">90 minutes</option>
                <option value={120} className="bg-card text-foreground">120 minutes</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />
            </div>
          </div>
        </div>

        {/* Recovery Preference Tile */}
        <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-5 transition-colors">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-rose-600 dark:text-rose-400 shrink-0">
                <HeartPulse size={20} />
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">
                  Recovery Tracking
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  Use biometric and readiness scores to calibrate your training load and avoid burnout.
                </p>
              </div>
            </div>

            {/* Accessible Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={recoveryTracking}
              onClick={() => setRecoveryTracking((current) => !current)}
              aria-label="Toggle recovery tracking"
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 ${
                recoveryTracking ? "bg-rose-500" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                  recoveryTracking ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Actions */}
        <div className="mt-6 flex justify-end border-t border-border/50 pt-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-zinc-950"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </DashboardCard>
    </section>
  );
}