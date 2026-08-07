import { useState } from "react";
import {
  CalendarDays,
  Flag,
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

      <DashboardCard className="mt-6">
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Goal Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Goal Name
            </label>

            <div className="relative">
              <Target
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Improve sprint speed"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Goal Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Goal Type
            </label>

            <div className="relative">
              <Flag
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-800/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500"
              >
                <option value="" disabled>
                  Select goal type
                </option>
                <option value="Performance">Performance</option>
                <option value="Strength">Strength</option>
                <option value="Speed">Speed</option>
                <option value="Endurance">Endurance</option>
                <option value="Training">Training</option>
                <option value="Recovery">Recovery</option>
              </select>
            </div>
          </div>

          {/* Target */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Target
            </label>

            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 12 seconds"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Deadline
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Description
          </label>

          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you want to achieve..."
            className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="rounded-xl border border-zinc-800 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />
            {loading ? "Creating..." : "Create Goal"}
          </button>
        </div>
      </DashboardCard>
    </section>
  );
}