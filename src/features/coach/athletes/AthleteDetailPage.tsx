import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Send,
  Loader2,
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
} from "@/services/firebase/coach";
import type { CoachAthlete } from "@/services/firebase/coach";
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
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

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

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-96 items-center justify-center text-xs text-muted-foreground animate-pulse">
          Loading telemetry and biometrics...
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

      {/* Grid: Biometrics, Trend, & Attributes */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Core Performance Attributes */}
        <DashboardCard accent="emerald" hover={false}>
          <SectionHeading
            title="Physical Attributes"
            subtitle="Telemetry benchmark ratings (0-100)"
          />

          <div className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Sprint Speed</span>
                <span className="font-mono text-foreground">
                  {athlete.metrics?.speed ?? 82}
                </span>
              </div>
              <StatBar percent={athlete.metrics?.speed ?? 82} className="bg-emerald-500" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Strength & Power</span>
                <span className="font-mono text-foreground">
                  {athlete.metrics?.strength ?? 80}
                </span>
              </div>
              <StatBar percent={athlete.metrics?.strength ?? 80} className="bg-blue-500" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Aerobic Endurance</span>
                <span className="font-mono text-foreground">
                  {athlete.metrics?.endurance ?? 84}
                </span>
              </div>
              <StatBar percent={athlete.metrics?.endurance ?? 84} className="bg-amber-500" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Agility & Reactivity</span>
                <span className="font-mono text-foreground">
                  {athlete.metrics?.agility ?? 86}
                </span>
              </div>
              <StatBar percent={athlete.metrics?.agility ?? 86} className="bg-indigo-500" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border/60 pt-4 text-center">
            <div className="rounded-xl bg-muted/20 p-2.5">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                Resting HR
              </span>
              <span className="text-sm font-bold text-foreground">
                {athlete.restingHR}
              </span>
            </div>
            <div className="rounded-xl bg-muted/20 p-2.5">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                Top Speed
              </span>
              <span className="text-sm font-bold text-foreground">
                {athlete.maxVelocity}
              </span>
            </div>
          </div>
        </DashboardCard>

        {/* Right Column: Readiness Curve & Notes */}
        <div className="space-y-6 lg:col-span-2">
          {/* Readiness Curve */}
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
                      <stop offset="5%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0} />
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
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-primary, #3b82f6)"
                    strokeWidth={2.5}
                    fill="url(#athlete-readiness-grad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>

          {/* Coach Notes & Direct Feedback */}
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
              <Button
                type="submit"
                size="sm"
                variant="primary"
                disabled={isSubmittingNote}
                className="gap-1 px-3"
              >
                {isSubmittingNote ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Send size={13} />
                )}
                <span>Log</span>
              </Button>
            </form>

            <div className="mt-4 divide-y divide-border/40">
              {(!athlete.notes || athlete.notes.length === 0) ? (
                <p className="py-4 text-xs text-muted-foreground">
                  No observation notes recorded yet.
                </p>
              ) : (
                athlete.notes.map((note) => (
                  <div key={note.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-foreground">{note.author}</span>
                      <span className="font-mono text-muted-foreground">{note.date}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {note.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </DashboardCard>
        </div>
      </div>

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
    </PageContainer>
  );
}