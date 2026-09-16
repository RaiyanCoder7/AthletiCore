import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Plus,
  Calendar,
  MapPin,
  ArrowRight,
  X,
  Loader2,
  Key,
  Copy,
  Check,
} from "lucide-react";

import PageContainer from "@/components/layout/PageContainer";
import DashboardCard from "@/components/ui/DashboardCard";
import StatBar from "@/components/ui/StatBar";
import Button from "@/components/ui/Button";

import { subscribeToTeams, createTeamSquad } from "@/services/firebase/coach";
import type { TeamSquadDoc } from "@/services/firebase/coach";

export default function CoachTeamsPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<TeamSquadDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [teamName, setTeamName] = useState("");
  const [division, setDivision] = useState("");
  const [formation, setFormation] = useState("4-3-3 Holding");
  const [homeGround, setHomeGround] = useState("");

  useEffect(() => {
    const unsub = subscribeToTeams((data) => {
      setTeams(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setIsSubmitting(true);
    try {
      await createTeamSquad({
        name: teamName.trim(),
        division: division.trim() || "Regional League",
        athleteCount: 0,
        avgReadiness: 85,
        formation,
        homeGround: homeGround.trim() || "Pitch A - Main Stadium",
        athleteIds: [],
        nextFixture: {
          opponent: "TBD",
          date: "Upcoming Schedule Pending",
          competition: "League Matchday",
        },
      });

      setTeamName("");
      setDivision("");
      setHomeGround("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create team:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Squads & Tactical Groups
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Live squad rosters, tactical shapes, and matchday readiness.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>+ Create Squad</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-xs text-muted-foreground animate-pulse">
          Connecting to squad database...
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center">
          <Shield size={32} className="mx-auto text-muted-foreground mb-3" />
          <h3 className="text-sm font-semibold text-foreground">No Squads Registered Yet</h3>
          <p className="text-xs text-muted-foreground mt-1">Create your first squad to generate invite codes and link athletes.</p>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="mt-4">
            + Create First Squad
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const squadSize = team.athleteIds ? team.athleteIds.length : team.athleteCount;

            return (
              <DashboardCard
                key={team.id}
                accent="emerald"
                hover
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Shield size={18} className="text-primary" />
                        <h3 className="text-base font-bold text-foreground">{team.name}</h3>
                      </div>
                      <span className="mt-1 inline-block rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                        {team.division}
                      </span>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-card px-2.5 py-1 text-center font-mono">
                      <span className="text-[10px] uppercase text-muted-foreground block">Squad</span>
                      <span className="text-sm font-bold text-foreground">{squadSize}</span>
                    </div>
                  </div>

                  {/* Invite Code Bar */}
                  {team.inviteCode && (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-primary/30 bg-primary/5 px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <Key size={13} className="text-primary" />
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          Invite Code:
                        </span>
                        <span className="font-mono text-xs font-bold text-primary tracking-widest">
                          {team.inviteCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(team.inviteCode!)}
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-primary transition hover:bg-primary/10"
                        title="Copy code for athletes"
                      >
                        {copiedCode === team.inviteCode ? (
                          <>
                            <Check size={11} className="text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="mt-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Tactical Shape</span>
                      <span className="font-mono font-semibold text-foreground">{team.formation}</span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Facility</span>
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <MapPin size={11} className="text-primary" />
                        {team.homeGround}
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <span>Squad Readiness</span>
                        <span className="font-mono font-bold text-foreground">{team.avgReadiness}%</span>
                      </div>
                      <StatBar
                        percent={team.avgReadiness}
                        className={team.avgReadiness >= 80 ? "bg-emerald-500" : "bg-amber-500"}
                      />
                    </div>
                  </div>

                  {team.nextFixture && (
                    <div className="mt-5 rounded-xl border border-border/60 bg-muted/20 p-3">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-muted-foreground">
                        <Calendar size={12} className="text-primary" />
                        <span>{team.nextFixture.competition}</span>
                      </div>
                      <p className="mt-1 font-semibold text-xs text-foreground">vs {team.nextFixture.opponent}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{team.nextFixture.date}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate("/coach/athletes")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>Squad Lineup</span>
                    <ArrowRight size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/coach/training")}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Schedule Drills
                  </button>
                </div>
              </DashboardCard>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground">Register Squad</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted/40"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="mt-4 space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                  Squad Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. First Team, Under-21"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                  Division / Level
                </label>
                <input
                  type="text"
                  placeholder="e.g. Premier Division"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    Formation
                  </label>
                  <select
                    value={formation}
                    onChange={(e) => setFormation(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="4-3-3 Holding">4-3-3 Holding</option>
                    <option value="4-2-3-1 Wide">4-2-3-1 Wide</option>
                    <option value="3-5-2 Attacking">3-5-2 Attacking</option>
                    <option value="4-4-2 Flat">4-4-2 Flat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                    Home Pitch
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pitch A"
                    value={homeGround}
                    onChange={(e) => setHomeGround(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : "Save Squad"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}