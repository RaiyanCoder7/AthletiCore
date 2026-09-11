import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Trophy,
  HeartPulse,
  CalendarDays,
  Calendar as CalendarIcon,
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

  result.setDate(result.getDate() - difference);

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
      return <HeartPulse size={13} className="shrink-0 text-rose-500" />;

    case "Competition":
      return <Trophy size={13} className="shrink-0 text-amber-500" />;

    case "Personal":
      return <CalendarDays size={13} className="shrink-0 text-violet-500" />;

    default:
      return <Dumbbell size={13} className="shrink-0 text-orange-500" />;
  }
}

function getEventStyle(type: string) {
  switch (type) {
    case "Recovery":
      return "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/15";

    case "Competition":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15";

    case "Personal":
      return "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300 hover:bg-violet-500/15";

    default:
      // Training category aligned to Orange
      return "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300 hover:bg-orange-500/15";
  }
}

export default function MonthlyCalendar({
  events,
  loading,
}: MonthlyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(() => getMonday(new Date()));

  const todayString = formatDate(new Date());

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(currentWeek);
      date.setDate(currentWeek.getDate() + index);
      return date;
    });
  }, [currentWeek]);

  const monthYear = currentWeek.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const goToPreviousWeek = () => {
    setCurrentWeek((current) => {
      const previous = new Date(current);
      previous.setDate(previous.getDate() - 7);
      return previous;
    });
  };

  const goToNextWeek = () => {
    setCurrentWeek((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(getMonday(new Date()));
  };

  return (
    <DashboardCard className="relative overflow-hidden border-border bg-card shadow-xs transition-colors">
      {/* Top Accent Strip (Schedule / Planning domain: Indigo to Sky gradient) */}
      <div
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400"
        aria-hidden="true"
      />

      <SectionHeading
        title="Training Calendar"
        subtitle="Your schedule for the current week"
      />

      {/* Calendar Header / Navigation Controls */}
      <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 p-2.5 sm:p-3">
        <button
          type="button"
          onClick={goToPreviousWeek}
          className="rounded-lg border border-border bg-card p-2 text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Previous week"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {monthYear}
          </h3>

          <button
            type="button"
            onClick={goToCurrentWeek}
            className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline"
          >
            <CalendarIcon size={12} />
            <span>Today</span>
          </button>
        </div>

        <button
          type="button"
          onClick={goToNextWeek}
          className="rounded-lg border border-border bg-card p-2 text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Next week"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Loading Skeleton View */}
      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div
              key={idx}
              className="min-h-36 animate-pulse rounded-2xl border border-border/50 bg-muted/20 p-3"
            >
              <div className="mx-auto h-3 w-8 rounded bg-muted/60" />
              <div className="mx-auto mt-2 h-6 w-6 rounded-full bg-muted/60" />
              <div className="mt-4 space-y-2">
                <div className="h-9 rounded-lg bg-muted/40" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Days Grid */}
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
            {days.map((date) => {
              const dateString = formatDate(date);

              const dayEvents = events.filter(
                (event) => event.date === dateString
              );

              const isToday = dateString === todayString;

              return (
                <div
                  key={dateString}
                  className={`group relative flex min-h-36 flex-col justify-between rounded-2xl border p-3 transition-all duration-150 ${
                    isToday
                      ? "border-primary/40 bg-primary/5 shadow-xs ring-1 ring-primary/20"
                      : "border-border bg-card/60 hover:border-border/80 hover:bg-muted/20"
                  }`}
                >
                  {/* Day Header */}
                  <div>
                    <div className="text-center">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {date.toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </p>

                      <div className="mt-1 flex items-center justify-center">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                            isToday
                              ? "bg-primary font-bold text-primary-foreground shadow-xs"
                              : "text-foreground group-hover:bg-muted/60"
                          }`}
                        >
                          {date.getDate()}
                        </span>
                      </div>
                    </div>

                    {/* Events Container */}
                    <div className="mt-3 space-y-1.5">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`rounded-lg border p-1.5 transition-colors ${getEventStyle(
                            event.type
                          )}`}
                        >
                          <div className="flex items-center gap-1">
                            {getEventIcon(event.type)}
                            <span className="truncate text-[11px] font-semibold tracking-tight">
                              {event.title}
                            </span>
                          </div>

                          {event.time && (
                            <p className="mt-0.5 truncate text-[10px] opacity-75">
                              {event.time}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Empty Slot Footprint */}
                  {dayEvents.length === 0 && (
                    <div className="py-2 text-center">
                      <span className="text-[10px] text-muted-foreground/40">
                        —
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty state fallback */}
          {events.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
              <CalendarDays className="mx-auto text-muted-foreground/50" size={28} />
              <p className="mt-2 text-sm font-medium text-foreground">
                No events scheduled
              </p>
              <p className="text-xs text-muted-foreground">
                There are no workouts, recovery sessions, or competitions for this week.
              </p>
            </div>
          )}
        </>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 border-t border-border/60 pt-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-orange-500/20" />
          <span>Training</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
          <span>Recovery</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
          <span>Competition</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-500 ring-2 ring-violet-500/20" />
          <span>Personal</span>
        </div>
      </div>
    </DashboardCard>
  );
}