import { useState } from "react";
import { X } from "lucide-react";

import { auth } from "@/services/firebase/firebase";
import { addTrainingSession } from "@/services/firebase/training";
import type { TrainingSession } from "@/services/firebase/training";

interface AddTrainingSessionProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddTrainingSession({
  isOpen,
  onClose,
  onAdded,
}: AddTrainingSessionProps) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    date: "",
    workout: "",
    time: "",
    duration: "",
    type: "Strength",
    status: "Upcoming",
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in to add a training session.");
      return;
    }

    if (
      !form.date ||
      !form.workout ||
      !form.time ||
      !form.duration
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const selectedDate = new Date(`${form.date}T00:00:00`);

      const session: TrainingSession = {
        date: form.date,
        day: selectedDate.toLocaleDateString("en-US", {
          weekday: "long",
        }),
        workout: form.workout,
        time: form.time,
        duration: form.duration,
        type: form.type,
        status: form.status,
      };

      await addTrainingSession(user.uid, session);

      setForm({
        date: "",
        workout: "",
        time: "",
        duration: "",
        type: "Strength",
        status: "Upcoming",
      });

      onClose();
      onAdded();
    } catch (error) {
      console.error("Failed to add training session:", error);
      alert("Failed to add training session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Add Training Session
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Add a workout to your training schedule.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          {/* Workout */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Workout
            </label>

            <input
              name="workout"
              value={form.workout}
              onChange={handleChange}
              placeholder="e.g. Sprint Training"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Date
            </label>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            />
          </div>

          {/* Time + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Time
              </label>

              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Duration
              </label>

              <input
                type="text"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="60 mins"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Type
              </label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="Strength">Strength</option>
                <option value="Speed">Speed</option>
                <option value="Recovery">Recovery</option>
                <option value="Agility">Agility</option>
                <option value="Endurance">Endurance</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Today">Today</option>
                <option value="Completed">Completed</option>
                <option value="Rest">Rest</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-zinc-800 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}