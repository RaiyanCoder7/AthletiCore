import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Mail,
  Save,
  ShieldAlert,
  Trophy,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getUserProfile, updateUserProfile } from "@/services/firebase/users";

type NotificationState = {
  trainingReminders: boolean;
  performanceUpdates: boolean;
  emailNotifications: boolean;
};

export default function NotificationSettings() {
  const [role, setRole] = useState<"athlete" | "coach" | "manager">("athlete");
  const [notifications, setNotifications] = useState<NotificationState>({
    trainingReminders: true,
    performanceUpdates: true,
    emailNotifications: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      const user = auth.currentUser;
      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        if (!isMounted) return;

        if (profile) {
          const userRole = (profile.role?.toLowerCase() || "athlete") as "athlete" | "coach" | "manager";
          setRole(userRole);

          setNotifications({
            trainingReminders: profile.trainingReminders ?? true,
            performanceUpdates: profile.performanceUpdates ?? true,
            emailNotifications: profile.emailNotifications ?? false,
          });
        }
      } catch (err) {
        console.error("Failed to load notification settings:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleNotification = (key: keyof NotificationState) => {
    setNotifications((current) => ({
      ...current,
      [key]: !current[key],
    }));
    setMessage("");
    setError("");
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to save settings.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await updateUserProfile(user.uid, {
        trainingReminders: notifications.trainingReminders,
        performanceUpdates: notifications.performanceUpdates,
        emailNotifications: notifications.emailNotifications,
      });

      setMessage("Notification preferences saved successfully.");
    } catch (err) {
      console.error("Failed to save notification settings:", err);
      setError("Unable to save notification preferences.");
    } finally {
      setSaving(false);
    }
  };

  const isCoach = role === "coach";

  const notificationItems = isCoach
    ? [
        {
          key: "trainingReminders" as const,
          title: "Session Briefing & Pitch Reminders",
          description: "Receive reminders and pitch location confirmation before scheduled team sessions.",
          icon: CalendarDays,
          categoryColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          activeSwitch: "bg-emerald-500 focus-visible:ring-emerald-500/40",
        },
        {
          key: "performanceUpdates" as const,
          title: "Squad Fatigue & Triage Alerts",
          description: "Get instant alerts whenever an athlete's biometric readiness drops into critical triage.",
          icon: ShieldAlert,
          categoryColor: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
          activeSwitch: "bg-rose-500 focus-visible:ring-rose-500/40",
        },
        {
          key: "emailNotifications" as const,
          title: "Weekly Tactical & Medical Digest",
          description: "Receive a compiled weekly report of team readiness curves, pitch attendance, and injuries.",
          icon: Mail,
          categoryColor: "text-primary bg-primary/10 border-primary/20",
          activeSwitch: "bg-primary focus-visible:ring-primary/40",
        },
      ]
    : [
        {
          key: "trainingReminders" as const,
          title: "Training Reminders",
          description: "Get notified before your scheduled training sessions.",
          icon: CalendarDays,
          categoryColor: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20",
          activeSwitch: "bg-orange-500 focus-visible:ring-orange-500/40",
        },
        {
          key: "performanceUpdates" as const,
          title: "Performance Updates",
          description: "Receive updates when your personal performance metrics change.",
          icon: Trophy,
          categoryColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
          activeSwitch: "bg-amber-500 focus-visible:ring-amber-500/40",
        },
        {
          key: "emailNotifications" as const,
          title: "Email Notifications",
          description: "Receive important AthletiCore announcements and updates by email.",
          icon: Mail,
          categoryColor: "text-primary bg-primary/10 border-primary/20",
          activeSwitch: "bg-primary focus-visible:ring-primary/40",
        },
      ];

  return (
    <section>
      <SectionHeading
        title={isCoach ? "Squad & Tactical Alerts" : "Notifications"}
        subtitle={
          isCoach
            ? "Configure pitch reminders, roster triage alerts, and medical digests"
            : "Choose which notifications you want to receive"
        }
      />

      <DashboardCard className="relative mt-6 overflow-hidden border-border bg-card shadow-xs transition-colors">
        <div
          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
            isCoach
              ? "from-emerald-600 via-teal-500 to-green-400"
              : "from-blue-600 via-indigo-500 to-sky-400"
          }`}
          aria-hidden="true"
        />

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span className="font-semibold">Error:</span>
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="mt-0.5 shrink-0" size={16} />
            <span>{message}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-4 py-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 rounded-2xl border border-border/40 bg-muted/20 p-4"
              >
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-muted/60" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted/60" />
                  <div className="h-3 w-64 animate-pulse rounded bg-muted/40" />
                </div>
                <div className="h-6 w-11 shrink-0 animate-pulse rounded-full bg-muted/50" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {notificationItems.map((item) => {
                const Icon = item.icon;
                const enabled = notifications[item.key];

                return (
                  <div
                    key={item.key}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-muted/20 p-4 transition-all hover:border-border hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 ${item.categoryColor}`}
                      >
                        <Icon size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                          {item.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={`Toggle ${item.title}`}
                      onClick={() => toggleNotification(item.key)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 ${
                        enabled ? item.activeSwitch : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                          enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5">
              <Bell size={16} className="shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isCoach
                  ? "Coaching alerts broadcast real-time updates directly to your pitch device."
                  : "Notification preferences sync automatically to your registered devices and can be adjusted at any time."}
              </p>
            </div>

            <div className="mt-6 flex justify-end border-t border-border/50 pt-5">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-xs transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isCoach
                    ? "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500/30"
                    : "bg-primary hover:bg-primary/90 focus-visible:ring-primary/20"
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Notifications</span>
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