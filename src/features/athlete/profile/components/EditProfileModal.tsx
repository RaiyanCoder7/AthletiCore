import { useEffect, useState } from "react";
import { X } from "lucide-react";

import Button from "@/components/ui/Button";
import { auth } from "@/services/firebase/firebase";
import {
  getUserProfile,
  updateUserProfile,
} from "@/services/firebase/users";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface ProfileForm {
  name: string;
  age: string;
  height: string;
  weight: string;
  position: string;
  team: string;
  dominantFoot: string;
  location: string;
}

const emptyForm: ProfileForm = {
  name: "",
  age: "",
  height: "",
  weight: "",
  position: "",
  team: "",
  dominantFoot: "",
  location: "",
};

export default function EditProfileModal({
  isOpen,
  onClose,
  onSaved,
}: EditProfileModalProps) {
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const loadProfile = async () => {
      const user = auth.currentUser;

      if (!user) return;

      try {
        const profile = await getUserProfile(user.uid);

        if (profile) {
          setForm({
            name: String(profile.name ?? ""),
            age: String(profile.age ?? ""),
            height: String(profile.height ?? ""),
            weight: String(profile.weight ?? ""),
            position: String(profile.position ?? ""),
            team: String(profile.team ?? ""),
            dominantFoot: String(profile.dominantFoot ?? ""),
            location: String(profile.location ?? ""),
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Unable to load profile.");
      }
    };

    loadProfile();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await updateUserProfile(user.uid, {
        name: form.name.trim(),
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
        position: form.position,
        team: form.team.trim(),
        dominantFoot: form.dominantFoot,
        location: form.location.trim(),
      });

      onSaved();
      onClose();
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Unable to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-background shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Edit Profile
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Update your athlete information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6">

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* Name */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-foreground">
                Full Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition focus:border-primary"
              />
            </div>

            {/* Age */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Age
              </label>

              <input
                name="age"
                type="number"
                min="1"
                max="100"
                value={form.age}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition focus:border-primary"
              />
            </div>

            {/* Height */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Height (cm)
              </label>

              <input
                name="height"
                type="number"
                min="50"
                max="250"
                value={form.height}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition focus:border-primary"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Weight (kg)
              </label>

              <input
                name="weight"
                type="number"
                min="20"
                max="300"
                value={form.weight}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition focus:border-primary"
              />
            </div>

            {/* Position */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Position
              </label>

              <select
                name="position"
                value={form.position}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition focus:border-primary"
              >
                <option value="">Select position</option>
                <option value="Goalkeeper">Goalkeeper</option>
                <option value="Defender">Defender</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Winger">Winger</option>
                <option value="Striker">Striker</option>
              </select>
            </div>

            {/* Team */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Team
              </label>

              <input
                name="team"
                value={form.team}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition focus:border-primary"
              />
            </div>

            {/* Dominant Foot */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Dominant Foot
              </label>

              <select
                name="dominantFoot"
                value={form.dominantFoot}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition focus:border-primary"
              >
                <option value="">Select foot</option>
                <option value="Right">Right</option>
                <option value="Left">Left</option>
                <option value="Both">Both</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Location
              </label>

              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                placeholder="City, Country"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition focus:border-primary"
              />
            </div>

          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3 border-t border-border pt-5">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent"
            >
              Cancel
            </button>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>

          </div>
        </form>
      </div>
    </div>
  );
}