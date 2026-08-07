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
        return <HeartPulse size={20} />;

      case "Competition":
        return <Trophy size={20} />;

      default:
        return <Dumbbell size={20} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "Recovery":
        return "bg-emerald-500/10 text-emerald-400";

      case "Competition":
        return "bg-yellow-500/10 text-yellow-400";

      case "Personal":
        return "bg-violet-500/10 text-violet-400";

      default:
        return "bg-blue-500/10 text-blue-400";
    }
  };

  const handleDelete = async (
    event: CalendarEvent
  ) => {
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
      await deleteCalendarEvent(
        user.uid,
        event.id
      );

      onEventDeleted?.(event.id);
    } catch (error) {
      console.error(
        "Failed to delete calendar event:",
        error
      );

      alert(
        "Unable to delete the event. Please try again."
      );
    }
  };

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(
        `${event.date}T00:00:00`
      );

      return eventDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(
        `${a.date}T${a.time}`
      ).getTime();

      const dateB = new Date(
        `${b.date}T${b.time}`
      ).getTime();

      return dateA - dateB;
    });

  return (
    <section>
      <SectionHeading
        title="Upcoming Events"
        subtitle="Your next training sessions and important events"
      />

      {loading ? (
        <DashboardCard className="mt-6">
          <div className="flex items-center justify-center py-10">
            <p className="text-sm text-zinc-500">
              Loading upcoming events...
            </p>
          </div>
        </DashboardCard>
      ) : upcomingEvents.length === 0 ? (
        <div className="mt-6">
          <DashboardCard>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarDays
                size={32}
                className="text-zinc-600"
              />

              <p className="mt-4 font-medium text-zinc-300">
                No upcoming events
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Add an event using the form below.
              </p>
            </div>
          </DashboardCard>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {upcomingEvents.map((event) => {
            const eventDate = new Date(
              `${event.date}T00:00:00`
            );

            const day = eventDate
              .getDate()
              .toString()
              .padStart(2, "0");

            const month = eventDate
              .toLocaleString("en-US", {
                month: "short",
              })
              .toUpperCase();

            return (
              <DashboardCard
                key={event.id}
                className="group"
              >
                <div className="flex items-center gap-4">
                  {/* Date */}
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-zinc-800">
                    <span className="text-xs font-medium text-zinc-500">
                      {month}
                    </span>

                    <span className="text-xl font-bold text-white">
                      {day}
                    </span>
                  </div>

                  {/* Icon */}
                  <div
                    className={`rounded-xl p-3 transition group-hover:scale-105 ${getColor(
                      event.type
                    )}`}
                  >
                    {getIcon(event.type)}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-white">
                      {event.title}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      {event.type}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
                      <Clock size={13} />
                      {event.time}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      title="Edit event"
                      onClick={() =>
                        onEventEdit?.(event)
                      }
                      className="rounded-lg p-2 text-zinc-500 transition hover:bg-blue-500/10 hover:text-blue-400"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      title="Delete event"
                      onClick={() =>
                        handleDelete(event)
                      }
                      className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Notes */}
                {event.notes && (
                  <div className="mt-4 border-t border-zinc-800 pt-3">
                    <p className="line-clamp-2 text-xs leading-5 text-zinc-500">
                      {event.notes}
                    </p>
                  </div>
                )}
              </DashboardCard>
            );
          })}
        </div>
      )}
    </section>
  );
}