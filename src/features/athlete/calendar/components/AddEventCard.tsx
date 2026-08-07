import {
  CalendarDays,
  Clock,
  FileText,
  Plus,
  Pencil,
  X,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import {
  addCalendarEvent,
  updateCalendarEvent,
} from "@/services/firebase/calendar";

export type CalendarEvent = {
  id?: string;
  title: string;
  type: string;
  date: string;
  time: string;
  notes: string;
};

type AddEventCardProps = {
  onAddEvent: (event: CalendarEvent) => void;
  editingEvent: CalendarEvent | null;
  onUpdateEvent: (event: CalendarEvent) => Promise<void>;
};

export default function AddEventCard({
  onAddEvent,
  editingEvent,
  onUpdateEvent,
}: AddEventCardProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Load selected event into the form
   */
  useEffect(() => {
    if (!editingEvent) {
      return;
    }

    setTitle(editingEvent.title);
    setType(editingEvent.type);
    setDate(editingEvent.date);
    setTime(editingEvent.time);
    setNotes(editingEvent.notes);
    setError("");
  }, [editingEvent]);

  const clearForm = () => {
    setTitle("");
    setType("");
    setDate("");
    setTime("");
    setNotes("");
    setError("");
  };

  const handleCancelEdit = () => {
    clearForm();
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    if (!title.trim() || !type || !date || !time) {
      setError("Please fill in all required fields.");
      return;
    }

    const event: CalendarEvent = {
      ...(editingEvent?.id
        ? { id: editingEvent.id }
        : {}),
      title: title.trim(),
      type,
      date,
      time,
      notes: notes.trim(),
    };

    try {
      setLoading(true);
      setError("");

      /*
       * EDIT EXISTING EVENT
       */
      if (editingEvent?.id) {
        await updateCalendarEvent(
          user.uid,
          editingEvent.id,
          {
            title: event.title,
            type: event.type,
            date: event.date,
            time: event.time,
            notes: event.notes,
          }
        );

        await onUpdateEvent(event);
        clearForm();
        return;
      }

      /*
       * ADD NEW EVENT
       */
      await addCalendarEvent(user.uid, {
        title: event.title,
        type: event.type,
        date: event.date,
        time: event.time,
        notes: event.notes,
      });

      onAddEvent(event);
      clearForm();
    } catch (error) {
      console.error(
        "Failed to save calendar event:",
        error
      );

      setError(
        editingEvent
          ? "Unable to update event. Please try again."
          : "Unable to add event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(editingEvent);

  return (
    <section>
      <SectionHeading
        title={isEditing ? "Edit Event" : "Add Event"}
        subtitle={
          isEditing
            ? "Update your scheduled event"
            : "Schedule a training session or important event"
        }
      />

      <DashboardCard className="mt-6">
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">

            {/* Event Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Event Name
              </label>

              <div className="relative">
                <FileText
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="e.g. Sprint Training"
                  disabled={loading}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Event Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Event Type
              </label>

              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value)
                }
                disabled={loading}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 disabled:opacity-50"
              >
                <option value="" disabled>
                  Select event type
                </option>

                <option value="Training">
                  Training
                </option>

                <option value="Recovery">
                  Recovery
                </option>

                <option value="Competition">
                  Competition
                </option>

                <option value="Personal">
                  Personal
                </option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Time
              </label>

              <div className="relative">
                <Clock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />

                <input
                  type="time"
                  value={time}
                  onChange={(e) =>
                    setTime(e.target.value)
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Notes
            </label>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              disabled={loading}
              placeholder="Add notes about this event..."
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
                Cancel Edit
              </button>
            )}

            {!isEditing && (
              <button
                type="button"
                onClick={clearForm}
                disabled={loading}
                className="rounded-xl border border-zinc-800 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEditing ? (
                <Pencil size={18} />
              ) : (
                <Plus size={18} />
              )}

              {loading
                ? isEditing
                  ? "Updating..."
                  : "Adding..."
                : isEditing
                ? "Update Event"
                : "Add Event"}
            </button>
          </div>
        </form>
      </DashboardCard>
    </section>
  );
}