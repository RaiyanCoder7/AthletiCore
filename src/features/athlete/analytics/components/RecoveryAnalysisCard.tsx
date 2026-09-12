import { useEffect, useState } from "react";
import {
  Moon,
  Droplets,
  BatteryMedium,
  HeartPulse,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";

import { auth } from "@/services/firebase/firebase";
import {
  addRecoveryEntry,
  getTodayRecovery,
} from "@/services/firebase/recovery";

export default function RecoveryAnalysisCard() {
  const [sleepQuality, setSleepQuality] = useState(70);
  const [hydration, setHydration] = useState(70);
  const [energyLevel, setEnergyLevel] = useState(70);
  const [muscleRecovery, setMuscleRecovery] = useState(70);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const recoveryScore = Math.round(
    (sleepQuality + hydration + energyLevel + muscleRecovery) / 4
  );

  useEffect(() => {
    const loadTodayRecovery = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const recovery = await getTodayRecovery(user.uid);

        if (recovery) {
          setSleepQuality(recovery.sleepQuality);
          setHydration(recovery.hydration);
          setEnergyLevel(recovery.energyLevel);
          setMuscleRecovery(recovery.muscleRecovery);
          setSaved(true);
        }
      } catch (err) {
        console.error("Failed to load recovery data:", err);
        setError("Unable to load today's recovery data.");
      } finally {
        setLoading(false);
      }
    };

    loadTodayRecovery();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in to save recovery data.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const today = new Date();
      const date = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      await addRecoveryEntry(user.uid, {
        date,
        sleepQuality,
        hydration,
        energyLevel,
        muscleRecovery,
        recoveryScore,
      });

      setSaved(true);
    } catch (err) {
      console.error("Failed to save recovery data:", err);
      setError("Unable to save recovery data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getRecoveryLabel = () => {
    if (recoveryScore >= 80) return "Optimal Readiness";
    if (recoveryScore >= 60) return "Good Recovery";
    if (recoveryScore >= 40) return "Moderate Fatigue";
    return "High Strain / Rest Needed";
  };

  // SVG Gauge calculations
  const ringSize = 132;
  const strokeWidth = 8;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (recoveryScore / 100) * circumference;

  if (loading) {
    return (
      <DashboardCard accent="rose" hover={false}>
        <SectionHeading
          title="Recovery Analysis"
          subtitle="Today's biometric readiness telemetry"
        />
        <div className="mt-8 flex h-64 items-center justify-center">
          <p className="text-xs text-muted-foreground animate-pulse">
            Calibrating recovery metrics...
          </p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard accent="rose" hover={false}>
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          title="Recovery Analysis"
          subtitle="Today's biometric readiness telemetry"
        />

        {saved && (
          <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 sm:self-auto">
            <ShieldCheck size={12} />
            <span>Synced for Today</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Sliders Area */}
        <div className="space-y-4">
          <RecoveryMetric
            icon={<Moon size={16} />}
            label="Sleep Quality"
            value={sleepQuality}
            onChange={setSleepQuality}
          />

          <RecoveryMetric
            icon={<Droplets size={16} />}
            label="Hydration"
            value={hydration}
            onChange={setHydration}
          />

          <RecoveryMetric
            icon={<BatteryMedium size={16} />}
            label="Energy Level"
            value={energyLevel}
            onChange={setEnergyLevel}
          />

          <RecoveryMetric
            icon={<HeartPulse size={16} />}
            label="Muscle Recovery"
            value={muscleRecovery}
            onChange={setMuscleRecovery}
          />

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500/30"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Recovery...</span>
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Update Recovery</span>
                </>
              ) : (
                <span>Save Recovery Score</span>
              )}
            </Button>
          </div>
        </div>

        {/* Readiness Gauge Widget */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-muted/30 p-6 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Overall Readiness
          </p>

          {/* Smooth Circular Gauge */}
          <div className="relative mt-4 flex items-center justify-center">
            <svg
              width={ringSize}
              height={ringSize}
              viewBox={`0 0 ${ringSize} ${ringSize}`}
              className="shrink-0 -rotate-90 transform"
              aria-hidden="true"
            >
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-border/60"
              />
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="text-rose-500 transition-[stroke-dashoffset] duration-500 ease-out"
              />
            </svg>

            {/* Score Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {recoveryScore}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                / 100
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {getRecoveryLabel()}
          </p>

          <p className="mt-1 max-w-[200px] text-[11px] leading-relaxed text-muted-foreground">
            Aggregated from sleep, hydration, energy reserves, and muscular state.
          </p>
        </div>
      </div>
    </DashboardCard>
  );
}

type RecoveryMetricProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function RecoveryMetric({
  icon,
  label,
  value,
  onChange,
}: RecoveryMetricProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-3 transition-colors hover:border-border/80 hover:bg-muted/50">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400">
            {icon}
          </div>
          <span className="text-xs font-semibold text-foreground">
            {label}
          </span>
        </div>

        <span className="rounded-md border border-border/60 bg-card px-2 py-0.5 text-xs font-bold text-foreground shadow-2xs">
          {value}%
        </span>
      </div>

      <div className="relative flex items-center py-1">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-border/80 accent-rose-500 transition-all focus-visible:outline-none"
        />
      </div>
    </div>
  );
}