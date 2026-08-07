import {
  CalendarDays,
  Plus,
  Clock,
  Trophy,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";

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
  return (
    <DashboardCard className="relative overflow-hidden border-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 text-white">
      {/* Background Glow */}
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        {/* Left */}
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
            <CalendarDays size={16} />
            Athlete Calendar
          </div>

          <p className="text-lg text-blue-100">
            Plan. Train. Perform.
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Your Training Schedule.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">
            Organise training sessions, recovery days and
            competitions in one place. Stay consistent and
            never miss an important event.
          </p>

          <button
            type="button"
            onClick={onAddEvent}
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-blue-700 transition duration-300 hover:scale-105"
          >
            <Plus size={18} />
            Add New Event
          </button>
        </div>

        {/* Right Stats */}
        <div className="grid grid-cols-2 gap-4 lg:w-[340px]">
          {/* Total Events */}
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-blue-100">
              <CalendarDays size={16} />

              <p className="text-sm">
                Total Events
              </p>
            </div>

            <p className="mt-2 text-3xl font-bold">
              {totalEvents}
            </p>
          </div>

          {/* Upcoming */}
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-blue-100">
              <Clock size={16} />

              <p className="text-sm">
                Upcoming
              </p>
            </div>

            <p className="mt-2 text-3xl font-bold">
              {upcomingEvents}
            </p>
          </div>

          {/* Competitions */}
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-blue-100">
              <Trophy size={16} />

              <p className="text-sm">
                Competitions
              </p>
            </div>

            <p className="mt-2 text-3xl font-bold">
              {competitionEvents}
            </p>
          </div>

          {/* Training */}
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-blue-100">
              <CalendarDays size={16} />

              <p className="text-sm">
                Training
              </p>
            </div>

            <p className="mt-2 text-3xl font-bold">
              {totalEvents - competitionEvents}
            </p>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}