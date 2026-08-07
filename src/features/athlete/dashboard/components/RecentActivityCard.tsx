import { useEffect, useState } from "react";
import {
  Trophy,
  CalendarDays,
  Dumbbell,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";

interface ActivityItem {
  id: string;
  title: string;
  time: string;
  icon: "completed" | "upcoming";
}

export default function RecentActivityCard() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentActivity = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const sessions = await getTrainingSessions(user.uid);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const recentActivities: ActivityItem[] = [];

        /*
         * Completed workouts
         */
        const completedSessions = sessions
          .filter(
            (session) =>
              session.status === "Completed"
          )
          .sort((a, b) =>
            b.date.localeCompare(a.date)
          )
          .slice(0, 2);

        completedSessions.forEach((session) => {
          recentActivities.push({
            id: `completed-${session.id}`,
            title: `Completed ${session.workout}`,
            time: formatActivityDate(session.date),
            icon: "completed",
          });
        });

        /*
         * Upcoming workout
         */
        const upcomingSessions = sessions
          .filter((session) => {
            const sessionDate = new Date(
              `${session.date}T00:00:00`
            );

            return (
              sessionDate >= today &&
              session.status !== "Completed" &&
              session.status !== "Rest"
            );
          })
          .sort((a, b) => {
            const dateComparison =
              a.date.localeCompare(b.date);

            if (dateComparison !== 0) {
              return dateComparison;
            }

            return a.time.localeCompare(b.time);
          })
          .slice(0, 1);

        upcomingSessions.forEach((session) => {
          recentActivities.push({
            id: `upcoming-${session.id}`,
            title: `Upcoming ${session.workout}`,
            time: formatActivityDate(session.date),
            icon: "upcoming",
          });
        });

        /*
         * Keep maximum 3 activities
         */
        setActivities(
          recentActivities.slice(0, 3)
        );
      } catch (error) {
        console.error(
          "Failed to load recent activity:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecentActivity();
  }, []);

  return (
    <DashboardCard className="group" hover>
      <SectionHeading
        title="Recent Activity"
        subtitle="Your latest fitness updates"
      />

      <div className="mt-6 space-y-5">
        {/* Loading */}
        {loading && (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-zinc-500">
              Loading recent activity...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && activities.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/50 p-6 text-center">
            <Dumbbell
              size={28}
              className="mx-auto text-zinc-600"
            />

            <p className="mt-3 font-medium text-white">
              No recent activity
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Your training activity will appear here.
            </p>
          </div>
        )}

        {/* Activities */}
        {!loading &&
          activities.map((activity) => {
            const isCompleted =
              activity.icon === "completed";

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4"
              >
                <div
                  className={`rounded-xl p-3 ${
                    isCompleted
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-indigo-500/10 text-indigo-400"
                  }`}
                >
                  {isCompleted ? (
                    <Trophy size={18} />
                  ) : (
                    <CalendarDays size={18} />
                  )}
                </div>

                <div>
                  <p className="font-medium text-white">
                    {activity.title}
                  </p>

                  <p className="mt-1 text-sm text-zinc-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </DashboardCard>
  );
}

/* --------------------------------
   Date Formatting
-------------------------------- */

function formatActivityDate(
  dateString: string
) {
  const date = new Date(
    `${dateString}T00:00:00`
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(
    yesterday.getDate() - 1
  );

  if (date.getTime() === today.getTime()) {
    return "Today";
  }

  if (
    date.getTime() ===
    yesterday.getTime()
  ) {
    return "Yesterday";
  }

  const difference =
    today.getTime() - date.getTime();

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );

  if (days > 0 && days < 7) {
    return `${days} days ago`;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "short",
    }
  );
}