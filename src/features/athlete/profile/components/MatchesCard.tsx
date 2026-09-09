import { useEffect, useState } from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import {
  Trophy,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  CalendarDays,
} from "lucide-react";

import { auth } from "@/services/firebase/firebase";

import {
  createAthleteMatch,
  updateAthleteMatch,
  deleteAthleteMatch,
  getAthleteMatches,
  type AthleteMatch,
} from "@/services/firebase/profile";

const emptyForm = {
  opponent: "",
  result: "Win" as AthleteMatch["result"],
  date: "",
  competition: "",
};

export default function MatchesCard() {
  const [matches, setMatches] = useState<AthleteMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] =
    useState<AthleteMatch | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadMatches = async () => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await getAthleteMatches(user.uid);
      setMatches(data);
    } catch (error) {
      console.error("Failed to load matches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const openAddModal = () => {
    setEditingMatch(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (match: AthleteMatch) => {
    setEditingMatch(match);

    setForm({
      opponent: match.opponent ?? "",
      result: match.result ?? "Win",
      date: match.date ?? "",
      competition: match.competition ?? "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingMatch(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    const user = auth.currentUser;

    if (!user) return;

    if (!form.opponent.trim()) {
      alert("Please enter the opponent.");
      return;
    }

    try {
      setSaving(true);

      const data = {
        opponent: form.opponent.trim(),
        result: form.result,
        date: form.date,
        competition: form.competition.trim(),
      };

      if (editingMatch) {
        await updateAthleteMatch(
          user.uid,
          editingMatch.id,
          data
        );
      } else {
        await createAthleteMatch(user.uid, data);
      }

      await loadMatches();
      closeModal();
    } catch (error) {
      console.error("Failed to save match:", error);
      alert("Failed to save match. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (matchId: string) => {
    const user = auth.currentUser;

    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this match?"
    );

    if (!confirmed) return;

    try {
      await deleteAthleteMatch(user.uid, matchId);

      setMatches((current) =>
        current.filter((match) => match.id !== matchId)
      );
    } catch (error) {
      console.error("Failed to delete match:", error);
      alert("Failed to delete match. Please try again.");
    }
  };

  const wins = matches.filter(
    (match) => match.result === "Win"
  ).length;

  const draws = matches.filter(
    (match) => match.result === "Draw"
  ).length;

  const losses = matches.filter(
    (match) => match.result === "Loss"
  ).length;

  return (
    <>
      <DashboardCard hover accent="blue">
        <div className="flex items-start justify-between gap-4">
          <SectionHeading
            title="Matches"
            subtitle="Match history and results"
          />

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Plus size={17} />
            Add Match
          </button>
        </div>

        {!loading && matches.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">
                Wins
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-500">
                {wins}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">
                Draws
              </p>

              <p className="mt-1 text-2xl font-bold text-yellow-500">
                {draws}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">
                Losses
              </p>

              <p className="mt-1 text-2xl font-bold text-red-500">
                {losses}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Loading matches...
              </p>
            </div>
          ) : matches.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Trophy size={24} />
              </div>

              <h4 className="mt-4 font-semibold text-card-foreground">
                No matches yet
              </h4>

              <p className="mt-2 text-sm text-muted-foreground">
                Add your first match to start building your
                match history.
              </p>

              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Add Your First Match
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => {
                const resultClass =
                  match.result === "Win"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : match.result === "Loss"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-yellow-500/10 text-yellow-500";

                return (
                  <div
                    key={match.id}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Trophy size={20} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate font-semibold text-card-foreground">
                            vs {match.opponent}
                          </h4>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${resultClass}`}
                          >
                            {match.result}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {match.competition && (
                            <span>
                              {match.competition}
                            </span>
                          )}

                          {match.date && (
                            <span className="flex items-center gap-1">
                              <CalendarDays size={12} />
                              {match.date}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(match)
                        }
                        aria-label="Edit match"
                        className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(match.id)
                        }
                        aria-label="Delete match"
                        className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DashboardCard>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {editingMatch
                    ? "Edit Match"
                    : "Add Match"}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {editingMatch
                    ? "Update your match details."
                    : "Add a match to your profile."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Opponent
                </label>

                <input
                  type="text"
                  value={form.opponent}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      opponent: e.target.value,
                    })
                  }
                  placeholder="e.g. Hyderabad FC"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Result
                  </label>

                  <select
                    value={form.result}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        result:
                          e.target.value as AthleteMatch["result"],
                      })
                    }
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:border-primary"
                  >
                    <option value="Win">Win</option>
                    <option value="Draw">Draw</option>
                    <option value="Loss">Loss</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Date
                  </label>

                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        date: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Competition
                </label>

                <input
                  type="text"
                  value={form.competition}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      competition: e.target.value,
                    })
                  }
                  placeholder="e.g. University League"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check size={17} />
                {saving
                  ? "Saving..."
                  : editingMatch
                  ? "Update Match"
                  : "Save Match"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}