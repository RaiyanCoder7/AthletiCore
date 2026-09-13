import {
  Bell,
  CheckCircle2,
  Menu,
  Moon,
  Sun,
  CalendarDays,
  HeartPulse,
  Trophy,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";

import { auth } from "@/services/firebase/firebase";
import { getUserProfile } from "@/services/firebase/users";
import { getTrainingSessions } from "@/services/firebase/training";
import { getTodayRecovery } from "@/services/firebase/recovery";

import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  type Theme,
} from "@/services/theme";

interface UserProfile {
  name?: string;
  role?: string;
  trainingReminders?: boolean;
  performanceUpdates?: boolean;
  recoveryTracking?: boolean;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: "training" | "recovery" | "performance";
  icon: typeof Bell;
}

type NavbarProps = {
  onMenuClick: () => void;
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<Theme>(getStoredTheme());
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  /* --------------------------------
      Load Profile
  -------------------------------- */
  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const data = await getUserProfile(user.uid);
        if (data) {
          setProfile(data as UserProfile);
        }

        const savedTheme = data?.appearance;
        if (
          savedTheme === "Dark" ||
          savedTheme === "Light" ||
          savedTheme === "System"
        ) {
          setTheme(savedTheme);
          applyTheme(savedTheme);
        }
      } catch (error) {
        console.error("Failed to load navbar profile:", error);
      }
    };

    loadProfile();
  }, []);

  /* --------------------------------
      Theme Synchronization
  -------------------------------- */
  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<Theme>;
      const newTheme = customEvent.detail;

      if (
        newTheme === "Dark" ||
        newTheme === "Light" ||
        newTheme === "System"
      ) {
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    window.addEventListener("athleticore-theme-change", handleThemeChange);

    return () => {
      window.removeEventListener(
        "athleticore-theme-change",
        handleThemeChange
      );
    };
  }, []);

  /* --------------------------------
      Theme Toggle
  -------------------------------- */
  const toggleTheme = () => {
    const currentEffectiveTheme =
      theme === "System" ? getSystemTheme() : theme;

    const newTheme = currentEffectiveTheme === "Dark" ? "Light" : "Dark";

    setTheme(newTheme);
    applyTheme(newTheme);

    window.dispatchEvent(
      new CustomEvent("athleticore-theme-change", {
        detail: newTheme,
      })
    );
  };

  /* --------------------------------
      Notifications
  -------------------------------- */
  const loadNotifications = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoadingNotifications(true);

      const [trainingSessions, todayRecovery] = await Promise.all([
        getTrainingSessions(user.uid),
        getTodayRecovery(user.uid),
      ]);

      const generated: NotificationItem[] = [];

      /* Today's Recovery */
      if (todayRecovery && profile?.recoveryTracking !== false) {
        const recovery = todayRecovery.recoveryScore;
        generated.push({
          id: "recovery-today",
          title: "Recovery updated",
          description: `Today's recovery score is ${recovery}%.`,
          type: "recovery",
          icon: HeartPulse,
        });
      }

      /* Upcoming Training */
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingSession = trainingSessions
        .filter((session) => {
          if (session.status === "Completed" || session.status === "Rest") {
            return false;
          }
          const sessionDate = new Date(`${session.date}T00:00:00`);
          return sessionDate >= today;
        })
        .sort(
          (a, b) =>
            new Date(`${a.date}T00:00:00`).getTime() -
            new Date(`${b.date}T00:00:00`).getTime()
        )[0];

      if (upcomingSession && profile?.trainingReminders !== false) {
        generated.push({
          id: `training-${upcomingSession.id}`,
          title: "Upcoming training",
          description: `${upcomingSession.workout} is scheduled for ${upcomingSession.date}.`,
          type: "training",
          icon: CalendarDays,
        });
      }

      /* Recently Completed */
      const completedSession = [...trainingSessions]
        .filter((session) => session.status === "Completed")
        .sort(
          (a, b) =>
            new Date(`${b.date}T00:00:00`).getTime() -
            new Date(`${a.date}T00:00:00`).getTime()
        )[0];

      if (completedSession && profile?.performanceUpdates !== false) {
        generated.push({
          id: `completed-${completedSession.id}`,
          title: "Workout completed",
          description: `You completed ${completedSession.workout}.`,
          type: "performance",
          icon: Trophy,
        });
      }

      setNotifications(generated);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationClick = () => {
    const opening = !notificationsOpen;
    setNotificationsOpen(opening);
    if (opening) {
      loadNotifications();
    }
  };

  /* --------------------------------
      User Display
  -------------------------------- */
  const name = profile?.name || auth.currentUser?.displayName || "Athlete";
  const role = profile?.role || "athlete";
  const initial = name.charAt(0).toUpperCase();

  const isDark =
    theme === "System" ? getSystemTheme() === "Dark" : theme === "Dark";

  return (
    <header className="relative z-50 flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#070B0E]/90 px-6 backdrop-blur-xl text-neutral-100 selection:bg-[#4ADE80] selection:text-black">
      {/* Left side: Menu trigger */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0B1017] text-neutral-400 transition hover:border-white/20 hover:text-white"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Right Side: Notifications, Theme Switch, Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={handleNotificationClick}
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0B1017] text-neutral-400 transition hover:border-white/20 hover:text-white"
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#22C55E] px-1 font-mono text-[9px] font-black text-black shadow-[0_0_8px_rgba(34,197,94,0.6)]">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 top-14 z-50 w-80 sm:w-96 overflow-hidden rounded-2xl border border-white/10 bg-[#0B1017] shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3.5">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Telemetry Alerts
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Squad and conditioning diagnostics
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="rounded-lg p-1 text-neutral-500 hover:bg-white/5 hover:text-white transition"
                >
                  <X size={16} />
                </button>
              </div>

              {loadingNotifications ? (
                <div className="px-4 py-10 text-center text-xs text-neutral-500">
                  Retrieving telemetry stream...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <CheckCircle2
                    className="mx-auto text-[#22C55E] drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                    size={28}
                  />
                  <p className="mt-2.5 text-xs font-bold text-white">
                    All telemetry reconciled
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-500">
                    No critical condition alerts pending.
                  </p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.05]">
                  {notifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        className="flex gap-3 px-4 py-3.5 transition hover:bg-white/[0.03]"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E]">
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white">
                            {notification.title}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-400">
                            {notification.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            isDark ? "Switch to light theme" : "Switch to dark theme"
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0B1017] text-neutral-400 transition hover:border-white/20 hover:text-white"
        >
          {isDark ? (
            <Sun size={17} className="text-[#22C55E]" />
          ) : (
            <Moon size={17} />
          )}
        </button>

        {/* User Identity Pill */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0B1017] px-3 py-1.5 transition hover:border-white/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E] text-xs font-black text-black shadow-[0_0_8px_rgba(34,197,94,0.3)]">
            {initial}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-white leading-tight">
              {name}
            </p>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#22C55E] leading-tight">
              {role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}