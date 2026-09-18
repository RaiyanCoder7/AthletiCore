import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  Trophy,
  Calendar,
  Activity,
  Plus,
  Trash2,
  Clock,
  MapPin,
  X,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageContainer from "@/components/layout/PageContainer";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";
import StatBar from "@/components/ui/StatBar";
import Button from "@/components/ui/Button";

import {
  subscribeToTeamProfile,
  subscribeToTeamMatches,
  scheduleTeamMatch,
  updateTeamRoster,
  recordMatchResult,
} from "@/services/firebase/teams";
import {
  subscribeToAthletes,
  subscribeToTrainingSessions,
} from "@/services/firebase/coach";
import type {
  DetailedTeamProfile,
  TeamMatchFixture,
} from "@/services/firebase/teams";
import type { CoachAthlete, CoachTrainingDoc } from "@/services/firebase/coach";

const PERFORMANCE_TREND = [
  { match: "M1", pace: 80, strain: 52 },
  { match: "M2", pace: 84, strain: 58 },
  { match: "M3", pace: 82, strain: 64 },
  { match: "M4", pace: 88, strain: 48 },
  { match: "M5", pace: 86, strain: 50 },
];

export default function TeamHubPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const [team, setTeam] = useState<DetailedTeamProfile | null>(null);
  const [matches, setMatches] = useState<TeamMatchFixture[]>([]);
  const [allAthletes, setAllAthletes] = useState<CoachAthlete[]>([]);
  const [sessions, setSessions] = useState<CoachTrainingDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "roster" | "performance" | "fixtures" | "training"
  >("roster");

  // Enlist Athlete Modal State
  const [isAddAthleteOpen, setIsAddAthleteOpen] = useState(false);
  const [selectedNewAthleteId, setSelectedNewAthleteId] = useState("");
  const [isEnlisting, setIsEnlisting] = useState(false);

  // Schedule Match Modal State
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [opponent, setOpponent] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [competition, setCompetition] =
    useState<TeamMatchFixture["competition"]>("League");
  const [isHome, setIsHome] = useState(true);
  const [isSubmittingMatch, setIsSubmittingMatch] = useState(false);

  // Record Result Modal State
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<TeamMatchFixture | null>(null);
  const [teamScore, setTeamScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [matchNotes, setMatchNotes] = useState("");
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);

  useEffect(() => {
    if (!teamId) return;

    const unsubTeam = subscribeToTeamProfile(teamId, (data) => {
      setTeam(data);
      setLoading(false);
    });
    const unsubMatches = subscribeToTeamMatches(teamId, (data) => setMatches(data));
    const unsubAthletes = subscribeToAthletes((data) => setAllAthletes(data));
    const unsubSessions = subscribeToTrainingSessions((data) => setSessions(data));

    return () => {
      unsubTeam();
      unsubMatches();
      unsubAthletes();
      unsubSessions();
    };
  }, [teamId]);

  // Scoped athlete lists
  const roster = useMemo(() => {
    if (!team) return [];
    return allAthletes.filter((a) => (team.athleteIds || []).includes(a.id));
  }, [team, allAthletes]);

  const unassignedAthletes = useMemo(() => {
    if (!team) return [];
    return allAthletes.filter((a) => !(team.athleteIds || []).includes(a.id));
  }, [team, allAthletes]);

  // Squad-filtered training sessions
  const teamSessions = useMemo(() => {
    if (!team) return [];
    return sessions.filter((s) => s.squad === team.name);
  }, [team, sessions]);

  const handleAddAthlete = async () => {
    if (!team || !selectedNewAthleteId) return;
    setIsEnlisting(true);
    try {
      await updateTeamRoster(team.id, team.name, selectedNewAthleteId, "add");
      setSelectedNewAthleteId("");
      setIsAddAthleteOpen(false);
    } catch (err) {
      console.error("Failed to add athlete to roster:", err);
    } finally {
      setIsEnlisting(false);
    }
  };

  const handleRemoveAthlete = async (athleteId: string) => {
    if (!team) return;
    try {
      await updateTeamRoster(team.id, team.name, athleteId, "remove");
    } catch (err) {
      console.error("Failed to remove athlete from roster:", err);
    }
  };

  const handleScheduleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !opponent.trim()) return;

    setIsSubmittingMatch(true);
    try {
      await scheduleTeamMatch(team.id, {
        opponent: opponent.trim(),
        venue: venue.trim() || team.homeGround || "Home Pitch",
        date: date || new Date().toISOString().split("T")[0],
        time: time || "19:00",
        competition,
        isHome,
        status: "Upcoming",
      });

      setOpponent("");
      setVenue("");
      setDate("");
      setTime("");
      setIsScheduleOpen(false);
    } catch (err) {
      console.error("Failed to schedule fixture:", err);
    } finally {
      setIsSubmittingMatch(false);
    }
  };

  const handleOpenResultModal = (match: TeamMatchFixture) => {
    setSelectedMatch(match);
    setTeamScore(match.score?.team ?? 0);
    setOpponentScore(match.score?.opponent ?? 0);
    setMatchNotes(match.notes || "");
    setIsResultModalOpen(true);
  };

  const handleRecordResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !selectedMatch?.id) return;

    setIsSubmittingResult(true);
    try {
      await recordMatchResult(team.id, selectedMatch.id, {
        teamScore: Number(teamScore),
        opponentScore: Number(opponentScore),
        notes: matchNotes.trim(),
      });
      setIsResultModalOpen(false);
      setSelectedMatch(null);
    } catch (err) {
      console.error("Failed to record match outcome:", err);
    } finally {
      setIsSubmittingResult(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center font-mono text-xs text-muted-foreground animate-pulse">
          Loading team operations and telemetry records...
        </div>
      </PageContainer>
    );
  }

  if (!team) {
    return (
      <PageContainer>
        <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center">
          <p className="text-sm font-semibold text-foreground">Squad profile not found.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/coach/teams")}
            className="mt-4 gap-1.5"
          >
            <ArrowLeft size={13} />
            <span>Return to Squad List</span>
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Return Navigation */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/coach/teams")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to Squads</span>
        </button>
      </div>

      {/* 1. Header Banner */}
      <DashboardCard accent="blue">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              {team.logoUrl ? (
                <img
                  src={team.logoUrl}
                  alt={team.name}
                  className="h-16 w-16 object-contain rounded-xl"
                />
              ) : (
                <Shield size={36} />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                  {team.name}
                </h1>
                <span className="rounded-md border border-border/70 bg-muted/30 px-2 py-0.5 font-mono text-xs font-semibold">
                  {team.code}
                </span>
                <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                  {team.division}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground max-w-xl">
                {team.description || "Active competitive squad managed within AthletiCore."}
              </p>
              <div className="mt-2 flex flex-wrap gap-4 font-mono text-xs text-muted-foreground">
                <span>
                  Head Coach: <strong className="text-foreground">{team.headCoachName || "Unassigned"}</strong>
                </span>
                <span>
                  Home: <strong className="text-foreground">{team.homeGround || "Pitch A"}</strong>
                </span>
                <span>
                  Contracted Roster: <strong className="text-foreground">{roster.length} Players</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-border/70 bg-card px-4 py-2 text-center font-mono">
              <span className="block text-[10px] uppercase text-muted-foreground">Readiness</span>
              <span className="text-xl font-bold text-emerald-500">
                {team.stats?.avgReadiness ?? 85}%
              </span>
            </div>
            <div className="rounded-xl border border-border/70 bg-card px-4 py-2 text-center font-mono">
              <span className="block text-[10px] uppercase text-muted-foreground">Win Rate</span>
              <span className="text-xl font-bold text-foreground">
                {team.stats?.winRatePercent ?? 0}%
              </span>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        {(
          [
            { id: "roster", label: `Squad Roster (${roster.length})`, icon: Users },
            { id: "performance", label: "Performance & Biometrics", icon: Activity },
            { id: "fixtures", label: `Fixtures & Matches (${matches.length})`, icon: Trophy },
            { id: "training", label: `Training Grid (${teamSessions.length})`, icon: Calendar },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB: SQUAD ROSTER */}
      {activeTab === "roster" && (
        <DashboardCard accent="blue" hover={false}>
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <SectionHeading
              title="Registered Squad Lineup"
              subtitle="Athletes currently assigned to this team roster"
            />
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsAddAthleteOpen(true)}
              className="gap-1.5"
            >
              <Plus size={14} />
              <span>Enlist Athlete</span>
            </Button>
          </div>

          <div className="mt-4 divide-y divide-border/40">
            {roster.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No athletes currently registered in this team squad. Click &quot;Enlist Athlete&quot; to assign players.
              </div>
            ) : (
              roster.map((athlete) => (
                <div
                  key={athlete.id}
                  className="py-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 font-mono text-xs font-bold text-primary">
                      {athlete.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{athlete.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {athlete.position} • Age {athlete.age}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono hidden sm:block">
                      <span className="block text-[10px] text-muted-foreground">Readiness</span>
                      <span className="font-bold text-foreground">{athlete.fitnessScore}%</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/coach/athletes/${athlete.id}`)}
                      className="text-xs"
                    >
                      Inspect Profile
                    </Button>

                    <button
                      type="button"
                      title="De-register athlete from squad"
                      onClick={() => handleRemoveAthlete(athlete.id)}
                      className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardCard>
      )}

      {/* TAB: PERFORMANCE & BIOMETRICS */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <DashboardCard accent="emerald">
              <span className="text-xs text-muted-foreground">Pace Output</span>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <span className="text-2xl font-bold">31.4 km/h</span>
                <span className="text-xs text-emerald-500 font-semibold">+4.2%</span>
              </div>
              <StatBar percent={82} className="bg-emerald-500 mt-2" />
            </DashboardCard>

            <DashboardCard accent="blue">
              <span className="text-xs text-muted-foreground">Recovery Clearance</span>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <span className="text-2xl font-bold">89.1%</span>
                <span className="text-xs text-blue-500 font-semibold">Optimal</span>
              </div>
              <StatBar percent={89} className="bg-blue-500 mt-2" />
            </DashboardCard>

            <DashboardCard accent="indigo">
              <span className="text-xs text-muted-foreground">Neuromuscular Strain</span>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <span className="text-2xl font-bold">54.0 pts</span>
                <span className="text-xs text-indigo-500 font-semibold">Managed</span>
              </div>
              <StatBar percent={54} className="bg-indigo-500 mt-2" />
            </DashboardCard>

            <DashboardCard accent="rose">
              <span className="text-xs text-muted-foreground">Triage Warnings</span>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <span className="text-2xl font-bold text-rose-500">
                  {roster.filter((a) => a.status === "Critical").length}
                </span>
                <span className="text-xs text-rose-500 font-semibold">Flagged</span>
              </div>
              <StatBar percent={12} className="bg-rose-500 mt-2" />
            </DashboardCard>
          </div>

          <DashboardCard accent="emerald" hover={false}>
            <SectionHeading
              title="Team Performance Trajectory"
              subtitle="Matchday sprint pacing vs fatigue over recent fixtures"
            />
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PERFORMANCE_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="team-pace-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="currentColor" strokeOpacity={0.06} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="match" stroke="currentColor" opacity={0.4} tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="currentColor" opacity={0.4} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="pace" stroke="#10b981" strokeWidth={2.5} fill="url(#team-pace-grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </div>
      )}

      {/* TAB: FIXTURES & MATCHES */}
      {activeTab === "fixtures" && (
        <DashboardCard accent="blue" hover={false}>
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <SectionHeading
              title="Competitive Fixture Calendar"
              subtitle="Scheduled league games, cups, and match results"
            />
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsScheduleOpen(true)}
              className="gap-1.5"
            >
              <Plus size={14} />
              <span>Schedule Fixture</span>
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {matches.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No fixtures scheduled for {team.name}.
              </div>
            ) : (
              matches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-xl border border-border/70 bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 font-bold text-foreground text-xs font-mono">
                      {match.isHome ? "VS" : "@"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground text-sm">{match.opponent}</h4>
                        <span className="rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {match.competition}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ${
                            match.status === "Completed"
                              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                              : "border border-blue-500/20 bg-blue-500/10 text-blue-500"
                          }`}
                        >
                          {match.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {match.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {match.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {match.venue}
                        </span>
                      </div>
                      {match.notes && (
                        <p className="mt-1 text-[11px] text-muted-foreground/80 italic">
                          &quot;{match.notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {match.status === "Completed" && match.score ? (
                      <div className="font-mono text-base font-bold text-foreground bg-muted/30 px-3 py-1 rounded-xl border border-border/60">
                        {match.score.team} - {match.score.opponent}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenResultModal(match)}
                        className="text-xs gap-1.5"
                      >
                        <CheckCircle2 size={13} />
                        <span>Record Result</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardCard>
      )}

      {/* TAB: TRAINING GRID */}
      {activeTab === "training" && (
        <DashboardCard accent="indigo" hover={false}>
          <SectionHeading
            title="Team Training Grid"
            subtitle={`Pitch drills programmed specifically for ${team.name}`}
          />
          <div className="mt-4 divide-y divide-border/40">
            {teamSessions.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No active training sessions scheduled for this squad.
              </div>
            ) : (
              teamSessions.map((session) => (
                <div key={session.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground">{session.title}</p>
                    <p className="text-muted-foreground">
                      {session.focus} • {session.duration} • {session.pitch}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span>{session.date}</span>
                    <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary font-semibold">
                      {session.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardCard>
      )}

      {/* Enlist Athlete Drawer Modal */}
      {isAddAthleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground">Enlist Athlete into {team.name}</h3>
              <button
                type="button"
                onClick={() => setIsAddAthleteOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted/40"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block font-mono text-[11px] uppercase text-muted-foreground">
                Select Available Athlete
              </label>
              <select
                value={selectedNewAthleteId}
                onChange={(e) => setSelectedNewAthleteId(e.target.value)}
                className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-foreground focus:outline-none"
              >
                <option value="">Choose an unassigned athlete...</option>
                {unassignedAthletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.position})
                  </option>
                ))}
              </select>

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddAthleteOpen(false)}
                  disabled={isEnlisting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddAthlete}
                  disabled={!selectedNewAthleteId || isEnlisting}
                >
                  {isEnlisting ? (
                    <>
                      <Loader2 size={13} className="animate-spin mr-1.5" />
                      <span>Enlisting...</span>
                    </>
                  ) : (
                    "Confirm Assignment"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Match Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground">Schedule Match Fixture</h3>
              <button
                type="button"
                onClick={() => setIsScheduleOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted/40"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleScheduleMatch} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                  Opponent Club
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex United FC"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    Kickoff Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 19:30"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    Competition
                  </label>
                  <select
                    value={competition}
                    onChange={(e) => setCompetition(e.target.value as any)}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-foreground focus:outline-none"
                  >
                    <option value="League">League</option>
                    <option value="Cup">Cup</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Playoffs">Playoffs</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    Venue Type
                  </label>
                  <select
                    value={isHome ? "home" : "away"}
                    onChange={(e) => setIsHome(e.target.value === "home")}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-foreground focus:outline-none"
                  >
                    <option value="home">Home Ground</option>
                    <option value="away">Away Ground</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                  Pitch / Stadium Location
                </label>
                <input
                  type="text"
                  placeholder={team.homeGround || "Pitch A - Main Stadium"}
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-foreground focus:outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScheduleOpen(false)}
                  disabled={isSubmittingMatch}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingMatch || !opponent.trim()}
                >
                  {isSubmittingMatch ? "Scheduling..." : "Confirm Fixture"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Match Result Modal */}
      {isResultModalOpen && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Record Match Outcome</h3>
                <p className="text-[11px] text-muted-foreground">vs {selectedMatch.opponent}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsResultModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted/40"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRecordResult} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    {team.name}
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={teamScore}
                    onChange={(e) => setTeamScore(Number(e.target.value))}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    {selectedMatch.opponent}
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={opponentScore}
                    onChange={(e) => setOpponentScore(Number(e.target.value))}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                  Tactical Notes & Observations
                </label>
                <textarea
                  rows={2}
                  placeholder="Key match events, fatigue notes, standout performances..."
                  value={matchNotes}
                  onChange={(e) => setMatchNotes(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-muted/20 p-2.5 text-foreground focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsResultModalOpen(false)}
                  disabled={isSubmittingResult}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingResult}
                >
                  {isSubmittingResult ? (
                    <>
                      <Loader2 size={13} className="animate-spin mr-1.5" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save & Finalize"
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