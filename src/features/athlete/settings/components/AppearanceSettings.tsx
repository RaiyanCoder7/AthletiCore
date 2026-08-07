import { useEffect, useState } from "react";
import {
  Check,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import {
  getUserProfile,
  updateUserProfile,
} from "@/services/firebase/users";

type Theme = "Dark" | "Light" | "System";

const themes: {
  name: Theme;
  description: string;
  icon: typeof Moon;
}[] = [
  {
    name: "Dark",
    description: "Best for low-light environments",
    icon: Moon,
  },
  {
    name: "Light",
    description: "Clean and bright interface",
    icon: Sun,
  },
  {
    name: "System",
    description: "Follow your device settings",
    icon: Monitor,
  },
];

export default function AppearanceSettings() {
  const [selectedTheme, setSelectedTheme] =
    useState<Theme>("Dark");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* -----------------------------
     Load Appearance Preference
  ----------------------------- */

  useEffect(() => {
    const loadAppearance = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);

        if (
          profile?.appearance === "Dark" ||
          profile?.appearance === "Light" ||
          profile?.appearance === "System"
        ) {
          setSelectedTheme(profile.appearance);
        }
      } catch (error) {
        console.error(
          "Failed to load appearance preference:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppearance();
  }, []);

  /* -----------------------------
     Save Appearance Preference
  ----------------------------- */

  const handleSave = async () => {
    const user = auth.currentUser;

    if (!user) {
      setMessage("You must be logged in to save settings.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await updateUserProfile(user.uid, {
        appearance: selectedTheme,
      });

      setMessage("Appearance settings saved successfully.");
    } catch (error) {
      console.error(
        "Failed to save appearance settings:",
        error
      );

      setMessage(
        "Unable to save appearance settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <SectionHeading
        title="Appearance"
        subtitle="Customize how Athleticore looks"
      />

      <DashboardCard className="mt-6">
        {message && (
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-800/30 px-4 py-3 text-sm text-zinc-300">
            {message}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-sm text-zinc-500">
            Loading appearance settings...
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {themes.map((theme) => {
                const Icon = theme.icon;
                const isSelected =
                  selectedTheme === theme.name;

                return (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() =>
                      setSelectedTheme(theme.name)
                    }
                    className={`relative rounded-2xl border p-5 text-left transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-zinc-800 bg-zinc-800/30 hover:border-zinc-700"
                    }`}
                  >
                    {/* Selected */}
                    {isSelected && (
                      <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                        <Check size={14} />
                      </div>
                    )}

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        isSelected
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      <Icon size={21} />
                    </div>

                    <h3 className="mt-4 font-semibold text-white">
                      {theme.name}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      {theme.description}
                    </p>
                  </button>
                );
              })}
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
                  : "Save Appearance"}
              </button>
            </div>
          </>
        )}
      </DashboardCard>
    </section>
  );
}