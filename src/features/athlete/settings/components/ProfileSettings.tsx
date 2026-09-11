import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Mail,
  Phone,
  Save,
  Shield,
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
    let isMounted = true;

    const loadProfile = async () => {
      const user = auth.currentUser;

      if (!user) {
        if (isMounted) {
          setError("You must be logged in to view your profile.");
          setLoading(false);
        }
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);

        if (!isMounted) return;

        if (profile) {
          setName(profile.name || "");
          setEmail(profile.email || user.email || "");
          setPhone(profile.phone || "");
          setPosition(profile.position || "Athlete");
          setBio(profile.bio || "");
        } else {
          setName(user.displayName || "");
          setEmail(user.email || "");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        if (isMounted) {
          setError("Unable to load your profile. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  /* -----------------------------
      Save User Profile
  ----------------------------- */

  const handleSave = async () => {
    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in to save your profile.");
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

      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Unable to save your profile. Please try again.");
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

      <DashboardCard className="relative mt-6 overflow-hidden border-border bg-card shadow-xs transition-colors">
        {/* Top Accent Strip (Account/Settings: Slate-to-Blue subtle branding strip) */}
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400"
          aria-hidden="true"
        />

        {/* Error Feedback */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Feedback */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="mt-0.5 shrink-0" size={16} />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-6 py-2">
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="h-3.5 w-24 animate-pulse rounded bg-muted/60" />
                  <div className="h-10 w-full animate-pulse rounded-xl bg-muted/40" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-16 animate-pulse rounded bg-muted/60" />
              <div className="h-28 w-full animate-pulse rounded-xl bg-muted/40" />
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Full Name <span className="text-destructive">*</span>
                </label>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
                  />

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    disabled={saving}
                    className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground/70">
                    <Shield size={11} />
                    Managed by Auth
                  </span>
                </div>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50"
                  />

                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-border/60 bg-muted/20 py-2.5 pl-10 pr-4 text-sm text-muted-foreground outline-none opacity-80"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
                  />

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    disabled={saving}
                    className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Position / Role */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Position / Role
                </label>

                <div className="relative">
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    disabled={saving}
                    className="w-full appearance-none rounded-xl border border-border bg-muted/40 py-2.5 pl-4 pr-10 text-sm text-foreground outline-none transition-all hover:bg-muted/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Athlete" className="bg-card text-foreground">
                      Athlete
                    </option>
                    <option value="Goalkeeper" className="bg-card text-foreground">
                      Goalkeeper
                    </option>
                    <option value="Defender" className="bg-card text-foreground">
                      Defender
                    </option>
                    <option value="Midfielder" className="bg-card text-foreground">
                      Midfielder
                    </option>
                    <option value="Forward" className="bg-card text-foreground">
                      Forward
                    </option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bio
              </label>

              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={saving}
                placeholder="Tell us a little about your athletic journey, training focus, or current targets..."
                className="w-full resize-none rounded-xl border border-border bg-muted/40 p-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end border-t border-border/50 pt-5">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </DashboardCard>
    </section>
  );
}