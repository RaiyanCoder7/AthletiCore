import { useState } from "react";
import {
  Calendar,
  Clock,
  Dumbbell,
  Users,
  Plus,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Flame,
  ChevronRight,
} from "lucide-react";

import PageContainer from "@/components/layout/PageContainer";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";
import StatBar from "@/components/ui/StatBar";
import Button from "@/components/ui/Button";

interface TrainingSession {
  id: string;
  title: string;
  squad: string;
  focus: "Conditioning" | "Tactical" | "Recovery" | "Strength";
  intensity: "High" | "Moderate" | "Low";
  date: string;
  time: string;
  duration: string;
  pitch: string;
  attendeesCount: number;
  maxSquadSize: number;
  status: "Scheduled" | "In Progress" | "Completed";
}

const INITIAL_SESSIONS: TrainingSession[] = [
  {
    id: "sess-1",
    title: "Speed & Positional Agility Circuit",
    squad: "First Team",
    focus: "Conditioning",
    intensity: "High",
    date: "Today",
    time: "5:30 PM – 7:00 PM",
    duration: "90 min",
    pitch: "Pitch A - Main Stadium",
    attendeesCount: 18,
    maxSquadSize: 20,
    status: "Scheduled",
  },
  {
    id: "sess-2",
    title: "Defensive Shape & Counter-Press Triggers",
    squad: "Under-21 Squad",
    focus: "Tactical",
    intensity: "Moderate",
    date: "Tomorrow",
    time: "10:00 AM – 11:30 AM",
    duration: "90 min",
    pitch: "Pitch B - Academy Turf",
    attendeesCount: 22,
    maxSquadSize: 24,
    status: "Scheduled",
  },
  {
    id: "sess-3",
    title: "Post-Match Cryo & Active Mobility Flush",
    squad: "First Team",
    focus: "Recovery",
    intensity: "Low",
    date: "Friday",
    time: "9:00 AM – 10:15 AM",
    duration: "75 min",
    pitch: "Hydro & Recovery Lab",
    attendeesCount: 16,
    maxSquadSize: 18,
    status: "Scheduled",
  },
  {
    id: "sess-4",
    title: "Max Velocity Explosive Acceleration",
    squad: "Development Squad",
    focus: "Strength",
    intensity: "High",
    date: "Yesterday",
    time: "4:00 PM – 5:30 PM",
    duration: "90 min",
    pitch: "Track Annex",
    attendeesCount: 15,
    maxSquadSize: 15,
    status: "Completed",
  },
];

export default function CoachTrainingPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>(INITIAL_SESSIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  // Create Session Form State
  const [title, setTitle] = useState("");
  const [squad, setSquad] = useState("First Team");
  const [focus, setFocus] = useState<TrainingSession["focus"]>("Conditioning");
  const [intensity, setIntensity] = useState<TrainingSession["intensity"]>("High");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("90 min");
  const [pitch, setPitch] = useState("Pitch A");

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newSession: TrainingSession = {
      id: `sess-${Date.now()}`,
      title: title.trim(),
      squad,
      focus,
      intensity,
      date: date || "Scheduled Date",
      time: time || "TBD",
      duration,
      pitch,
      attendeesCount: 18,
      maxSquadSize: 22,
      status: "Scheduled",
    };

    setSessions((prev) => [newSession, ...prev]);
    setTitle("");
    setIsModalOpen(false);
  };

  const filteredSessions = sessions.filter((s) => {
    if (activeFilter === "ALL") return true;
    return s.status.toUpperCase() === activeFilter;
  });

  return (
    <PageContainer>
      {/* Console Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Training & Tactical Planner
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Program team drills, manage pitch availability, and monitor roster attendance loads.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>+ Schedule Session</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        {["ALL", "SCHEDULED", "COMPLETED"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveFilter(tab)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === tab
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border/70 bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sessions Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredSessions.map((session) => {
          const isCompleted = session.status === "Completed";
          const isHigh = session.intensity === "High";

          return (
            <DashboardCard
              key={session.id}
              accent={isCompleted ? "emerald" : isHigh ? "orange" : "blue"}
              hover
              className="flex flex-col justify-between"
            >
              <div>
                {/* Status & Focus Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-border/70 bg-muted/30 px-2 py-0.5 font-mono text-[11px] font-bold text-foreground">
                      {session.squad}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${
                        session.focus === "Conditioning"
                          ? "border border-orange-500/20 bg-orange-500/10 text-orange-400"
                          : session.focus === "Recovery"
                          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : "border border-blue-500/20 bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {session.focus}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 font-mono text-xs font-semibold ${
                      isCompleted ? "text-emerald-500" : "text-amber-500"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                    {session.status}
                  </span>
                </div>

                {/* Drill Title */}
                <h3 className="mt-3 text-base font-bold text-foreground">
                  {session.title}
                </h3>

                {/* Logistics */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary" />
                    <span>
                      {session.date} • {session.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-primary" />
                    <span>Duration: {session.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-primary" />
                    <span>{session.pitch}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Flame
                      size={13}
                      className={
                        isHigh
                          ? "text-rose-500"
                          : session.intensity === "Moderate"
                          ? "text-amber-500"
                          : "text-emerald-500"
                      }
                    />
                    <span>Intensity: {session.intensity}</span>
                  </div>
                </div>

                {/* Attendance Telemetry */}
                <div className="mt-5 border-t border-border/60 pt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users size={12} />
                      Squad Attendance
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {session.attendeesCount} / {session.maxSquadSize} Cleared
                    </span>
                  </div>
                  <StatBar
                    percent={(session.attendeesCount / session.maxSquadSize) * 100}
                    className="bg-primary"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => alert(`Reviewing roster for ${session.title}`)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <span>Review Roster Readiness</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </DashboardCard>
          );
        })}
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground">
                Program Training Session
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="mt-4 space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                  Drill / Session Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pressing Dynamics & Rapid Transition"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    Squad
                  </label>
                  <select
                    value={squad}
                    onChange={(e) => setSquad(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="First Team">First Team</option>
                    <option value="Under-21 Squad">Under-21 Squad</option>
                    <option value="Development Squad">Development Squad</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    Primary Focus
                  </label>
                  <select
                    value={focus}
                    onChange={(e) => setFocus(e.target.value as TrainingSession["focus"])}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="Conditioning">Conditioning</option>
                    <option value="Tactical">Tactical</option>
                    <option value="Strength">Strength</option>
                    <option value="Recovery">Recovery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    Intensity Level
                  </label>
                  <select
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value as TrainingSession["intensity"])}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="High">High Strain</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Low">Low / Active Recovery</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    Pitch / Venue
                  </label>
                  <input
                    type="text"
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5:30 PM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Schedule Pitch Session
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}