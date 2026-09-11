import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Clock,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Tag,
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
      ...(editingEvent?.id ? { id: editingEvent.id } : {}),
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
        await updateCalendarEvent(user.uid, editingEvent.id, {
          title: event.title,
          type: event.type,
          date: event.date,
          time: event.time,
          notes: event.notes,
        });

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
      console.error("Failed to save calendar event:", error);

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

      <DashboardCard className="relative mt-6 overflow-hidden border-border bg-card shadow-xs transition-colors">
        {/* Top Accent Strip (Indigo/Blue schedule theme) */}
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400"
          aria-hidden="true"
        />

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Event Name */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Event Name <span className="text-destructive">*</span>
              </label>

              <div className="relative">
                <FileText
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
                />

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sprint Training"
                  disabled={loading}
                  className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Event Type <span className="text-destructive">*</span>
              </label>

              <div className="relative">
                <Tag
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
                />

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={loading}
                  className="w-full appearance-none rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-all hover:bg-muted/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled className="bg-card text-muted-foreground">
                    Select event type
                  </option>
                  <option value="Training" className="bg-card text-foreground">
                    Training
                  </option>
                  <option value="Recovery" className="bg-card text-foreground">
                    Recovery
                  </option>
                  <option value="Competition" className="bg-card text-foreground">
                    Competition
                  </option>
                  <option value="Personal" className="bg-card text-foreground">
                    Personal
                  </option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Date <span className="text-destructive">*</span>
              </label>

              <div className="relative">
                <CalendarDays
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
                />

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-all hover:bg-muted/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Time <span className="text-destructive">*</span>
              </label>

              <div className="relative">
                <Clock
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
                />

                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-all hover:bg-muted/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notes
            </label>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              placeholder="Add notes about this event..."
              className="w-full resize-none rounded-xl border border-border bg-muted/40 p-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border/50 pt-5">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={16} />
                <span>Cancel Edit</span>
              </button>
            )}

            {!isEditing && (
              <button
                type="button"
                onClick={clearForm}
                disabled={loading}
                className="rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{isEditing ? "Updating..." : "Adding..."}</span>
                </>
              ) : isEditing ? (
                <>
                  <Pencil size={16} />
                  <span>Update Event</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Add Event</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DashboardCard>
    </section>
  );
}