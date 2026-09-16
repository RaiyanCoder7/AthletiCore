import { useState, useEffect } from "react";
import { X, UserPlus, Loader2, Shield } from "lucide-react";
import Button from "@/components/ui/Button";
import {
  createAthleteRosterEntry,
  subscribeToTeams,
} from "@/services/firebase/coach";
import type { TeamSquadDoc } from "@/services/firebase/coach";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";

type AddAthleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function AddAthleteModal({
  isOpen,
  onClose,
  onSuccess,
}: AddAthleteModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("Center Midfielder");
  const [category, setCategory] = useState<"FWD" | "MID" | "DEF" | "GK">("MID");
  const [age, setAge] = useState<number>(20);
  const [teams, setTeams] = useState<TeamSquadDoc[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToTeams((teamList) => {
      setTeams(teamList);
      if (teamList.length > 0 && !selectedTeamId) {
        setSelectedTeamId(teamList[0].id || "");
      }
    });
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const chosenTeam = teams.find((t) => t.id === selectedTeamId);

      const athleteId = await createAthleteRosterEntry({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        position,
        category,
        age: Number(age) || 20,
        teamId: selectedTeamId || undefined,
        teamName: chosenTeam?.name || undefined,
      });

      // Append athlete to the team's roster array if assigned to a squad
      if (selectedTeamId && athleteId) {
        await updateDoc(doc(db, "teams", selectedTeamId), {
          athleteIds: arrayUnion(athleteId),
        });
      }

      setName("");
      setEmail("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Failed to add athlete:", err);
      setError(err?.message || "Failed to add athlete. Check permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus size={16} />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Add Squad Athlete
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Liam Sterling"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="athlete@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          {/* Squad Assignment */}
          <div>
            <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
              Assign to Squad
            </label>
            <div className="relative">
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full rounded-xl border border-border/80 bg-muted/20 py-2 pl-9 pr-4 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value="">No Squad Assigned (Unattached)</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.division})
                  </option>
                ))}
              </select>
              <Shield
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                Quadrant / Role
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as "FWD" | "MID" | "DEF" | "GK";
                  setCategory(cat);
                  if (cat === "FWD") setPosition("Striker");
                  if (cat === "MID") setPosition("Center Midfielder");
                  if (cat === "DEF") setPosition("Center Back");
                  if (cat === "GK") setPosition("Goalkeeper");
                }}
                className="w-full rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-xs text-foreground focus:outline-none"
              >
                <option value="FWD">Forward (FWD)</option>
                <option value="MID">Midfield (MID)</option>
                <option value="DEF">Defender (DEF)</option>
                <option value="GK">Goalkeeper (GK)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
                Age
              </label>
              <input
                type="number"
                min={14}
                max={45}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
              Assigned Pitch Position
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Left Winger, Defensive Mid"
              className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-foreground focus:outline-none"
            />
          </div>

          <div className="mt-5 flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Enrolling...</span>
                </>
              ) : (
                <span>Confirm Roster Addition</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}