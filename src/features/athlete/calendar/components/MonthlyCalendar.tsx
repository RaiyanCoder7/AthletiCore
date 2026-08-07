import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Trophy,
  HeartPulse,
  CalendarDays,
} from "lucide-react";

import { useMemo, useState } from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import type { CalendarEvent } from "./AddEventCard";

interface MonthlyCalendarProps {
  events: CalendarEvent[];
  loading: boolean;
}

function getMonday(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  const day = result.getDay();
  const difference = day === 0 ? 6 : day - 1;

  result.setDate(
    result.getDate() - difference
  );

  return result;
}

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getEventIcon(type: string) {
  switch (type) {
    case "Recovery":
      return <HeartPulse size={13} />;

    case "Competition":
      return <Trophy size={13} />;

    case "Personal":
      return <CalendarDays size={13} />;

    default:
      return <Dumbbell size={13} />;
  }
}

function getEventStyle(type: string) {
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
}

export default function MonthlyCalendar({
  events,
  loading,
}: MonthlyCalendarProps) {
  const [currentWeek, setCurrentWeek] =
    useState(() =>
      getMonday(new Date())
    );

  const todayString = formatDate(
    new Date()
  );

  const days = useMemo(() => {
    return Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date(
          currentWeek
        );

        date.setDate(
          currentWeek.getDate() + index
        );

        return date;
      }
    );
  }, [currentWeek]);

  const monthYear = currentWeek.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  const goToPreviousWeek = () => {
    setCurrentWeek((current) => {
      const previous = new Date(current);

      previous.setDate(
        previous.getDate() - 7
      );

      return previous;
    });
  };

  const goToNextWeek = () => {
    setCurrentWeek((current) => {
      const next = new Date(current);

      next.setDate(
        next.getDate() + 7
      );

      return next;
    });
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(
      getMonday(new Date())
    );
  };

  return (
    <DashboardCard>
      <SectionHeading
        title="Training Calendar"
        subtitle="Your schedule for the current week"
      />

      {/* Calendar Header */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goToPreviousWeek}
          className="rounded-xl border border-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          aria-label="Previous week"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">
            {monthYear}
          </h3>

          <button
            type="button"
            onClick={goToCurrentWeek}
            className="mt-1 text-xs text-blue-400 transition hover:text-blue-300"
          >
            Today
          </button>
        </div>

        <button
          type="button"
          onClick={goToNextWeek}
          className="rounded-xl border border-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          aria-label="Next week"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="mt-8 flex h-40 items-center justify-center">
          <p className="text-sm text-zinc-500">
            Loading calendar...
          </p>
        </div>
      ) : (
        <>
          {/* Days */}
          <div className="mt-6 grid grid-cols-7 gap-2">
            {days.map((date) => {
              const dateString =
                formatDate(date);

              const dayEvents =
                events.filter(
                  (event) =>
                    event.date ===
                    dateString
                );

              const isToday =
                dateString === todayString;

              return (
                <div
                  key={dateString}
                  className={`min-h-36 rounded-2xl border p-3 transition ${
                    isToday
                      ? "border-blue-500/50 bg-blue-500/5"
                      : "border-zinc-800 bg-zinc-800/30 hover:border-zinc-700"
                  }`}
                >
                  {/* Day */}
                  <div className="text-center">
                    <p className="text-xs text-zinc-500">
                      {date.toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                        }
                      )}
                    </p>

                    <p
                      className={`mt-1 text-lg font-semibold ${
                        isToday
                          ? "text-blue-400"
                          : "text-white"
                      }`}
                    >
                      {date.getDate()}
                    </p>
                  </div>

                  {/* Events */}
                  <div className="mt-4 space-y-2">
                    {dayEvents.map(
                      (event) => (
                        <div
                          key={event.id}
                          className={`rounded-xl p-2 ${getEventStyle(
                            event.type
                          )}`}
                        >
                          <div className="flex items-center gap-1.5">
                            {getEventIcon(
                              event.type
                            )}

                            <span className="truncate text-xs font-medium">
                              {event.title}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-[10px] opacity-70">
                            {event.time}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {events.length === 0 && (
            <div className="mt-6 rounded-xl border border-dashed border-zinc-800 p-5 text-center">
              <p className="text-sm text-zinc-500">
                No calendar events have been added yet.
              </p>
            </div>
          )}
        </>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-5 border-t border-zinc-800 pt-5">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          Training
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Recovery
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          Competition
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
          Personal
        </div>
      </div>
    </DashboardCard>
  );
}