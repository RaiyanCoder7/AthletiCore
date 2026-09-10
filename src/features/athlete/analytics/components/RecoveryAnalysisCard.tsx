import { useEffect, useState } from "react";
import {
  Moon,
  Droplets,
  BatteryMedium,
  HeartPulse,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

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
    (
      sleepQuality +
      hydration +
      energyLevel +
      muscleRecovery
    ) / 4
  );

  useEffect(() => {
    const loadTodayRecovery = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const recovery =
          await getTodayRecovery(user.uid);

        if (recovery) {
          setSleepQuality(
            recovery.sleepQuality
          );

          setHydration(
            recovery.hydration
          );

          setEnergyLevel(
            recovery.energyLevel
          );

          setMuscleRecovery(
            recovery.muscleRecovery
          );

          setSaved(true);
        }
      } catch (error) {
        console.error(
          "Failed to load recovery data:",
          error
        );

        setError(
          "Unable to load today's recovery data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTodayRecovery();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;

    if (!user) {
      setError(
        "You must be logged in to save recovery data."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const today = new Date();

      const date = [
        today.getFullYear(),
        String(
          today.getMonth() + 1
        ).padStart(2, "0"),
        String(
          today.getDate()
        ).padStart(2, "0"),
      ].join("-");

      await addRecoveryEntry(
        user.uid,
        {
          date,
          sleepQuality,
          hydration,
          energyLevel,
          muscleRecovery,
          recoveryScore,
        }
      );

      setSaved(true);
    } catch (error) {
      console.error(
        "Failed to save recovery data:",
        error
      );

      setError(
        "Unable to save recovery data. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const getRecoveryLabel = () => {
    if (recoveryScore >= 80) {
      return "Excellent recovery";
    }

    if (recoveryScore >= 60) {
      return "Good recovery";
    }

    if (recoveryScore >= 40) {
      return "Moderate recovery";
    }

    return "Low recovery";
  };

  if (loading) {
    return (
      <DashboardCard accent="rose">
        <SectionHeading
          title="Recovery Analysis"
          subtitle="Today's recovery metrics"
        />

        <div className="mt-8 flex h-64 items-center justify-center">
          <p className="text-muted-foreground">
            Loading recovery data...
          </p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard accent="rose">
      <SectionHeading
        title="Recovery Analysis"
        subtitle="Today's recovery metrics"
      />

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_260px]">
        {/* Metrics */}
        <div className="space-y-6">
          {/* Sleep */}
          <RecoveryMetric
            icon={<Moon size={18} />}
            label="Sleep Quality"
            value={sleepQuality}
            onChange={setSleepQuality}
          />

          {/* Hydration */}
          <RecoveryMetric
            icon={<Droplets size={18} />}
            label="Hydration"
            value={hydration}
            onChange={setHydration}
          />

          {/* Energy */}
          <RecoveryMetric
            icon={<BatteryMedium size={18} />}
            label="Energy Level"
            value={energyLevel}
            onChange={setEnergyLevel}
          />

          {/* Muscle Recovery */}
          <RecoveryMetric
            icon={<HeartPulse size={18} />}
            label="Muscle Recovery"
            value={muscleRecovery}
            onChange={setMuscleRecovery}
          />

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : saved
              ? "Update Recovery"
              : "Save Recovery"}
          </button>
        </div>

        {/* Recovery Score */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/50 p-8">
          <p className="text-sm font-medium text-muted-foreground">
            Recovery Score
          </p>

          <div className="mt-5 flex h-36 w-36 items-center justify-center rounded-full border-8 border-rose-500/20">
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground">
                {recoveryScore}
              </p>

              <p className="text-xs text-muted-foreground">
                / 100
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm font-medium text-rose-600 dark:text-rose-400">
            {getRecoveryLabel()}
          </p>

          <p className="mt-2 text-center text-xs leading-5 text-muted-foreground">
            Based on today's sleep, hydration,
            energy, and muscle recovery.
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
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
            {icon}
          </div>

          <span className="text-sm font-medium text-foreground">
            {label}
          </span>
        </div>

        <span className="text-sm font-semibold text-foreground">
          {value}%
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
        className="w-full accent-rose-500"
      />
    </div>
  );
}