import { useEffect, useState } from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import {
  Trophy,
  Medal,
  Award,
  Star,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";

import { auth } from "@/services/firebase/firebase";

import {
  createAthleteAchievement,
  updateAthleteAchievement,
  deleteAthleteAchievement,
  getAthleteAchievements,
  type AthleteAchievement,
} from "@/services/firebase/profile";

const emptyForm = {
  title: "",
  description: "",
  type: "trophy" as AthleteAchievement["type"],
  date: "",
};

const iconMap = {
  trophy: Trophy,
  medal: Medal,
  award: Award,
  star: Star,
};

export default function AchievementsCard() {
  const [achievements, setAchievements] = useState<
    AthleteAchievement[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] =
    useState<AthleteAchievement | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadAchievements = async () => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getAthleteAchievements(user.uid);

      setAchievements(data);
    } catch (error) {
      console.error(
        "Failed to load achievements:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const openAddModal = () => {
    setEditingAchievement(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (
    achievement: AthleteAchievement
  ) => {
    setEditingAchievement(achievement);

    setForm({
      title: achievement.title ?? "",
      description: achievement.description ?? "",
      type: achievement.type ?? "trophy",
      date: achievement.date ?? "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingAchievement(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    const user = auth.currentUser;

    if (!user) return;

    if (!form.title.trim()) {
      alert("Please enter an achievement title.");
      return;
    }

    try {
      setSaving(true);

      const data = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        date: form.date,
      };

      if (editingAchievement) {
        await updateAthleteAchievement(
          user.uid,
          editingAchievement.id,
          data
        );
      } else {
        await createAthleteAchievement(
          user.uid,
          data
        );
      }

      await loadAchievements();
      closeModal();
    } catch (error) {
      console.error(
        "Failed to save achievement:",
        error
      );

      alert(
        "Failed to save achievement. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    achievementId: string
  ) => {
    const user = auth.currentUser;

    if (!user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this achievement?"
    );

    if (!confirmed) return;

    try {
      await deleteAthleteAchievement(
        user.uid,
        achievementId
      );

      setAchievements((current) =>
        current.filter(
          (achievement) =>
            achievement.id !== achievementId
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete achievement:",
        error
      );

      alert(
        "Failed to delete achievement. Please try again."
      );
    }
  };

  return (
    <>
      <DashboardCard hover>
        <div className="flex items-start justify-between gap-4">
          <SectionHeading
            title="Achievements"
            subtitle="Career highlights"
          />

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Plus size={17} />
            Add Achievement
          </button>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Loading achievements...
              </p>
            </div>
          ) : achievements.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Trophy size={24} />
              </div>

              <h4 className="mt-4 font-semibold text-card-foreground">
                No achievements yet
              </h4>

              <p className="mt-2 text-sm text-muted-foreground">
                Add your achievements to showcase your
                football career.
              </p>

              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Add Your First Achievement
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.map((achievement) => {
                const Icon =
                  iconMap[
                    achievement.type ?? "trophy"
                  ] ?? Trophy;

                return (
                  <div
                    key={achievement.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon size={20} />
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-semibold text-card-foreground">
                          {achievement.title}
                        </h4>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {achievement.description ||
                            "Achievement unlocked"}
                        </p>

                        {achievement.date && (
                          <p className="mt-1 text-xs text-muted-foreground/70">
                            {achievement.date}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(achievement)
                        }
                        aria-label="Edit achievement"
                        className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(achievement.id)
                        }
                        aria-label="Delete achievement"
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
                  {editingAchievement
                    ? "Edit Achievement"
                    : "Add Achievement"}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {editingAchievement
                    ? "Update your achievement details."
                    : "Add an achievement to your profile."}
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
                  Achievement Title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. University Championship Winner"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the achievement..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Type
                  </label>

                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type:
                          e.target.value as AthleteAchievement["type"],
                      })
                    }
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:border-primary"
                  >
                    <option value="trophy">Trophy</option>
                    <option value="medal">Medal</option>
                    <option value="award">Award</option>
                    <option value="star">Star</option>
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
                {saving ? "Saving..." : "Save Achievement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}