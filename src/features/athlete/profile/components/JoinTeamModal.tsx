import { useState } from "react";
import { Users, X, Loader2, KeyRound } from "lucide-react";
import Button from "@/components/ui/Button";
import { auth } from "@/services/firebase/firebase";
import { joinTeamWithCode } from "@/services/firebase/coach";

interface JoinTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (teamName: string) => void;
}

export default function JoinTeamModal({
  isOpen,
  onClose,
  onSuccess,
}: JoinTeamModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const result = await joinTeamWithCode(user.uid, code);
      onSuccess(result.teamName);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Invalid squad invite code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users size={16} />
            </div>
            <h3 className="text-sm font-bold text-foreground">Join Squad</h3>
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
            <label className="block font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
              Squad Invite Code
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={8}
                placeholder="e.g. SUP-342"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2.5 text-center font-mono text-base font-bold tracking-widest text-foreground uppercase placeholder:font-normal placeholder:tracking-normal placeholder:text-xs placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <KeyRound
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50"
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Ask your coach for the 6-character team invite code.
            </p>
          </div>

          <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading || !code.trim()}
              className="gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Linking...</span>
                </>
              ) : (
                <span>Confirm Squad</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}