import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  HeartPulse,
  Flame,
  Shield,
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

import {
  subscribeToAthletes,
  subscribeToTeams,
} from "@/services/firebase/coach";
import type {
  CoachAthlete,
  TeamSquadDoc,
} from "@/services/firebase/coach";

type TimeHorizon = "7D" | "30D" | "3M" | "SEASON";

const TIME_SERIES_DATA: Record<TimeHorizon, Array<{ label: string; conditioning: number; fatigue: number }>> = {
  "7D": [
    { label: "Mon", conditioning: 78, fatigue: 45 },
    { label: "Tue", conditioning: 82, fatigue: 52 },
    { label: "Wed", conditioning: 80, fatigue: 48 },
    { label: "Thu", conditioning: 85, fatigue: 58 },
    { label: "Fri", conditioning: 88, fatigue: 64 },
    { label: "Sat", conditioning: 84, fatigue: 50 },
    { label: "Sun", conditioning: 86, fatigue: 42 },
  ],
  "30D": [
    { label: "W1", conditioning: 76, fatigue: 50 },
    { label: "W2", conditioning: 80, fatigue: 55 },
    { label: "W3", conditioning: 83, fatigue: 49 },
    { label: "W4", conditioning: 86, fatigue: 44 },
  ],
  "3M": [
    { label: "Month 1", conditioning: 74, fatigue: 58 },
    { label: "Month 2", conditioning: 81, fatigue: 52 },
    { label: "Month 3", conditioning: 87, fatigue: 46 },
  ],
  "SEASON": [
    { label: "Pre-Season", conditioning: 68, fatigue: 65 },
    { label: "Early Season", conditioning: 78, fatigue: 54 },
    { label: "Mid Season", conditioning: 85, fatigue: 48 },
    { label: "Current Phase", conditioning: 88, fatigue: 42 },
  ],
};

