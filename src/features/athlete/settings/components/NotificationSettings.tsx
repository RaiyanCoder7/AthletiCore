import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  Mail,
  Trophy,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import {
  getUserProfile,
  updateUserProfile,
} from "@/services/firebase/users";

type NotificationState = {
  trainingReminders: boolean;
  performanceUpdates: boolean;
  emailNotifications: boolean;
};

export default function NotificationSettings() {
  const [notifications, setNotifications] =
    useState<NotificationState>({
      trainingReminders: true,
      performanceUpdates: true,
      emailNotifications: false,
    });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);

        if (profile) {
          setNotifications({
            trainingReminders:
              profile.trainingReminders ?? true,

            performanceUpdates:
              profile.performanceUpdates ?? true,

            emailNotifications:
              profile.emailNotifications ?? false,
          });
        }
      } catch (error) {
        console.error(
          "Failed to load notification settings:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const toggleNotification = (
    key: keyof NotificationState
  ) => {
    setNotifications((current) => ({
      ...current,
      [key]: !current[key],
    }));

    setMessage("");
  };

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
        trainingReminders:
          notifications.trainingReminders,

        performanceUpdates:
          notifications.performanceUpdates,

        emailNotifications:
          notifications.emailNotifications,
      });

      setMessage("Notification preferences saved.");
    } catch (error) {
      console.error(
        "Failed to save notification settings:",
        error
      );

      setMessage(
        "Unable to save notification preferences."
      );
    } finally {
      setSaving(false);
    }
  };

  const notificationItems = [
    {
      key: "trainingReminders" as const,
      title: "Training Reminders",
      description:
        "Get notified before your scheduled training sessions.",
      icon: CalendarDays,
    },
    {
      key: "performanceUpdates" as const,
      title: "Performance Updates",
      description:
        "Receive updates when your performance metrics change.",
      icon: Trophy,
    },
    {
      key: "emailNotifications" as const,
      title: "Email Notifications",
      description:
        "Receive important Athleticore updates by email.",
      icon: Mail,
    },
  ];

  return (
    <section>
      <SectionHeading
        title="Notifications"
        subtitle="Choose which notifications you want to receive"
      />

      <DashboardCard className="mt-6">
        {loading ? (
          <div className="py-8 text-center">
            <p className="text-sm text-zinc-500">
              Loading notification preferences...
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {notificationItems.map((notification) => {
                const Icon = notification.icon;
                const enabled =
                  notifications[notification.key];

                return (
                  <div
                    key={notification.key}
                    className="flex items-center gap-4 rounded-2xl p-4 transition hover:bg-zinc-800/50"
                  >
                    <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                      <Icon size={20} />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-white">
                        {notification.title}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        {notification.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label={`Toggle ${notification.title}`}
                      onClick={() =>
                        toggleNotification(
                          notification.key
                        )
                      }
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                        enabled
                          ? "bg-blue-600"
                          : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                          enabled
                            ? "right-1"
                            : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-800/30 p-4">
              <Bell
                size={18}
                className="text-zinc-400"
              />

              <p className="text-sm text-zinc-400">
                Notification preferences can be changed
                anytime.
              </p>
            </div>

            {message && (
              <p className="mt-4 text-right text-sm text-emerald-400">
                {message}
              </p>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Notifications"}
              </button>
            </div>
          </>
        )}
      </DashboardCard>
    </section>
  );
}