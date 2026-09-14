import { useState } from "react";
import { X, Activity, Check, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { updateAthleteWorkload } from "@/services/firebase/coach";

type AdjustWorkloadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  athleteId: string;
  athleteName: string;
  currentClearance: "Full Clearance" | "Conditional" | "Sidelined";
  currentFitnessScore: number;
  coachName: string;
  onUpdated?: () => void;
};

export default function AdjustWorkloadModal({
  isOpen,
  onClose,
  athleteId,
  athleteName,
  currentClearance,
  currentFitnessScore,
  coachName,
  onUpdated,
}: AdjustWorkloadModalProps) {
  const [clearance, setClearance] = useState(currentClearance);
  const [workloadCap, setWorkloadCap] = useState(
    currentClearance === "Sidelined" ? 0 : currentClearance === "Conditional" ? 60 : 100
  );
  const [fitnessScore, setFitnessScore] = useState(currentFitnessScore);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClearanceChange = (val: "Full Clearance" | "Conditional" | "Sidelined") => {
    setClearance(val);
    if (val === "Sidelined") setWorkloadCap(0);
    else if (val === "Conditional") setWorkloadCap(60);
    else setWorkloadCap(100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateAthleteWorkload(athleteId, {
        clearance,
        workloadCapPercent: workloadCap,
        fitnessScore,
        protocolNote: note,
        coachName,
      });

      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update workload:", err);
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
              <Activity size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Adjust Pitch Workload
              </h3>
              <p className="text-[11px] text-muted-foreground">{athleteName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1.5">
              Pitch Clearance Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Full Clearance", "Conditional", "Sidelined"] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => handleClearanceChange(tier)}
                  className={`rounded-xl border p-2 text-center text-xs font-semibold transition ${
                    clearance === tier
                      ? tier === "Full Clearance"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                        : tier === "Conditional"
                        ? "border-amber-500 bg-amber-500/10 text-amber-500"
                        : "border-rose-500 bg-rose-500/10 text-rose-500"
                      : "border-border/70 bg-muted/20 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-muted-foreground uppercase">Workload Intensity Cap</span>
              <span className="font-bold text-foreground">{workloadCap}% Max</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={workloadCap}
              onChange={(e) => setWorkloadCap(Number(e.target.value))}
              className="h-1.5 w-full accent-primary bg-muted/40 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-muted-foreground uppercase">Current Readiness Score</span>
              <span className="font-bold text-foreground">{fitnessScore}%</span>
            </div>
            <input
              type="range"
              min={30}
              max={100}
              step={1}
              value={fitnessScore}
              onChange={(e) => setFitnessScore(Number(e.target.value))}
              className="h-1.5 w-full accent-primary bg-muted/40 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase text-muted-foreground mb-1">
              Protocol Note / Medical Instruction
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Capped at 45 min non-contact drills due to calf strain"
              className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
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
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Check size={13} />
                  <span>Apply Workload Protocol</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}