import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  UserPlus,
  AlertTriangle,
  Activity,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

import PageContainer from "@/components/layout/PageContainer";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";
import StatBar from "@/components/ui/StatBar";
import Button from "@/components/ui/Button";

import { subscribeToAthletes } from "@/services/firebase/coach";
import type { CoachAthlete } from "@/services/firebase/coach";
import AddAthleteModal from "./AddAthleteModal";

export default function CoachAthletesPage() {
  const navigate = useNavigate();
  const [athletes, setAthletes] = useState<CoachAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAthletes((data) => {
      setAthletes(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredAthletes = useMemo(() => {
    return athletes.filter((athlete) => {
      const matchesSearch =
        athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (athlete.position || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || athlete.status.toUpperCase() === statusFilter;

      const matchesCategory =
        categoryFilter === "ALL" || athlete.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [athletes, searchTerm, statusFilter, categoryFilter]);

  return (
    <PageContainer>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Squad Roster & Readiness
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Live database records of rostered players and recovery telemetry.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="gap-1.5 self-start sm:self-auto"
        >
          <UserPlus size={15} />
          <span>+ Add Athlete</span>
        </Button>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search by name or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-border/80 bg-card py-2 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-border/70 bg-card p-1 text-xs">
            {["ALL", "CRITICAL", "MONITOR", "OPTIMAL"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  statusFilter === status
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center rounded-xl border border-border/70 bg-card p-1 text-xs">
            {["ALL", "FWD", "MID", "DEF", "GK"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  categoryFilter === cat
                    ? "bg-secondary text-secondary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <DashboardCard accent="emerald" hover={false}>
        <SectionHeading
          title="Squad Database"
          subtitle={`Showing ${filteredAthletes.length} of ${athletes.length} registered athletes`}
        />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="pb-3 font-semibold">Athlete</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">Conditioning</th>
                <th className="pb-3 font-semibold">Triage Flag</th>
                <th className="pb-3 font-semibold">Pitch Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground animate-pulse">
                    Connecting to Firestore roster records...
                  </td>
                </tr>
              ) : filteredAthletes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No athlete records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredAthletes.map((athlete) => {
                  const isCritical = athlete.status === "Critical";
                  const isMonitor = athlete.status === "Monitor";

                  return (
                    <tr
                      key={athlete.id}
                      className="group cursor-pointer hover:bg-muted/30"
                      onClick={() => navigate(`/coach/athletes/${athlete.id}`)}
                    >
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">
                            {athlete.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{athlete.name}</p>
                            {athlete.email && (
                              <p className="text-[10px] text-muted-foreground">{athlete.email}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 text-muted-foreground">
                        <span className="rounded-md border border-border/60 bg-muted/20 px-2 py-0.5 font-mono text-[11px]">
                          {athlete.position}
                        </span>
                      </td>

                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold font-mono">
                            {athlete.fitnessScore}%
                          </span>
                          <div className="w-20">
                            <StatBar
                              percent={athlete.fitnessScore}
                              className={
                                isCritical
                                  ? "bg-rose-500"
                                  : isMonitor
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            isCritical
                              ? "border border-rose-500/20 bg-rose-500/10 text-rose-500"
                              : isMonitor
                              ? "border border-amber-500/20 bg-amber-500/10 text-amber-500"
                              : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                          }`}
                        >
                          {isCritical ? (
                            <ShieldAlert size={12} />
                          ) : isMonitor ? (
                            <AlertTriangle size={12} />
                          ) : (
                            <Activity size={12} />
                          )}
                          {athlete.status}
                        </span>
                      </td>

                      <td className="py-3.5">
                        <span
                          className={`font-semibold ${
                            athlete.availability === "Available"
                              ? "text-emerald-500"
                              : athlete.availability === "Questionable"
                              ? "text-amber-500"
                              : "text-rose-500"
                          }`}
                        >
                          ● {athlete.availability}
                        </span>
                      </td>

                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/coach/athletes/${athlete.id}`);
                          }}
                          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                        >
                          <span>Inspect</span>
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

      {/* Add Athlete Modal */}
      <AddAthleteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </PageContainer>
  );
}