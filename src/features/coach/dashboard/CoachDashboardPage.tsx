import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Dumbbell,
  HeartPulse,
  AlertTriangle,
  Calendar,
  Clock,
  ChevronRight,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  Area,
  AreaChart,
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

import { auth } from "@/services/firebase/firebase";
import { getUserProfile } from "@/services/firebase/users";
import {
  subscribeToAthletes,
  subscribeToTrainingSessions,
} from "@/services/firebase/coach";
import type { CoachAthlete, CoachTrainingDoc } from "@/services/firebase/coach";
import CoachAIInsightsCard from "./CoachAIInsightsCard";

const TREND_DATA = [
  { day: "Mon", fitness: 78 },
  { day: "Tue", fitness: 80 },
  { day: "Wed", fitness: 76 },
  { day: "Thu", fitness: 82 },
  { day: "Fri", fitness: 85 },
  { day: "Sat", fitness: 81 },
  { day: "Sun", fitness: 83 },
];

export default function CoachDashboardPage() {
  const navigate = useNavigate();
  const [coachName, setCoachName] = useState("Coach");
  const [athletes, setAthletes] = useState<CoachAthlete[]>([]);
  const [sessions, setSessions] = useState<CoachTrainingDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get current coach name
    const user = auth.currentUser;
    if (user) {
      getUserProfile(user.uid).then((p) => {
        if (p?.name) setCoachName(p.name);
      });
    }

    // 2. Real-time Firestore Athletes listener
    const unsubAthletes = subscribeToAthletes((data) => {
      setAthletes(data);
      setLoading(false);
    });

    // 3. Real-time Firestore Training Sessions listener
    const unsubSessions = subscribeToTrainingSessions((data) => {
      setSessions(data);
    });

    return () => {
      unsubAthletes();
      unsubSessions();
    };
  }, []);

  // Compute live squad stats
  const totalAthletes = athletes.length;
  const injuredOrCritical = athletes.filter(
    (a) => a.status === "Critical" || a.availability === "Out"
  );
  const avgFitness =
    totalAthletes > 0
      ? Math.round(
          athletes.reduce((acc, curr) => acc + (curr.fitnessScore || 0), 0) /
            totalAthletes
        )
      : 82;

  // Athletes needing attention (Critical or Monitor)
  const attentionList = athletes.filter(
    (a) => a.status === "Critical" || a.status === "Monitor"
  ).slice(0, 5);

  // Next scheduled training session
  const nextSession = sessions[0] || {
    title: "Speed & Positional Agility Circuit",
    time: "5:30 PM – 7:00 PM",
    pitch: "Pitch A - Main Stadium",
    attendeesCount: athletes.length > 0 ? athletes.length - 2 : 18,
  };

  return (
    <PageContainer>
      {/* 1. Greeting & Hero Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Good morning, {coachName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Live telemetry overview from your connected team roster.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/coach/athletes")}
          >
            Manage Roster
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/coach/training")}
          >
            + Create Session
          </Button>
        </div>
      </div>

      {/* 2. Live Squad Metric Tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard accent="blue">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Squad
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold sm:text-3xl">
              {totalAthletes}
            </span>
            <p className="mt-1 text-xs text-muted-foreground">Rostered athletes</p>
          </div>
        </DashboardCard>

        <DashboardCard accent="emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Sessions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Dumbbell size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold sm:text-3xl">
              {sessions.length}
            </span>
            <p className="mt-1 text-xs text-muted-foreground">Drills programmed</p>
          </div>
        </DashboardCard>

        <DashboardCard accent="indigo">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Avg Readiness
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
              <HeartPulse size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold sm:text-3xl">
              {avgFitness}%
            </span>
            <StatBar percent={avgFitness} className="bg-indigo-500" />
          </div>
        </DashboardCard>

        <DashboardCard accent="rose">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Under Triage
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold sm:text-3xl text-rose-500">
              {injuredOrCritical.length}
            </span>
            <p className="mt-1 text-xs text-muted-foreground">Players flagged</p>
          </div>
        </DashboardCard>
      </div>

      {/* 3. Team Readiness Curve & Today's Drill */}
      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardCard className="lg:col-span-2" accent="emerald">
          <SectionHeading
            title="Team Readiness & Performance"
            subtitle="Collective conditioning output across squad (7-Day rolling)"
            action={
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                <TrendingUp size={14} />
                <span>+4.2% vs last cycle</span>
              </div>
            }
          />

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="coach-live-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="currentColor" strokeOpacity={0.06} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="currentColor" opacity={0.4} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} dy={6} />
                <YAxis domain={[50, 100]} stroke="currentColor" opacity={0.4} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
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
                  dataKey="fitness"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#coach-live-grad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        <DashboardCard accent="orange">
          <SectionHeading
            title="Next Training Drill"
            subtitle="Immediate pitch schedule"
          />

          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <h3 className="text-base font-bold text-foreground">
                {nextSession.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Full-squad positional mechanics & transition pace
              </p>

              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-orange-500" />
                  <span>{nextSession.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-orange-500" />
                  <span>{nextSession.attendeesCount} Athletes Cleared</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-orange-500" />
                  <span>{nextSession.pitch}</span>
                </div>
              </div>

              <div className="mt-5">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => navigate("/coach/training")}
                >
                  Manage Sessions
                </Button>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* 4. AI Squad Intelligence */}
      <CoachAIInsightsCard />

      {/* 5. Live Triage Table */}
      <DashboardCard accent="rose">
        <SectionHeading
          title="Athletes Needing Attention"
          subtitle="Real-time triage of players with elevated fatigue index or active flags"
        />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="pb-3 font-semibold">Athlete</th>
                <th className="pb-3 font-semibold">Position</th>
                <th className="pb-3 font-semibold">Readiness</th>
                <th className="pb-3 font-semibold">Flag / Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {attentionList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    All squad members currently within optimal conditioning thresholds.
                  </td>
                </tr>
              ) : (
                attentionList.map((athlete) => {
                  const isCritical = athlete.status === "Critical";

                  return (
                    <tr key={athlete.id} className="group hover:bg-muted/30">
                      <td className="py-3 font-semibold text-foreground">
                        {athlete.name}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {athlete.position}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold font-mono">
                            {athlete.fitnessScore}%
                          </span>
                          <div className="w-16">
                            <StatBar
                              percent={athlete.fitnessScore}
                              className={isCritical ? "bg-rose-500" : "bg-amber-500"}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            isCritical
                              ? "border border-rose-500/20 bg-rose-500/10 text-rose-500"
                              : "border border-amber-500/20 bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          <AlertTriangle size={11} />
                          {athlete.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/coach/athletes/${athlete.id}`)}
                          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                        >
                          <span>Profile</span>
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </PageContainer>
  );
}