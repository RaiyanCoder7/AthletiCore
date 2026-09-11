import { useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Flag,
  Loader2,
  Plus,
  Target,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { addGoal } from "@/services/firebase/goals";

interface CreateGoalCardProps {
  onCreated?: () => void;
}

export default function CreateGoalCard({
  onCreated,
}: CreateGoalCardProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setType("");
    setTarget("");
    setDeadline("");
    setDescription("");
    setError("");
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in to create a goal.");
      return;
    }

    if (
      !name.trim() ||
      !type ||
      !target.trim() ||
      !deadline ||
      !description.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await addGoal(user.uid, {
        name: name.trim(),
        type,
        target: target.trim(),
        current: "0",
        progress: 0,
        deadline,
        description: description.trim(),
        status: "Active",
      });

      resetForm();

      onCreated?.();
    } catch (error) {
      console.error("Failed to create goal:", error);
      setError("Unable to create goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <SectionHeading
        title="Create a New Goal"
        subtitle="Set a target and start working towards it"
      />

      <DashboardCard className="relative mt-6 overflow-hidden border-border bg-card shadow-xs transition-colors">
        {/* Top Accent Strip (Goals domain: Emerald/Teal highlight) */}
        <div 
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" 
          aria-hidden="true" 
        />

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Goal Name */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Goal Name
            </label>

            <div className="relative">
              <Target
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Improve sprint speed"
                className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/60 focus:border-emerald-500 focus:bg-background focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Goal Type */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Goal Type
            </label>

            <div className="relative">
              <Flag
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-all hover:bg-muted/60 focus:border-emerald-500 focus:bg-background focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="" disabled className="bg-card text-muted-foreground">
                  Select goal type
                </option>
                <option value="Performance" className="bg-card text-foreground">Performance</option>
                <option value="Strength" className="bg-card text-foreground">Strength</option>
                <option value="Speed" className="bg-card text-foreground">Speed</option>
                <option value="Endurance" className="bg-card text-foreground">Endurance</option>
                <option value="Training" className="bg-card text-foreground">Training</option>
                <option value="Recovery" className="bg-card text-foreground">Recovery</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />
            </div>
          </div>

          {/* Target */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Target
            </label>

            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 12 seconds"
              className="w-full rounded-xl border border-border bg-muted/40 py-2.5 px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/60 focus:border-emerald-500 focus:bg-background focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Deadline
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
              />

              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-all hover:bg-muted/60 focus:border-emerald-500 focus:bg-background focus:ring-2 focus:ring-emerald-500/20 [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </label>

          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you want to achieve..."
            className="w-full resize-none rounded-xl border border-border bg-muted/40 p-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/60 focus:border-emerald-500 focus:bg-background focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border/50 pt-5">
          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-zinc-950"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Create Goal</span>
              </>
            )}
          </button>
        </div>
      </DashboardCard>
    </section>
  );
}