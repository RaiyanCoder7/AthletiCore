import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import {
  getUserProfile,
  updateUserProfile,
} from "@/services/firebase/users";

export default function ProfileSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("Athlete");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* -----------------------------
     Load User Profile
  ----------------------------- */

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;

      if (!user) {
        setError(
          "You must be logged in to view your profile."
        );
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(
          user.uid
        );

        if (profile) {
          setName(profile.name || "");
          setEmail(
            profile.email || user.email || ""
          );
          setPhone(profile.phone || "");
          setPosition(
            profile.position || "Athlete"
          );
          setBio(profile.bio || "");
        } else {
          setName(user.displayName || "");
          setEmail(user.email || "");
        }
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error
        );

        setError(
          "Unable to load your profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /* -----------------------------
     Save User Profile
  ----------------------------- */

  const handleSave = async () => {
    const user = auth.currentUser;

    if (!user) {
      setError(
        "You must be logged in to save your profile."
      );
      return;
    }

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateUserProfile(user.uid, {
        name: name.trim(),
        position,
        phone: phone.trim(),
        bio: bio.trim(),
      });

      setSuccess(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to update profile:",
        error
      );

      setError(
        "Unable to save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <SectionHeading
        title="Profile Settings"
        subtitle="Update your personal information"
      />

      <DashboardCard className="mt-6">
        {/* Error Message */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Success Message */}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-zinc-500">
              Loading profile...
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">

              {/* Full Name */}

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Full Name
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Email */}

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />

                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-zinc-800 bg-zinc-900/60 py-3 pl-11 pr-4 text-sm text-zinc-500 outline-none"
                  />
                </div>
              </div>

              {/* Phone */}

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="Enter phone number"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Position */}

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Position
                </label>

                <select
                  value={position}
                  onChange={(e) =>
                    setPosition(e.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                >
                  <option value="Athlete">
                    Athlete
                  </option>

                  <option value="Goalkeeper">
                    Goalkeeper
                  </option>

                  <option value="Defender">
                    Defender
                  </option>

                  <option value="Midfielder">
                    Midfielder
                  </option>

                  <option value="Forward">
                    Forward
                  </option>
                </select>
              </div>
            </div>

            {/* Bio */}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Bio
              </label>

              <textarea
                rows={4}
                value={bio}
                onChange={(e) =>
                  setBio(e.target.value)
                }
                placeholder="Tell us a little about yourself..."
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
              />
            </div>

            {/* Save */}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </DashboardCard>
    </section>
  );
}