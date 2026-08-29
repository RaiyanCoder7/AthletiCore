import {
  Bell,
  CheckCircle2,
  Moon,
  Search,
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
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: "training" | "recovery" | "performance";
  icon: typeof Bell;
}

export default function Navbar() {
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [theme, setTheme] =
    useState<Theme>(getStoredTheme());

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  /* --------------------------------
     Load Profile
  -------------------------------- */

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;

      if (!user) return;

      try {
        const data =
          await getUserProfile(user.uid);

        if (data) {
          setProfile(
            data as UserProfile
          );
        }

        const savedTheme =
          data?.appearance;

        if (
          savedTheme === "Dark" ||
          savedTheme === "Light" ||
          savedTheme === "System"
        ) {
          setTheme(savedTheme);
          applyTheme(savedTheme);
        }
      } catch (error) {
        console.error(
          "Failed to load navbar profile:",
          error
        );
      }
    };

    loadProfile();
  }, []);

  /* --------------------------------
     Theme Synchronization
  -------------------------------- */

  useEffect(() => {
    const handleThemeChange = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent<Theme>;

      const newTheme =
        customEvent.detail;

      if (
        newTheme === "Dark" ||
        newTheme === "Light" ||
        newTheme === "System"
      ) {
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    window.addEventListener(
      "athleticore-theme-change",
      handleThemeChange
    );

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
      theme === "System"
        ? getSystemTheme()
        : theme;

    const newTheme =
      currentEffectiveTheme === "Dark"
        ? "Light"
        : "Dark";

    setTheme(newTheme);
    applyTheme(newTheme);

    window.dispatchEvent(
      new CustomEvent(
        "athleticore-theme-change",
        {
          detail: newTheme,
        }
      )
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

      const [
        trainingSessions,
        todayRecovery,
      ] = await Promise.all([
        getTrainingSessions(user.uid),
        getTodayRecovery(user.uid),
      ]);

      const generated: NotificationItem[] =
        [];

      /* Today's Recovery */

      if (todayRecovery) {
        const recovery =
          todayRecovery.recoveryScore;

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

      today.setHours(
        0,
        0,
        0,
        0
      );

      const upcomingSession =
        trainingSessions
          .filter((session) => {
            if (
              session.status ===
              "Completed"
            ) {
              return false;
            }

            if (
              session.status ===
              "Rest"
            ) {
              return false;
            }

            const sessionDate =
              new Date(
                `${session.date}T00:00:00`
              );

            return sessionDate >= today;
          })
          .sort(
            (a, b) =>
              new Date(
                `${a.date}T00:00:00`
              ).getTime() -
              new Date(
                `${b.date}T00:00:00`
              ).getTime()
          )[0];

      if (upcomingSession) {
        generated.push({
          id: `training-${upcomingSession.id}`,
          title: "Upcoming training",
          description: `${upcomingSession.workout} is scheduled for ${upcomingSession.date}.`,
          type: "training",
          icon: CalendarDays,
        });
      }

      /* Recently Completed */

      const completedSession =
        [...trainingSessions]
          .filter(
            (session) =>
              session.status ===
              "Completed"
          )
          .sort(
            (a, b) =>
              new Date(
                `${b.date}T00:00:00`
              ).getTime() -
              new Date(
                `${a.date}T00:00:00`
              ).getTime()
          )[0];

      if (completedSession) {
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
      console.error(
        "Failed to load notifications:",
        error
      );
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationClick = () => {
    const opening =
      !notificationsOpen;

    setNotificationsOpen(opening);

    if (opening) {
      loadNotifications();
    }
  };

  /* --------------------------------
     User Display
  -------------------------------- */

  const name =
    profile?.name ||
    auth.currentUser?.displayName ||
    "Athlete";

  const role =
    profile?.role ||
    "athlete";

  const initial =
    name.charAt(0).toUpperCase();

  const isDark =
    theme === "System"
      ? getSystemTheme() ===
        "Dark"
      : theme === "Dark";

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-border bg-background px-6 text-foreground">

      {/* Search */}

      <div className="relative w-96">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />

        <input
          type="text"
          placeholder="Search athletes..."
          className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-blue-500"
        />
      </div>

      {/* Right Side */}

      <div className="flex items-center gap-3">

        {/* Notification */}

        <div className="relative">
          <button
            type="button"
            onClick={
              handleNotificationClick
            }
            aria-label="Notifications"
            className="relative rounded-xl border border-border bg-card p-2 text-foreground transition hover:bg-accent"
          >
            <Bell size={20} />

            {notifications.length >
              0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                {notifications.length >
                9
                  ? "9+"
                  : notifications.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">

              {/* Header */}

              <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Notifications
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    Your latest Athleticore updates
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNotificationsOpen(
                      false
                    )
                  }
                  className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Notifications */}

              {loadingNotifications ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length ===
                0 ? (
                <div className="px-4 py-10 text-center">
                  <CheckCircle2
                    className="mx-auto text-emerald-500"
                    size={30}
                  />

                  <p className="mt-3 text-sm font-medium text-foreground">
                    You're all caught up
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    No new notifications.
                  </p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">

                  {notifications.map(
                    (notification) => {
                      const Icon =
                        notification.icon;

                      return (
                        <div
                          key={
                            notification.id
                          }
                          className="flex gap-3 border-b border-border px-4 py-4 transition hover:bg-accent"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                            <Icon size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {
                                notification.title
                              }
                            </p>

                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {
                                notification.description
                              }
                            </p>
                          </div>
                        </div>
                      );
                    }
                  )}

                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme */}

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            isDark
              ? "Switch to light theme"
              : "Switch to dark theme"
          }
          title={
            isDark
              ? "Switch to light theme"
              : "Switch to dark theme"
          }
          className="rounded-xl border border-border bg-card p-2 text-foreground transition hover:bg-accent"
        >
          {isDark ? (
            <Sun size={20} />
          ) : (
            <Moon size={20} />
          )}
        </button>

        {/* User */}

        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
            {initial}
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">
              {name}
            </p>

            <p className="text-xs capitalize text-muted-foreground">
              {role}
            </p>
          </div>

        </div>
      </div>
    </header>
  );
}