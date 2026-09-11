import {
  CalendarDays,
  Clock,
  Dumbbell,
  Plus,
  Trophy,
} from "lucide-react";
import Button from "@/components/ui/Button";

interface CalendarHeroProps {
  totalEvents: number;
  upcomingEvents: number;
  competitionEvents: number;
  onAddEvent: () => void;
}

export default function CalendarHero({
  totalEvents,
  upcomingEvents,
  competitionEvents,
  onAddEvent,
}: CalendarHeroProps) {
  const trainingEvents = Math.max(0, totalEvents - competitionEvents);

  const stats = [
    {
      label: "Total Events",
      value: totalEvents,
      icon: CalendarDays,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Upcoming",
      value: upcomingEvents,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Competitions",
      value: competitionEvents,
      icon: Trophy,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Training",
      value: trainingEvents,
      icon: Dumbbell,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm shadow-slate-900/[0.04] transition-colors dark:shadow-black/20 sm:p-8">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-500/5 blur-2xl dark:bg-indigo-500/10"
      />

      <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        {/* Left Content */}
        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
            <CalendarDays size={13} className="shrink-0" />
            <span>Athlete Calendar</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Your Training Schedule.
          </h1>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Organize training blocks, recovery windows, and competitions in one unified timetable. Stay structured and never miss a key session.
          </p>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={onAddEvent}
            >
              <Plus size={16} />
              <span>Add New Event</span>
            </Button>
          </div>
        </div>

        {/* Right Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:w-[360px]">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="rounded-xl border border-border/70 bg-muted/30 p-3.5 transition-colors hover:border-border hover:bg-muted/50 sm:p-4"
              >
                <div className="flex items-center gap-2">
                  <div className={`rounded-lg border p-1.5 ${item.bg} ${item.border} ${item.color}`}>
                    <Icon size={14} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground truncate">
                    {item.label}
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}