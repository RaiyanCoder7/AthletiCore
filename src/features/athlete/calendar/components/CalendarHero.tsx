import {
  CalendarDays,
  Clock,
  Dumbbell,
  Plus,
  Trophy,
} from "lucide-react";

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

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white lg:p-8 shadow-xs transition-colors">
      {/* Shared Diagonal Pattern Texture */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="calendar-hero-diagonal"
            width="24"
            height="24"
            patternTransform="rotate(35)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="24" stroke="white" strokeWidth="8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#calendar-hero-diagonal)" />
      </svg>

      {/* Ambient Glows */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-400/20 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        {/* Left Content */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium text-blue-100 backdrop-blur">
            <CalendarDays size={13} />
            <span>Athlete Calendar</span>
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white lg:text-4xl">
            Your Training Schedule.
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-blue-100 lg:text-base">
            Organise training sessions, recovery days, and competitions in one place. Stay consistent and never miss a key date.
          </p>

          {/* Primary Action Button */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onAddEvent}
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-md transition-all duration-200 hover:bg-blue-50 hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700 transition-colors group-hover:bg-blue-200">
                <Plus size={15} strokeWidth={2.5} />
              </span>
              <span>Add New Event</span>
            </button>
          </div>
        </div>

        {/* Right Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:w-[360px]">
          {/* Total Events */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:p-5 backdrop-blur transition-colors hover:bg-white/[0.14]">
            <div className="flex items-center gap-2 text-blue-100">
              <CalendarDays size={16} />
              <p className="text-xs sm:text-sm font-medium">Total Events</p>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {totalEvents}
            </p>
          </div>

          {/* Upcoming Events */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:p-5 backdrop-blur transition-colors hover:bg-white/[0.14]">
            <div className="flex items-center gap-2 text-blue-100">
              <Clock size={16} />
              <p className="text-xs sm:text-sm font-medium">Upcoming</p>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {upcomingEvents}
            </p>
          </div>

          {/* Competitions */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:p-5 backdrop-blur transition-colors hover:bg-white/[0.14]">
            <div className="flex items-center gap-2 text-blue-100">
              <Trophy size={16} />
              <p className="text-xs sm:text-sm font-medium">Competitions</p>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {competitionEvents}
            </p>
          </div>

          {/* Training Sessions */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 sm:p-5 backdrop-blur transition-colors hover:bg-white/[0.14]">
            <div className="flex items-center gap-2 text-blue-100">
              <Dumbbell size={16} />
              <p className="text-xs sm:text-sm font-medium">Training</p>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {trainingEvents}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}