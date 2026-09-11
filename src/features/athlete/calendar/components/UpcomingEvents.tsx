import {
  CalendarDays,
  Clock,
  Dumbbell,
  HeartPulse,
  Trophy,
  Pencil,
  Trash2,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import type { CalendarEvent } from "./AddEventCard";

import { auth } from "@/services/firebase/firebase";
import { deleteCalendarEvent } from "@/services/firebase/calendar";

type UpcomingEventsProps = {
  events: CalendarEvent[];
  loading: boolean;
  onEventDeleted?: (eventId: string) => void;
  onEventEdit?: (event: CalendarEvent) => void;
};

export default function UpcomingEvents({
  events,
  loading,
  onEventDeleted,
  onEventEdit,
}: UpcomingEventsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "Recovery":
        return <HeartPulse size={18} className="text-rose-500" />;

      case "Competition":
        return <Trophy size={18} className="text-amber-500" />;

      case "Personal":
        return <CalendarDays size={18} className="text-violet-500" />;

      default:
        return <Dumbbell size={18} className="text-orange-500" />;
    }
  };

  const getStyle = (type: string) => {
    switch (type) {
      case "Recovery":
        return {
          badge: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
          iconBox: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
          strip: "bg-rose-500",
        };

      case "Competition":
        return {
          badge: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
          iconBox: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
          strip: "bg-amber-500",
        };

      case "Personal":
        return {
          badge: "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
          iconBox: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20",
          strip: "bg-violet-500",
        };

      default:
        return {
          badge: "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300",
          iconBox: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
          strip: "bg-orange-500",
        };
    }
  };

  const handleDelete = async (event: CalendarEvent) => {
    if (!event.id) {
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCalendarEvent(user.uid, event.id);

      onEventDeleted?.(event.id);
    } catch (error) {
      console.error("Failed to delete calendar event:", error);

      alert("Unable to delete the event. Please try again.");
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(`${event.date}T00:00:00`);
      return eventDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`).getTime();
      const dateB = new Date(`${b.date}T${b.time}`).getTime();
      return dateA - dateB;
    });

  return (
    <section>
      <SectionHeading
        title="Upcoming Events"
        subtitle="Your next training sessions and important events"
      />

      {loading ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="flex min-h-32 animate-pulse items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs"
            >
              <div className="h-14 w-14 shrink-0 rounded-xl bg-muted" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted/70" />
                <div className="h-3 w-1/4 rounded bg-muted/50" />
              </div>
            </div>
          ))}
        </div>
      ) : upcomingEvents.length === 0 ? (
        <DashboardCard className="mt-6 border-border bg-card shadow-xs transition-colors">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-muted/40 text-muted-foreground">
              <CalendarDays size={24} />
            </div>

            <p className="mt-4 font-semibold text-foreground">
              No upcoming events
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Add a session or milestone to keep your schedule active.
            </p>
          </div>
        </DashboardCard>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {upcomingEvents.map((event) => {
            const eventDate = new Date(`${event.date}T00:00:00`);

            const day = eventDate
              .getDate()
              .toString()
              .padStart(2, "0");

            const month = eventDate
              .toLocaleString("en-US", {
                month: "short",
              })
              .toUpperCase();

            const styling = getStyle(event.type);

            return (
              <div
                key={event.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:border-border/80 hover:shadow-sm"
              >
                {/* Left Domain Strip Indicator */}
                <div
                  className={`absolute inset-y-0 left-0 w-1 ${styling.strip}`}
                  aria-hidden="true"
                />

                <div>
                  <div className="flex items-start justify-between gap-3 pl-1">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Date Badge */}
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-muted/40 transition-colors group-hover:bg-muted/70">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {month}
                        </span>
                        <span className="text-lg font-bold tracking-tight text-foreground">
                          {day}
                        </span>
                      </div>

                      {/* Icon */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${styling.iconBox}`}
                      >
                        {getIcon(event.type)}
                      </div>

                      {/* Title & Metadata */}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold tracking-tight text-foreground sm:text-base">
                          {event.title}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border ${styling.badge}`}
                          >
                            {event.type}
                          </span>

                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={12} />
                            <span>{event.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        title="Edit event"
                        onClick={() => onEventEdit?.(event)}
                        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        title="Delete event"
                        onClick={() => handleDelete(event)}
                        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {event.notes && (
                  <div className="mt-3.5 border-t border-border/50 pl-1 pt-3">
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {event.notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}