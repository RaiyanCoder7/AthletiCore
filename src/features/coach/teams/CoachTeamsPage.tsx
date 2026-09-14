import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  Plus,
  Calendar,
  Activity,
  MapPin,
  Trophy,
  ArrowRight,
  X,
} from "lucide-react";

import PageContainer from "@/components/layout/PageContainer";
import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";
import StatBar from "@/components/ui/StatBar";
import Button from "@/components/ui/Button";

interface TeamSquad {
  id: string;
  name: string;
  division: string;
  athleteCount: number;
  avgReadiness: number;
  formation: string;
  homeGround: string;
  nextFixture: {
    opponent: string;
    date: string;
    competition: string;
  };
}

const INITIAL_TEAMS: TeamSquad[] = [
  {
    id: "team-1",
    name: "First Team",
    division: "Premier Division",
    athleteCount: 18,
    avgReadiness: 84,
    formation: "4-3-3 Holding",
    homeGround: "Pitch A - Main Stadium",
    nextFixture: {
      opponent: "Metro United",
      date: "Saturday, 4:00 PM",
      competition: "League Matchday 12",
    },
  },
  {
    id: "team-2",
    name: "Under-21 Squad",
    division: "Development League",
    athleteCount: 22,
    avgReadiness: 79,
    formation: "4-2-3-1 Wide",
    homeGround: "Pitch B - Academy Turf",
    nextFixture: {
      opponent: "City Rovers U21",
      date: "Sunday, 11:00 AM",
      competition: "Reserve Cup Quarterfinal",
    },
  },
  {
    id: "team-3",
    name: "Development Squad",
    division: "Youth Combine",
    athleteCount: 15,
    avgReadiness: 88,
    formation: "3-5-2 Attacking",
    homeGround: "Pitch C - Training Annex",
    nextFixture: {
      opponent: "Regional Select XI",
      date: "Next Wednesday, 5:30 PM",
      competition: "Friendly Showcase",
    },
  },
];

export default function CoachTeamsPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<TeamSquad[]>(INITIAL_TEAMS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for creating a squad
  const [teamName, setTeamName] = useState("");
  const [division, setDivision] = useState("");
  const [formation, setFormation] = useState("4-3-3");
  const [homeGround, setHomeGround] = useState("");

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    const newTeam: TeamSquad = {
      id: `team-${Date.now()}`,
      name: teamName.trim(),
      division: division.trim() || "Regional Tier",
      athleteCount: 0,
      avgReadiness: 85,
      formation,
      homeGround: homeGround.trim() || "Main Training Complex",
      nextFixture: {
        opponent: "TBD",
        date: "Upcoming Schedule Pending",
        competition: "Regular Season",
      },
    };

    setTeams((prev) => [newTeam, ...prev]);
    setTeamName("");
    setDivision("");
    setHomeGround("");
    setIsModalOpen(false);
  };

  return (
    <PageContainer>
      {/* Console Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Squads & Tactical Groups
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Manage squads, track divisional lineups, and monitor squad-wide conditioning readiness.
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

      {/* Squad Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <DashboardCard
            key={team.id}
            accent="emerald"
            hover
            className="flex flex-col justify-between"
          >
            <div>
              {/* Header Title & Badge */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-primary" />
                    <h3 className="text-base font-bold text-foreground">
                      {team.name}
                    </h3>
                  </div>
                  <span className="mt-1 inline-block rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {team.division}
                  </span>
                </div>

                <div className="rounded-xl border border-border/70 bg-card px-2.5 py-1 text-center font-mono">
                  <span className="text-[10px] uppercase text-muted-foreground block">
                    Squad
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {team.athleteCount}
                  </span>
                </div>
              </div>

              {/* Tactical Details */}
              <div className="mt-5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Tactical Shape</span>
                  <span className="font-mono font-semibold text-foreground">
                    {team.formation}
                  </span>
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
                    <span className="font-mono font-bold text-foreground">
                      {team.avgReadiness}%
                    </span>
                  </div>
                  <StatBar
                    percent={team.avgReadiness}
                    className={
                      team.avgReadiness >= 80
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }
                  />
                </div>
              </div>

              {/* Next Fixture Strip */}
              <div className="mt-5 rounded-xl border border-border/60 bg-muted/20 p-3">
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-muted-foreground">
                  <Calendar size={12} className="text-primary" />
                  <span>Next Fixture • {team.nextFixture.competition}</span>
                </div>
                <p className="mt-1 font-semibold text-xs text-foreground">
                  vs {team.nextFixture.opponent}
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {team.nextFixture.date}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(`/coach/athletes?team=${team.id}`)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span>View Squad Lineup</span>
                <ArrowRight size={13} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/coach/training")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Sessions
              </button>
            </div>
          </DashboardCard>
        ))}
      </div>

      {/* Create Squad Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold text-foreground">
                Register New Squad
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="mt-4 space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                  Squad Designation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. U-19 Reserves"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                  League / Tier
                </label>
                <input
                  type="text"
                  placeholder="e.g. Regional Championship"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
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
                    placeholder="e.g. Pitch B"
                    value={homeGround}
                    onChange={(e) => setHomeGround(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
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
                  Confirm Squad
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}