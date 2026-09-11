import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Loader2,
  Monitor,
  Moon,
  Save,
  Sun,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import {
  getUserProfile,
  updateUserProfile,
} from "@/services/firebase/users";

import {
  applyTheme,
  getStoredTheme,
  type Theme,
} from "@/services/theme";

const themes: {
  name: Theme;
  description: string;
  icon: typeof Moon;
}[] = [
  {
    name: "Dark",
    description: "Deep neutral dark contrast for low-light focus",
    icon: Moon,
  },
  {
    name: "Light",
    description: "High-clarity bright layout for daytime visibility",
    icon: Sun,
  },
  {
    name: "System",
    description: "Automatically synchronizes with your device settings",
    icon: Monitor,
  },
];

export default function AppearanceSettings() {
  const [selectedTheme, setSelectedTheme] =
    useState<Theme>(getStoredTheme());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* --------------------------------
      Load Appearance Preference
  -------------------------------- */

  useEffect(() => {
    let isMounted = true;

    const loadAppearance = async () => {
      const user = auth.currentUser;

      if (!user) {
        if (isMounted) setLoading(false);
        applyTheme(getStoredTheme());
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);

        if (!isMounted) return;

        const savedTheme = profile?.appearance;

        if (
          savedTheme === "Dark" ||
          savedTheme === "Light" ||
          savedTheme === "System"
        ) {
          setSelectedTheme(savedTheme);
          applyTheme(savedTheme);
        } else {
          applyTheme(getStoredTheme());
        }
      } catch (error) {
        console.error("Failed to load appearance preference:", error);
        applyTheme(getStoredTheme());
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAppearance();

    return () => {
      isMounted = false;
    };
  }, []);

  /* --------------------------------
      Select Theme
  -------------------------------- */

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setMessage("");

    // Preview immediately
    applyTheme(theme);

    // Tell Navbar / other components
    window.dispatchEvent(
      new CustomEvent("athleticore-theme-change", {
        detail: theme,
      })
    );
  };

  /* --------------------------------
      Save Appearance
  -------------------------------- */

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

      applyTheme(selectedTheme);

      window.dispatchEvent(
        new CustomEvent("athleticore-theme-change", {
          detail: selectedTheme,
        })
      );

      setMessage("Appearance settings saved successfully.");
    } catch (error) {
      console.error("Failed to save appearance settings:", error);

      setMessage("Unable to save appearance settings. Please try again.");
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

      <DashboardCard className="relative mt-6 overflow-hidden border-border bg-card shadow-xs transition-colors">
        {/* Top Accent Strip (Account & System Settings Theme Strip) */}
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400"
          aria-hidden="true"
        />

        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="mt-0.5 shrink-0" size={16} />
            <span>{message}</span>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 py-2 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-44 animate-pulse rounded-2xl border border-border/50 bg-muted/20 p-5"
              >
                <div className="h-11 w-11 rounded-xl bg-muted/60" />
                <div className="mt-5 h-4 w-20 rounded bg-muted/60" />
                <div className="mt-2 h-3 w-3/4 rounded bg-muted/40" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {themes.map((theme) => {
                const Icon = theme.icon;
                const isSelected = selectedTheme === theme.name;

                return (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => handleThemeSelect(theme.name)}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                        : "border-border bg-muted/30 hover:border-border/80 hover:bg-muted/60"
                    }`}
                  >
                    {/* Selected Badge Indicator */}
                    {isSelected && (
                      <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs animate-in zoom-in-75">
                        <Check size={14} strokeWidth={2.5} />
                      </div>
                    )}

                    <div>
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? "border-primary/20 bg-primary/10 text-primary group-hover:scale-105"
                            : "border-border/60 bg-muted/60 text-muted-foreground group-hover:border-border group-hover:text-foreground"
                        }`}
                      >
                        <Icon size={20} />
                      </div>

                      <h3 className="mt-4 font-semibold tracking-tight text-foreground">
                        {theme.name}
                      </h3>

                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {theme.description}
                      </p>
                    </div>

                    {/* Miniature Theme Mode Graphic Pill */}
                    <div className="mt-5 pt-3 border-t border-border/40">
                      <div
                        className={`h-2 w-full rounded-full transition-colors ${
                          isSelected ? "bg-primary/40" : "bg-muted"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Save Actions */}
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
                    <span>Save Appearance</span>
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