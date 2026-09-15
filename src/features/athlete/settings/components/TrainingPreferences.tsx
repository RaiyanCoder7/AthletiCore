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
  Users,
  ShieldAlert,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getUserProfile, updateUserProfile } from "@/services/firebase/users";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TrainingPreferences() {
  const [role, setRole] = useState<"athlete" | "coach" | "manager">("athlete");

  // Athlete or Shared states
  const [trainingLevel, setTrainingLevel] = useState("Advanced");
  const [primaryGoal, setPrimaryGoal] = useState("Performance");
  const [trainingDays, setTrainingDays] = useState<string[]>(["Mon", "Wed", "Fri", "Sat"]);
  const [sessionDuration, setSessionDuration] = useState(90);
  const [recoveryTracking, setRecoveryTracking] = useState(true);

  // Coach-specific state
  const [fatigueAlertThreshold, setFatigueAlertThreshold] = useState("Moderate (65% Readiness)");

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
          const userRole = (profile.role?.toLowerCase() || "athlete") as "athlete" | "coach" | "manager";
          setRole(userRole);

          if (profile.trainingLevel) setTrainingLevel(profile.trainingLevel);
          else if (userRole === "coach") setTrainingLevel("High Press & Transition");

          if (profile.primaryGoal) setPrimaryGoal(profile.primaryGoal);
          else if (userRole === "coach") setPrimaryGoal("Tactical Periodization");

          if (Array.isArray(profile.trainingDays)) setTrainingDays(profile.trainingDays);
          if (profile.sessionDuration) setSessionDuration(profile.sessionDuration);
          if (typeof profile.recoveryTracking === "boolean") setRecoveryTracking(profile.recoveryTracking);
          if (profile.fatigueAlertThreshold) setFatigueAlertThreshold(profile.fatigueAlertThreshold);
        }
      } catch (err) {
        console.error("Failed to load training preferences:", err);
        if (isMounted) setError("Unable to load preferences.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTrainingDay = (day: string) => {
    setTrainingDays((currentDays) =>
      currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day]
    );
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
      setError("Please select at least one scheduled day.");
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
        ...(role === "coach" ? { fatigueAlertThreshold } : {}),
      });

      setMessage(
        role === "coach"
          ? "Tactical training defaults saved successfully."
          : "Training preferences saved successfully."
      );
    } catch (err) {
      console.error("Failed to save preferences:", err);
      setError("Unable to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isCoach = role === "coach";

  if (loading) {
    return (
      <section>
        <SectionHeading
          title={isCoach ? "Tactical Training Defaults" : "Training Preferences"}
          subtitle="Loading your configurations..."
        />
        <DashboardCard className="mt-6 border-border bg-card p-6">
          <div className="h-48 w-full animate-pulse rounded-xl bg-muted/40" />
        </DashboardCard>
      </section>
    );
  }

  return (
    <section>
      <SectionHeading
        title={isCoach ? "Squad Training & Pitch Logistics" : "Training Preferences"}
        subtitle={
          isCoach
            ? "Configure standard squad session defaults, pitch allocations, and automated triage alerts"
            : "Customize your individual training experience and schedule"
        }
      />

      <DashboardCard className="relative mt-6 overflow-hidden border-border bg-card shadow-xs transition-colors">
        {/* Accent Strip: Emerald for Coach, Orange for Athlete */}
        <div
          className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${
            isCoach
              ? "from-emerald-600 via-teal-500 to-green-400"
              : "from-orange-500 via-amber-500 to-rose-500"
          }`}
          aria-hidden="true"
        />

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
            <CheckCircle2 className="mt-0.5 shrink-0" size={16} />
            <span>{message}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Tactical Philosophy (Coach) OR Training Level (Athlete) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isCoach ? "Core Tactical Philosophy" : "Training Level"}
            </label>

            <div className="relative">
              <Gauge
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />

              <select
                value={trainingLevel}
                onChange={(e) => setTrainingLevel(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-all hover:bg-muted/60 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
              >
                {isCoach ? (
                  <>
                    <option value="High Press & Transition" className="bg-card text-foreground">
                      High Press & Fast Transition
                    </option>
                    <option value="Positional Play & Possession" className="bg-card text-foreground">
                      Positional Play & Sustained Possession
                    </option>
                    <option value="Low Block & Direct Counter" className="bg-card text-foreground">
                      Low Block & Direct Counter
                    </option>
                    <option value="Physical Conditioning & Attrition" className="bg-card text-foreground">
                      Physical Conditioning & Attrition
                    </option>
                  </>
                ) : (
                  <>
                    <option value="Beginner" className="bg-card text-foreground">Beginner</option>
                    <option value="Intermediate" className="bg-card text-foreground">Intermediate</option>
                    <option value="Advanced" className="bg-card text-foreground">Advanced</option>
                    <option value="Professional" className="bg-card text-foreground">Professional</option>
                  </>
                )}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />
            </div>
          </div>

          {/* Microcycle Target (Coach) OR Primary Goal (Athlete) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isCoach ? "Microcycle Tactical Target" : "Primary Goal"}
            </label>

            <div className="relative">
              <Target
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />

              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-all hover:bg-muted/60 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
              >
                {isCoach ? (
                  <>
                    <option value="Match Sharpness & Velocity" className="bg-card text-foreground">
                      Match Sharpness & Velocity
                    </option>
                    <option value="Aerobic Base Foundation" className="bg-card text-foreground">
                      Aerobic Base Foundation
                    </option>
                    <option value="Injury Prevention & Recovery" className="bg-card text-foreground">
                      Injury Prevention & Deload
                    </option>
                    <option value="Set Piece & Spatial Organization" className="bg-card text-foreground">
                      Set Piece & Spatial Organization
                    </option>
                  </>
                ) : (
                  <>
                    <option value="Performance" className="bg-card text-foreground">Performance</option>
                    <option value="Strength" className="bg-card text-foreground">Strength</option>
                    <option value="Speed" className="bg-card text-foreground">Speed</option>
                    <option value="Endurance" className="bg-card text-foreground">Endurance</option>
                    <option value="Recovery" className="bg-card text-foreground">Recovery</option>
                  </>
                )}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />
            </div>
          </div>

          {/* Pitch Schedule / Training Days */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isCoach ? "Default Squad Pitch Days" : "Training Days"}
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
                        ? isCoach
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-orange-600 text-white shadow-xs"
                        : "border border-border bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Drill Duration */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isCoach ? "Standard Session Slot Duration" : "Preferred Session Duration"}
            </label>

            <div className="relative">
              <Clock
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />

              <select
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Number(e.target.value))}
                className="w-full appearance-none rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-all hover:bg-muted/60 focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
              >
                <option value={45} className="bg-card text-foreground">45 minutes (Walkthrough / Light)</option>
                <option value={60} className="bg-card text-foreground">60 minutes (Intensive / Tactical)</option>
                <option value={90} className="bg-card text-foreground">90 minutes (Standard Matchday Prep)</option>
                <option value={120} className="bg-card text-foreground">120 minutes (Full Squad Scrimmage)</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Recovery & Triage Banner */}
        <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div
                className={`rounded-xl border p-2.5 shrink-0 ${
                  isCoach
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                    : "border-rose-500/20 bg-rose-500/10 text-rose-500"
                }`}
              >
                {isCoach ? <ShieldAlert size={20} /> : <HeartPulse size={20} />}
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">
                  {isCoach ? "Automated Squad Fatigue Triage" : "Personal Recovery Tracking"}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {isCoach
                    ? "Automatically flag squad players in the Coach Dashboard when their readiness drops below safe thresholds."
                    : "Use biometric and readiness scores to calibrate your training load and avoid burnout."}
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={recoveryTracking}
              onClick={() => setRecoveryTracking((current) => !current)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                recoveryTracking
                  ? isCoach
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                  : "bg-muted-foreground/30"
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

        {/* Save Action */}
        <div className="mt-6 flex justify-end border-t border-border/50 pt-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-xs transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              isCoach
                ? "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500/30"
                : "bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-500/30"
            }`}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>{isCoach ? "Save Tactical Defaults" : "Save Preferences"}</span>
              </>
            )}
          </button>
        </div>
      </DashboardCard>
    </section>
  );
}