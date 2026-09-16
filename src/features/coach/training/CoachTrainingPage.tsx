import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  Plus,
  MapPin,
  CheckCircle2,
  X,
  Flame,
  UserCheck,
  Loader2,
  Shield,
} from "lucide-react";

import PageContainer from "@/components/layout/PageContainer";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";
import StatBar from "@/components/ui/StatBar";
import Button from "@/components/ui/Button";

import {
  subscribeToTrainingSessions,
  createTrainingSessionDoc,
  updateSessionStatus,
  updateSessionAttendance,
  subscribeToAthletes,
  subscribeToTeams,
} from "@/services/firebase/coach";
import type {
  CoachTrainingDoc,
  CoachAthlete,
  TeamSquadDoc,
} from "@/services/firebase/coach";

export default function CoachTrainingPage() {
  const [sessions, setSessions] = useState<CoachTrainingDoc[]>([]);
  const [athletes, setAthletes] = useState<CoachAthlete[]>([]);
  const [teams, setTeams] = useState<TeamSquadDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [selectedSquadFilter, setSelectedSquadFilter] = useState<string>("ALL");

  // Selected session for attendance check-in drawer
  const [selectedSession, setSelectedSession] = useState<CoachTrainingDoc | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [squad, setSquad] = useState("First Team");
  const [focus, setFocus] = useState<CoachTrainingDoc["focus"]>("Conditioning");
  const [intensity, setIntensity] = useState<CoachTrainingDoc["intensity"]>("High");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("90 min");
  const [pitch, setPitch] = useState("Pitch A - Main Stadium");

  useEffect(() => {
    const unsubSessions = subscribeToTrainingSessions((data) => {
      setSessions(data);
      setLoading(false);
    });
    const unsubAthletes = subscribeToAthletes((data) => setAthletes(data));
    const unsubTeams = subscribeToTeams((data) => {
      setTeams(data);
      if (data.length > 0 && squad === "First Team") {
        setSquad(data[0].name);
      }
    });

    return () => {
      unsubSessions();
      unsubAthletes();
      unsubTeams();
    };
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      // Calculate eligible athletes in this specific squad
      const squadAthletes = athletes.filter(
        (a) => a.teamName === squad || a.teamId === teams.find((t) => t.name === squad)?.id
      );

      await createTrainingSessionDoc({
        title: title.trim(),
        squad,
        focus,
        intensity,
        date: date || new Date().toISOString().split("T")[0],
        time: time || "5:30 PM",
        duration,
        pitch,
        attendeesCount: squadAthletes.length,
        maxSquadSize: squadAthletes.length || 20,
        status: "Scheduled",
      });

      setTitle("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create training drill:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (session: CoachTrainingDoc) => {
    if (!session.id) return;
    const nextStatus =
      session.status === "Scheduled"
        ? "In Progress"
        : session.status === "In Progress"
        ? "Completed"
        : "Scheduled";
    await updateSessionStatus(session.id, nextStatus);
  };

  const handleAttendanceChange = async (
    sessionId: string,
    athleteId: string,
    status: "Present" | "Late" | "Excused" | "Absent"
  ) => {
    await updateSessionAttendance(sessionId, athleteId, status);
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesStatus =
        activeFilter === "ALL" || s.status.toUpperCase() === activeFilter;
      const matchesSquad =
        selectedSquadFilter === "ALL" || s.squad === selectedSquadFilter;

      return matchesStatus && matchesSquad;
    });
  }, [sessions, activeFilter, selectedSquadFilter]);

  // Determine eligible squad athletes for the attendance check-in modal
  const checkInAthletes = useMemo(() => {
    if (!selectedSession) return [];
    const matchedSquadAthletes = athletes.filter(
      (a) =>
        a.teamName === selectedSession.squad ||
        a.teamId === teams.find((t) => t.name === selectedSession.squad)?.id
    );

    // Fallback to all athletes if no squad association has been assigned yet
    return matchedSquadAthletes.length > 0 ? matchedSquadAthletes : athletes;
  }, [selectedSession, athletes, teams]);

  return (
    <PageContainer>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Training & Pitch Drills
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Live pitch drill planner and sideline attendance tracker.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Schedule Drill</span>
        </Button>
      </div>

      {/* Filter Controls: Squad Switcher & Status Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Squad Filter Dropdown */}
        <div className="relative min-w-[200px]">
          <select
            value={selectedSquadFilter}
            onChange={(e) => setSelectedSquadFilter(e.target.value)}
            aria-label="Filter training by squad"
            className="w-full appearance-none rounded-xl border border-border/80 bg-card py-2 pl-9 pr-8 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value="ALL">All Squads ({sessions.length})</option>
            {teams.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <Shield
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", "SCHEDULED", "IN PROGRESS", "COMPLETED"].map((tab) => (
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
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-xs text-muted-foreground animate-pulse">
          Loading scheduled training calendar...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center">
          <p className="text-xs text-muted-foreground">
            No training sessions match your selected filters.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="mt-4"
          >
            Schedule Session
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredSessions.map((session) => {
            const isCompleted = session.status === "Completed";
            const inProgress = session.status === "In Progress";

            // Count eligible squad roster size for accurate progress bar
            const squadPlayerCount =
              athletes.filter(
                (a) =>
                  a.teamName === session.squad ||
                  a.teamId === teams.find((t) => t.name === session.squad)?.id
              ).length || session.maxSquadSize || athletes.length;

            const confirmedAttendanceCount = Object.keys(
              session.attendance || {}
            ).length;

            const attendancePercent = squadPlayerCount
              ? Math.min(
                  100,
                  Math.round((confirmedAttendanceCount / squadPlayerCount) * 100)
                )
              : 0;

            return (
              <DashboardCard
                key={session.id}
                accent={isCompleted ? "emerald" : inProgress ? "orange" : "blue"}
                hover
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-border/70 bg-muted/30 px-2 py-0.5 font-mono text-[11px] font-bold text-foreground">
                        {session.squad}
                      </span>
                      <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                        {session.focus}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(session)}
                      className={`inline-flex items-center gap-1 font-mono text-xs font-semibold cursor-pointer rounded-lg px-2 py-0.5 border ${
                        isCompleted
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                          : inProgress
                          ? "border-amber-500/20 bg-amber-500/10 text-amber-500 animate-pulse"
                          : "border-border/60 bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      <CheckCircle2 size={12} />
                      {session.status}
                    </button>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-foreground">
                    {session.title}
                  </h3>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-primary" />
                      <span>
                        {session.date} • {session.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-primary" />
                      <span>{session.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-primary" />
                      <span>{session.pitch}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Flame size={13} className="text-rose-500" />
                      <span>{session.intensity} Strain</span>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-border/60 pt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        Squad Check-In
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {confirmedAttendanceCount} / {squadPlayerCount}
                      </span>
                    </div>
                    <StatBar
                      percent={attendancePercent}
                      className="bg-primary"
                    />
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedSession(session)}
                    className="text-xs gap-1.5"
                  >
                    <UserCheck size={14} />
                    <span>Pitch-Side Check In</span>
                  </Button>
                </div>
              </DashboardCard>
            );
          })}
        </div>
      )}

      {/* Check-In Drawer Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 font-mono text-[10px] font-bold text-foreground">
                    {selectedSession.squad}
                  </span>
                  <h3 className="text-base font-bold text-foreground">
                    Sideline Attendance
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedSession.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted/40"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto divide-y divide-border/40 pr-1">
              {checkInAthletes.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No rostered players found in {selectedSession.squad}.
                </div>
              ) : (
                checkInAthletes.map((athlete) => {
                  const currentAtt =
                    selectedSession.attendance?.[athlete.id] || "Absent";

                  return (
                    <div
                      key={athlete.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {athlete.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {athlete.position}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        {(
                          ["Present", "Late", "Excused", "Absent"] as const
                        ).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              if (selectedSession.id) {
                                handleAttendanceChange(
                                  selectedSession.id,
                                  athlete.id,
                                  status
                                );
                              }
                            }}
                            className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold transition ${
                              currentAtt === status
                                ? status === "Present"
                                  ? "bg-emerald-500 text-white"
                                  : status === "Late"
                                  ? "bg-amber-500 text-white"
                                  : status === "Excused"
                                  ? "bg-blue-500 text-white"
                                  : "bg-rose-500 text-white"
                                : "border border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 flex justify-end pt-3 border-t border-border/40">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setSelectedSession(null)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground">
                Program Pitch Drill
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted/40"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="mt-4 space-y-3.5">
              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                  Drill Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Counter-Press & Rapid Recovery"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Squad Selector Dropdown */}
                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    Target Squad
                  </label>
                  <select
                    value={squad}
                    onChange={(e) => setSquad(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-xs text-foreground focus:outline-none"
                  >
                    {teams.length === 0 ? (
                      <option value="First Team">First Team</option>
                    ) : (
                      teams.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    Focus
                  </label>
                  <select
                    value={focus}
                    onChange={(e) => setFocus(e.target.value as any)}
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
                    Intensity
                  </label>
                  <select
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value as any)}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    Pitch Location
                  </label>
                  <input
                    type="text"
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-xs text-foreground focus:outline-none"
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
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    "Confirm Session"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}