export default function CoachPerformancePage() {
  const [horizon, setHorizon] = useState<TimeHorizon>("7D");
  const [athletes, setAthletes] = useState<CoachAthlete[]>([]);
  const [teams, setTeams] = useState<TeamSquadDoc[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("ALL");

  useEffect(() => {
    const unsubAthletes = subscribeToAthletes((data) => setAthletes(data));
    const unsubTeams = subscribeToTeams((teamList) => setTeams(teamList));

    return () => {
      unsubAthletes();
      unsubTeams();
    };
  }, []);

  const activeSquad = teams.find((t) => t.id === selectedTeamId);

  // Filter athletes by selected squad
  const scopedAthletes = useMemo(() => {
    if (selectedTeamId === "ALL") return athletes;
    return athletes.filter(
      (a) =>
        a.teamId === selectedTeamId ||
        (activeSquad && a.teamName === activeSquad.name)
    );
  }, [athletes, selectedTeamId, activeSquad]);

  // Dynamic collective metrics computed from scoped athletes
  const squadMetrics = useMemo(() => {
    const count = scopedAthletes.length;
    if (count === 0) {
      return { speed: 80, agility: 80, power: 80, endurance: 80, avgVelocity: 30.5 };
    }

    const totalSpeed = scopedAthletes.reduce((acc, a) => acc + (a.metrics?.speed ?? 80), 0);
    const totalAgility = scopedAthletes.reduce((acc, a) => acc + (a.metrics?.agility ?? 80), 0);
    const totalPower = scopedAthletes.reduce((acc, a) => acc + (a.metrics?.strength ?? 80), 0);
    const totalEndurance = scopedAthletes.reduce((acc, a) => acc + (a.metrics?.endurance ?? 80), 0);

    return {
      speed: Math.round(totalSpeed / count),
      agility: Math.round(totalAgility / count),
      power: Math.round(totalPower / count),
      endurance: Math.round(totalEndurance / count),
      avgVelocity: (28 + (totalSpeed / count) * 0.05).toFixed(1),
    };
  }, [scopedAthletes]);

  // Compute live positional averages from scoped athletes
  const categories: Array<"FWD" | "MID" | "DEF" | "GK"> = ["FWD", "MID", "DEF", "GK"];
  const positionalBreakdown = categories.map((cat) => {
    const groupAthletes = scopedAthletes.filter((a) => a.category === cat);
    const count = groupAthletes.length;

    if (count === 0) {
      return {
        group:
          cat === "FWD"
            ? "Forwards"
            : cat === "MID"
            ? "Midfielders"
            : cat === "DEF"
            ? "Defenders"
            : "Goalkeepers",
        speed: 0,
        stamina: 0,
        power: 0,
        count: 0,
      };
    }

    const avgSpeed = Math.round(
      groupAthletes.reduce((acc, a) => acc + (a.metrics?.speed ?? 80), 0) / count
    );
    const avgStamina = Math.round(
      groupAthletes.reduce((acc, a) => acc + (a.metrics?.endurance ?? 80), 0) / count
    );
    const avgPower = Math.round(
      groupAthletes.reduce((acc, a) => acc + (a.metrics?.strength ?? 80), 0) / count
    );

    return {
      group:
        cat === "FWD"
          ? "Forwards"
          : cat === "MID"
          ? "Midfielders"
          : cat === "DEF"
          ? "Defenders"
          : "Goalkeepers",
      speed: avgSpeed,
      stamina: avgStamina,
      power: avgPower,
      count,
    };
  });

  return (
    <PageContainer>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Team Performance & Biometrics
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Telemetry metrics computed from {scopedAthletes.length} registered {activeSquad ? activeSquad.name : "squad"} athletes.
          </p>
        </div>

        {/* Squad Filter & Time Horizon Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <div className="relative min-w-[170px]">
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              aria-label="Filter performance telemetry by squad"
              className="w-full appearance-none rounded-xl border border-border/80 bg-card py-1.5 pl-8 pr-7 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value="ALL">All Squads</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <Shield
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-primary"
            />
          </div>

          <div className="flex items-center rounded-xl border border-border/70 bg-card p-1 text-xs">
            {(["7D", "30D", "3M", "SEASON"] as TimeHorizon[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setHorizon(tab)}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  horizon === tab
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "7D" ? "7D" : tab === "30D" ? "30D" : tab === "3M" ? "3M" : "Season"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aggregate Biometric Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardCard accent="emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Squad Velocity</span>
            <Zap size={16} className="text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono">
              {squadMetrics.avgVelocity} <span className="text-xs font-normal text-muted-foreground">km/h</span>
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-500">
              <TrendingUp size={12} className="mr-0.5" /> +8.4%
            </span>
          </div>
          <StatBar percent={squadMetrics.speed} className="bg-emerald-500" />
        </DashboardCard>

        <DashboardCard accent="blue">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Reaction & Agility</span>
            <Activity size={16} className="text-blue-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono">
              {squadMetrics.agility} <span className="text-xs font-normal text-muted-foreground">idx</span>
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-500">
              <TrendingUp size={12} className="mr-0.5" /> +12.1%
            </span>
          </div>
          <StatBar percent={squadMetrics.agility} className="bg-blue-500" />
        </DashboardCard>

        <DashboardCard accent="indigo">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Explosive Power</span>
            <Flame size={16} className="text-indigo-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono">
              {squadMetrics.power} <span className="text-xs font-normal text-muted-foreground">pts</span>
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-500">
              <TrendingUp size={12} className="mr-0.5" /> +5.0%
            </span>
          </div>
          <StatBar percent={squadMetrics.power} className="bg-indigo-500" />
        </DashboardCard>

        <DashboardCard accent="rose">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Aerobic Engine</span>
            <HeartPulse size={16} className="text-rose-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono">
              {squadMetrics.endurance} <span className="text-xs font-normal text-muted-foreground">pts</span>
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-rose-500">
              <TrendingDown size={12} className="mr-0.5" /> -3.2%
            </span>
          </div>
          <StatBar percent={squadMetrics.endurance} className="bg-rose-500" />
        </DashboardCard>
      </div>

      {/* Conditioning vs Fatigue Curve */}
      <DashboardCard accent="emerald" hover={false}>
        <SectionHeading
          title="Conditioning vs Fatigue Index"
          subtitle={`Collective readiness for ${activeSquad ? activeSquad.name : "all registered squads"}`}
        />

        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TIME_SERIES_DATA[horizon]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="perf-conditioning-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="perf-fatigue-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="currentColor" strokeOpacity={0.06} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" stroke="currentColor" opacity={0.4} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} dy={6} />
              <YAxis domain={[0, 100]} stroke="currentColor" opacity={0.4} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-xl border border-border/70 bg-card p-3 text-xs shadow-lg">
                      <p className="font-bold text-foreground mb-1.5">{label}</p>
                      <p className="text-emerald-500 font-semibold font-mono">Conditioning: {payload[0]?.value}%</p>
                      <p className="text-rose-500 font-semibold font-mono">Fatigue: {payload[1]?.value}%</p>
                    </div>
                  );
                }}
              />
              <Area type="monotone" dataKey="conditioning" stroke="#10b981" strokeWidth={2.5} fill="url(#perf-conditioning-grad)" />
              <Area type="monotone" dataKey="fatigue" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" fill="url(#perf-fatigue-grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>

      {/* Live Positional Matrix */}
      <DashboardCard accent="blue" hover={false}>
        <SectionHeading
          title="Positional Cohort Distribution"
          subtitle={`Live benchmark ratings across ${scopedAthletes.length} athletes`}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {positionalBreakdown.map((pos) => (
            <div key={pos.group} className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="font-bold text-foreground text-sm">{pos.group}</span>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
                  {pos.count} Athletes
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Speed</span>
                    <span className="font-mono text-foreground">{pos.speed}</span>
                  </div>
                  <StatBar percent={pos.speed} className="bg-emerald-500" />
                </div>

                <div>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Stamina</span>
                    <span className="font-mono text-foreground">{pos.stamina}</span>
                  </div>
                  <StatBar percent={pos.stamina} className="bg-blue-500" />
                </div>

                <div>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Power</span>
                    <span className="font-mono text-foreground">{pos.power}</span>
                  </div>
                  <StatBar percent={pos.power} className="bg-indigo-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </PageContainer>
  );
}