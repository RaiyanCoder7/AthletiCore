import { useState } from "react";
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Dumbbell,
  ChevronRight,
  Search,
  Plus,
  Zap,
  Activity,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";

interface AthleteSummary {
  id: string;
  name: string;
  position: string;
  readiness: number;
  status: "Cleared" | "Modified" | "Rest";
  weeklyCompletion: number;
  lastSession: string;
  sprintSpeed: number;
  stamina: number;
}

const mockSquad: AthleteSummary[] = [
  {
    id: "1",
    name: "Alex Morgan",
    position: "Forward",
    readiness: 88,
    status: "Cleared",
    weeklyCompletion: 92,
    lastSession: "Today, 08:30 AM",
    sprintSpeed: 91,
    stamina: 85,
  },
  {
    id: "2",
    name: "Marcus Rashford",
    position: "Forward",
    readiness: 74,
    status: "Cleared",
    weeklyCompletion: 80,
    lastSession: "Today, 09:15 AM",
    sprintSpeed: 94,
    stamina: 82,
  },
  {
    id: "3",
    name: "Virgil van Dijk",
    position: "Defender",
    readiness: 48,
    status: "Modified",
    weeklyCompletion: 60,
    lastSession: "Yesterday",
    sprintSpeed: 82,
    stamina: 88,
  },
  {
    id: "4",
    name: "Alisson Becker",
    position: "Goalkeeper",
    readiness: 94,
    status: "Cleared",
    weeklyCompletion: 100,
    lastSession: "Today, 07:45 AM",
    sprintSpeed: 70,
    stamina: 89,
  },
  {
    id: "5",
    name: "Kevin De Bruyne",
    position: "Midfielder",
    readiness: 34,
    status: "Rest",
    weeklyCompletion: 45,
    lastSession: "2 days ago",
    sprintSpeed: 79,
    stamina: 74,
  },
];

const squadWorkloadData = [
  { day: "Mon", sessions: 18, intensity: 75 },
  { day: "Tue", sessions: 22, intensity: 82 },
  { day: "Wed", sessions: 15, intensity: 65 },
  { day: "Thu", sessions: 20, intensity: 85 },
  { day: "Fri", sessions: 24, intensity: 90 },
  { day: "Sat", sessions: 12, intensity: 50 },
  { day: "Sun", sessions: 6, intensity: 30 },
];

export default function CoachDashboard() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteSummary | null>(null);

  const filteredSquad = mockSquad.filter((athlete) => {
    const matchesSearch =
      athlete.name.toLowerCase().includes(search.toLowerCase()) ||
      athlete.position.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      selectedStatus === "All" || athlete.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const highFatigueCount = mockSquad.filter((a) => a.readiness < 50).length;
  const avgReadiness = Math.round(
    mockSquad.reduce((acc, curr) => acc + curr.readiness, 0) / mockSquad.length
  );

  return (
    <div className="space-y-6">
      {/* 1. Header & Pulse Metrics */}
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Users size={13} />
              <span>Squad Command Center</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Team Overview & Daily Readiness
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Review live squad biometric strain, program group sessions, and triage fatigue risks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" size="md">
              <Dumbbell size={15} />
              <span>Assign Workout</span>
            </Button>
            <Button variant="primary" size="md">
              <Plus size={15} />
              <span>Add Athlete</span>
            </Button>
          </div>
        </div>

        {/* Pulse KPIs */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <span className="text-xs font-medium text-muted-foreground">Active Roster</span>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {mockSquad.length} <span className="text-xs font-normal text-muted-foreground">players</span>
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <span className="text-xs font-medium text-muted-foreground">Squad Avg Readiness</span>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {avgReadiness}%
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <span className="text-xs font-medium text-muted-foreground">Strain / Rest Alert</span>
            <p className="mt-1 text-2xl font-bold tracking-tight text-amber-500">
              {highFatigueCount} <span className="text-xs font-normal text-muted-foreground">at risk</span>
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <span className="text-xs font-medium text-muted-foreground">Weekly Adherence</span>
            <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-500">
              88%
            </p>
          </div>
        </div>
      </section>

      {/* 2. Workload Telemetry & Team Exertion */}
      <DashboardCard accent="orange" hover={false}>
        <SectionHeading
          title="Squad Workload Distribution"
          subtitle="Cumulative weekly workout completion volume"
        />

        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={squadWorkloadData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
              <XAxis dataKey="day" stroke="currentColor" opacity={0.5} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="currentColor" opacity={0.5} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-xl border border-border/80 bg-card/95 p-2.5 text-xs shadow-xl backdrop-blur-md">
                      <p className="font-semibold text-foreground">{label}</p>
                      <p className="mt-1 text-primary">{payload[0].value} completed sessions</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="sessions" fill="var(--color-primary, #3b82f6)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>

      {/* 3. Squad Availability & Diagnostics Table */}
      <DashboardCard hover={false}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeading
            title="Athlete Availability Matrix"
            subtitle="Today's live recovery index and training clearance"
          />

          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search athlete or position..."
                className="h-9 w-48 rounded-lg border border-border/80 bg-muted/40 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none sm:w-60"
              />
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-muted/40 px-2 py-1">
              <Filter size={12} className="text-muted-foreground" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs text-foreground focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Cleared">Cleared</option>
                <option value="Modified">Modified</option>
                <option value="Rest">Rest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Squad Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/80 text-muted-foreground">
              <tr>
                <th className="pb-3 font-medium">Athlete</th>
                <th className="pb-3 font-medium">Position</th>
                <th className="pb-3 font-medium">Readiness Index</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Adherence</th>
                <th className="pb-3 font-medium">Last Active</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredSquad.map((athlete) => (
                <tr key={athlete.id} className="group hover:bg-muted/30">
                  <td className="py-3.5 font-semibold text-foreground">
                    {athlete.name}
                  </td>
                  <td className="py-3.5 text-muted-foreground">
                    {athlete.position}
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${
                            athlete.readiness >= 75
                              ? "bg-emerald-500"
                              : athlete.readiness >= 50
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${athlete.readiness}%` }}
                        />
                      </div>
                      <span className="font-semibold text-foreground">
                        {athlete.readiness}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        athlete.status === "Cleared"
                          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : athlete.status === "Modified"
                          ? "border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {athlete.status === "Cleared" ? (
                        <CheckCircle2 size={11} />
                      ) : (
                        <AlertTriangle size={11} />
                      )}
                      {athlete.status}
                    </span>
                  </td>
                  <td className="py-3.5 font-medium text-foreground">
                    {athlete.weeklyCompletion}%
                  </td>
                  <td className="py-3.5 text-muted-foreground">
                    {athlete.lastSession}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedAthlete(athlete)}
                      className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary transition hover:underline"
                    >
                      <span>Review</span>
                      <ChevronRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {/* 4. Quick Review Modal for Selected Athlete */}
      {selectedAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Athlete Profile
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {selectedAthlete.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedAthlete.position}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAthlete(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground">Daily Readiness</span>
                <span className="text-sm font-bold text-foreground">
                  {selectedAthlete.readiness}%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground">Sprint Speed Rating</span>
                <span className="text-sm font-bold text-primary">
                  {selectedAthlete.sprintSpeed}%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/30 p-3">
                <span className="text-xs text-muted-foreground">Stamina Index</span>
                <span className="text-sm font-bold text-teal-500">
                  {selectedAthlete.stamina}%
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedAthlete(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedAthlete(null)}
              >
                Modify Prescription
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}