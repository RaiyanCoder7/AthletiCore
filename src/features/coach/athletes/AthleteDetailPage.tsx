import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Send,
  Loader2,
  Target,
  Trophy,
  Activity,
  Plus,
  Calendar,
  Award,
  X,
} from "lucide-react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import PageContainer from "@/components/layout/PageContainer";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";
import StatBar from "@/components/ui/StatBar";
import Button from "@/components/ui/Button";

import {
  getCoachAthleteDetail,
  addAthleteCoachNote,
  subscribeToAthleteGoals,
  subscribeToAthleteAchievements,
  addAthleteGoal,
  awardAthleteAchievement,
  updateAthleteGoalProgress,
} from "@/services/firebase/coach";
import type {
  CoachAthlete,
  AthleteGoalDoc,
  AthleteAchievementDoc,
} from "@/services/firebase/coach";
import AdjustWorkloadModal from "./AdjustWorkloadModal";

const READINESS_HISTORY = [
  { day: "Mon", score: 78 },
  { day: "Tue", score: 82 },
  { day: "Wed", score: 75 },
  { day: "Thu", score: 68 },
  { day: "Fri", score: 64 },
  { day: "Sat", score: 60 },
  { day: "Sun", score: 62 },
];

export default function AthleteDetailPage() {
  const { athleteId } = useParams<{ athleteId: string }>();
  const navigate = useNavigate();

  const [athlete, setAthlete] = useState<CoachAthlete | null>(null);
  const [goals, setGoals] = useState<AthleteGoalDoc[]>([]);
  const [achievements, setAchievements] = useState<AthleteAchievementDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"overview" | "goals" | "achievements">("overview");

  // Coach Note Form
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  // Goal Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalCategory, setGoalCategory] = useState("Tactical");
  const [goalTargetDate, setGoalTargetDate] = useState("");
  const [goalNotes, setGoalNotes] = useState("");
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  // Achievement Modal State
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [achieveTitle, setAchieveTitle] = useState("");
  const [achieveCategory, setAchieveCategory] = useState<"Speed" | "Endurance" | "Matchday" | "Milestone" | "Discipline">("Milestone");
  const [achieveDesc, setAchieveDesc] = useState("");
  const [isSavingAchievement, setIsSavingAchievement] = useState(false);

  const fetchAthlete = async () => {
    if (!athleteId) return;
    try {
      const data = await getCoachAthleteDetail(athleteId);
      setAthlete(data);
    } catch (err) {
      console.error("Failed to load athlete profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthlete();

    if (!athleteId) return;

    const unsubGoals = subscribeToAthleteGoals(athleteId, (data) => setGoals(data));
    const unsubAchievements = subscribeToAthleteAchievements(athleteId, (data) => setAchievements(data));

    return () => {
      unsubGoals();
      unsubAchievements();
    };
  }, [athleteId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !athleteId) return;

    setIsSubmittingNote(true);
    try {
      const savedNote = await addAthleteCoachNote(athleteId, {
        text: newNote.trim(),
        author: "Head Coach",
      });

      setAthlete((prev) =>
        prev
          ? {
              ...prev,
              notes: [savedNote, ...(prev.notes || [])],
            }
          : null
      );
      setNewNote("");
    } catch (err) {
      console.error("Failed to append note:", err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athleteId || !goalTitle.trim()) return;

    setIsSavingGoal(true);
    try {
      await addAthleteGoal(athleteId, {
        title: goalTitle,
        category: goalCategory,
        targetDate: goalTargetDate,
        notes: goalNotes,
        progress: 0,
      });
      setGoalTitle("");
      setGoalNotes("");
      setGoalTargetDate("");
      setIsGoalModalOpen(false);
    } catch (err) {
      console.error("Failed to add goal:", err);
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleCreateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athleteId || !achieveTitle.trim()) return;

    setIsSavingAchievement(true);
    try {
      await awardAthleteAchievement(athleteId, {
        title: achieveTitle,
        description: achieveDesc,
        category: achieveCategory,
      });
      setAchieveTitle("");
      setAchieveDesc("");
      setIsAchievementModalOpen(false);
    } catch (err) {
      console.error("Failed to award achievement:", err);
    } finally {
      setIsSavingAchievement(false);
    }
  };

  const handleQuickProgressUpdate = async (goalId: string, currentProgress: number) => {
    if (!athleteId) return;
    const nextProgress = currentProgress >= 100 ? 0 : Math.min(100, currentProgress + 25);
    await updateAthleteGoalProgress(athleteId, goalId, nextProgress);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-96 items-center justify-center text-xs text-muted-foreground animate-pulse font-mono">
          Loading telemetry, active goals, and achievements...
        </div>
      </PageContainer>
    );
  }

  if (!athlete) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <p className="text-sm font-semibold text-foreground">Athlete record not found.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/coach/athletes")}
            className="mt-4"
          >
            Return to Squad Roster
          </Button>
        </div>
      </PageContainer>
    );
  }

  const clearanceStatus =
    athlete.status === "Critical"
      ? "Sidelined"
      : athlete.status === "Monitor"
      ? "Conditional"
      : "Full Clearance";

  return (
    <PageContainer>
      {/* Return Navigation */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/coach/athletes")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={14} />
          <span>Back to Squad Roster</span>
        </button>
      </div>

      {/* Header Profile Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-mono text-xl font-black text-primary">
            {athlete.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {athlete.name}
              </h1>
              <span className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                {athlete.position}
              </span>
              {athlete.teamName && (
                <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary font-semibold">
                  {athlete.teamName}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {athlete.age} yrs • Height: {athlete.height} • Weight: {athlete.weight}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Clearance Status
            </span>
            <span
              className={`inline-flex items-center gap-1 font-semibold text-xs mt-0.5 ${
                clearanceStatus === "Full Clearance"
                  ? "text-emerald-500"
                  : clearanceStatus === "Conditional"
                  ? "text-amber-500"
                  : "text-rose-500"
              }`}
            >
              {clearanceStatus === "Full Clearance" ? (
                <CheckCircle2 size={13} />
              ) : (
                <AlertTriangle size={13} />
              )}
              {clearanceStatus}
            </span>
          </div>

          <div className="h-8 w-[1px] bg-border/80 hidden sm:block" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdjustOpen(true)}
          >
            Adjust Workload
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
            activeTab === "overview"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity size={14} />
          <span>Biometrics & Notes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("goals")}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
            activeTab === "goals"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Target size={14} />
          <span>Active Goals ({goals.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("achievements")}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
            activeTab === "achievements"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Trophy size={14} />
          <span>Achievements ({achievements.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <DashboardCard accent="emerald" hover={false}>
            <SectionHeading
              title="Physical Attributes"
              subtitle="Telemetry benchmark ratings (0-100)"
            />

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Sprint Speed</span>
                  <span className="font-mono text-foreground">{athlete.metrics?.speed ?? 82}</span>
                </div>
                <StatBar percent={athlete.metrics?.speed ?? 82} className="bg-emerald-500" />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Strength & Power</span>
                  <span className="font-mono text-foreground">{athlete.metrics?.strength ?? 80}</span>
                </div>
                <StatBar percent={athlete.metrics?.strength ?? 80} className="bg-blue-500" />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Aerobic Endurance</span>
                  <span className="font-mono text-foreground">{athlete.metrics?.endurance ?? 84}</span>
                </div>
                <StatBar percent={athlete.metrics?.endurance ?? 84} className="bg-amber-500" />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Agility & Reactivity</span>
                  <span className="font-mono text-foreground">{athlete.metrics?.agility ?? 86}</span>
                </div>
                <StatBar percent={athlete.metrics?.agility ?? 86} className="bg-indigo-500" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border/60 pt-4 text-center">
              <div className="rounded-xl bg-muted/20 p-2.5">
                <span className="text-[10px] uppercase font-mono text-muted-foreground block">Resting HR</span>
                <span className="text-sm font-bold text-foreground">{athlete.restingHR}</span>
              </div>
              <div className="rounded-xl bg-muted/20 p-2.5">
                <span className="text-[10px] uppercase font-mono text-muted-foreground block">Top Speed</span>
                <span className="text-sm font-bold text-foreground">{athlete.maxVelocity}</span>
              </div>
            </div>
          </DashboardCard>

          <div className="space-y-6 lg:col-span-2">
            <DashboardCard accent="blue" hover={false}>
              <SectionHeading
                title="Conditioning & Readiness Curve"
                subtitle="7-Day recovery score fluctuation"
              />

              <div className="mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={READINESS_HISTORY} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="athlete-readiness-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="currentColor" strokeOpacity={0.06} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" stroke="currentColor" opacity={0.4} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} dy={6} />
                    <YAxis domain={[40, 100]} stroke="currentColor" opacity={0.4} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-xl border border-border/70 bg-card p-2 text-xs shadow-md">
                            <p className="font-semibold text-muted-foreground">{label}</p>
                            <p className="font-bold text-foreground">{payload[0].value}% Readiness</p>
                          </div>
                        );
                      }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} fill="url(#athlete-readiness-grad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>

            <DashboardCard accent="indigo" hover={false}>
              <SectionHeading
                title="Coach & Medical Notes"
                subtitle="Observations, pitch performance, and rehab check-ins"
              />

              <form onSubmit={handleAddNote} className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Log observation or feedback for this athlete..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 rounded-xl border border-border/80 bg-card px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <Button type="submit" size="sm" variant="primary" disabled={isSubmittingNote} className="gap-1 px-3">
                  {isSubmittingNote ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>Log</span>
                </Button>
              </form>

              <div className="mt-4 divide-y divide-border/40">
                {!athlete.notes || athlete.notes.length === 0 ? (
                  <p className="py-4 text-xs text-muted-foreground">No observation notes recorded yet.</p>
                ) : (
                  athlete.notes.map((note) => (
                    <div key={note.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-foreground">{note.author}</span>
                        <span className="font-mono text-muted-foreground">{note.date}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </DashboardCard>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE GOALS */}
      {activeTab === "goals" && (
        <DashboardCard accent="blue" hover={false}>
          <div className="flex items-center justify-between">
            <SectionHeading
              title={`${athlete.name}'s Objectives & Goals`}
              subtitle="Real-time developmental and conditioning goals set for this athlete"
            />
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsGoalModalOpen(true)}
              className="gap-1.5"
            >
              <Plus size={14} />
              <span>Add Goal</span>
            </Button>
          </div>

          <div className="mt-5 space-y-3">
            {goals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center">
                <Target size={28} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-semibold text-foreground">No Goals Recorded</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Assign a tactical, conditioning, or recovery target to this athlete.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsGoalModalOpen(true)}
                  className="mt-4 gap-1.5"
                >
                  <Plus size={13} />
                  <span>Assign First Goal</span>
                </Button>
              </div>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-xl border border-border/70 bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">{goal.title}</h4>
                      <span className="rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {goal.category}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ${
                          goal.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                        }`}
                      >
                        {goal.status}
                      </span>
                    </div>
                    {goal.notes && <p className="text-xs text-muted-foreground">{goal.notes}</p>}
                    {goal.targetDate && (
                      <p className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar size={12} className="text-primary" /> Target: {goal.targetDate}
                      </p>
                    )}
                  </div>

                  <div className="min-w-[180px] flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-bold text-foreground">{goal.progress}%</span>
                      </div>
                      <StatBar percent={goal.progress} className={goal.progress >= 100 ? "bg-emerald-500" : "bg-primary"} />
                    </div>

                    <button
                      type="button"
                      title="Advance Progress (+25%)"
                      onClick={() => handleQuickProgressUpdate(goal.id, goal.progress)}
                      className="rounded-lg border border-border/70 bg-muted/20 px-2 py-1 font-mono text-[10px] font-bold text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
                    >
                      +25%
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardCard>
      )}

      {/* TAB 3: ACHIEVEMENTS */}
      {activeTab === "achievements" && (
        <DashboardCard accent="emerald" hover={false}>
          <div className="flex items-center justify-between">
            <SectionHeading
              title={`${athlete.name}'s Achievement Vault`}
              subtitle="Badges, match honors, and verified athletic milestones"
            />
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsAchievementModalOpen(true)}
              className="gap-1.5"
            >
              <Award size={14} />
              <span>Award Badge</span>
            </Button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border/80 p-12 text-center">
                <Trophy size={28} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-semibold text-foreground">No Achievements Logged</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recognize this player's performance milestones, speed records, or leadership.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAchievementModalOpen(true)}
                  className="mt-4 gap-1.5"
                >
                  <Award size={13} />
                  <span>Award First Badge</span>
                </Button>
              </div>
            ) : (
              achievements.map((item) => (
                <div key={item.id} className="rounded-xl border border-border/70 bg-muted/20 p-4 flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Award size={20} />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-emerald-500">{item.category || "Milestone"}</span>
                    <h4 className="text-xs font-bold text-foreground mt-0.5">{item.title}</h4>
                    {item.description && <p className="text-[11px] text-muted-foreground mt-1">{item.description}</p>}
                    {item.dateEarned && <span className="mt-2 inline-block font-mono text-[10px] text-muted-foreground">Awarded {item.dateEarned}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardCard>
      )}

      {/* Adjust Workload Modal */}
      {athleteId && (
        <AdjustWorkloadModal
          isOpen={isAdjustOpen}
          onClose={() => setIsAdjustOpen(false)}
          athleteId={athleteId}
          athleteName={athlete.name}
          currentClearance={clearanceStatus}
          currentFitnessScore={athlete.fitnessScore}
          coachName="Head Coach"
          onUpdated={fetchAthlete}
        />
      )}

      {/* Add Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <Target size={16} />
                </div>
                <h3 className="text-sm font-bold text-foreground">Add Athlete Goal</h3>
              </div>
              <button type="button" onClick={() => setIsGoalModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted/40">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sub-32s Pitch Sprint Circuit"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">Category</label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-foreground focus:outline-none"
                  >
                    <option value="Tactical">Tactical</option>
                    <option value="Conditioning">Conditioning</option>
                    <option value="Technical">Technical</option>
                    <option value="Mental/Rehab">Mental / Rehab</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">Target Date</label>
                  <input
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">Directives / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Key performance indicators or guidelines..."
                  value={goalNotes}
                  onChange={(e) => setGoalNotes(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-muted/20 p-2.5 text-foreground focus:outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsGoalModalOpen(false)} disabled={isSavingGoal}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSavingGoal || !goalTitle.trim()}>
                  {isSavingGoal ? <Loader2 size={13} className="animate-spin" /> : "Save Goal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Award Achievement Modal */}
      {isAchievementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Award size={16} />
                </div>
                <h3 className="text-sm font-bold text-foreground">Award Milestone Badge</h3>
              </div>
              <button type="button" onClick={() => setIsAchievementModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted/40">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateAchievement} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">Badge Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Iron Engine (100% Drill Attendance)"
                  value={achieveTitle}
                  onChange={(e) => setAchieveTitle(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">Category</label>
                <select
                  value={achieveCategory}
                  onChange={(e) => setAchieveCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-foreground focus:outline-none"
                >
                  <option value="Milestone">Milestone</option>
                  <option value="Speed">Speed & Acceleration</option>
                  <option value="Endurance">Endurance & Stamina</option>
                  <option value="Matchday">Matchday Performance</option>
                  <option value="Discipline">Discipline & Leadership</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">Citation / Reason</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Completed 15 consecutive high-intensity sessions without missing a marker."
                  value={achieveDesc}
                  onChange={(e) => setAchieveDesc(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-muted/20 p-2.5 text-foreground focus:outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAchievementModalOpen(false)} disabled={isSavingAchievement}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSavingAchievement || !achieveTitle.trim()}>
                  {isSavingAchievement ? <Loader2 size={13} className="animate-spin" /> : "Award Badge"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}