import { useEffect, useState } from "react";
import {
  Activity,
  Flame,
  Zap,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";
import type { TrainingSession } from "@/services/firebase/training";

const trainingTypes = [
  {
    name: "Strength",
    color: "bg-purple-500",
  },
  {
    name: "Speed",
    color: "bg-blue-500",
  },
  {
    name: "Recovery",
    color: "bg-emerald-500",
  },
  {
    name: "Agility",
    color: "bg-cyan-500",
  },
  {
    name: "Endurance",
    color: "bg-orange-500",
  },
];

export default function TrainingIntensityCard() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getTrainingSessions(user.uid);

        setSessions(data);
      } catch (error) {
        console.error(
          "Failed to load training intensity:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const totalSessions = sessions.length;

  const getPercentage = (type: string) => {
    if (totalSessions === 0) {
      return 0;
    }

    const count = sessions.filter(
      (session) => session.type === type
    ).length;

    return Math.round((count / totalSessions) * 100);
  };

  const mostCommonType = trainingTypes.reduce(
    (current, type) => {
      const currentPercentage = getPercentage(current.name);
      const typePercentage = getPercentage(type.name);

      return typePercentage > currentPercentage
        ? type
        : current;
    },
    trainingTypes[0]
  );

  return (
    <DashboardCard accent="orange">
      <SectionHeading
        title="Training Intensity"
        subtitle="Distribution of your training activities"
        action={
          <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500">
            <Flame size={20} />
          </div>
        }
      />

      {/* Current Training Focus */}
      <div className="mt-8 flex items-center justify-between rounded-2xl bg-muted/60 p-5">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500">
            <Activity size={22} />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Current Training Focus
            </p>

            <p className="mt-1 text-2xl font-bold text-foreground">
              {loading
                ? "..."
                : totalSessions === 0
                  ? "No Data"
                  : mostCommonType.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
          <Zap size={16} />

          {loading
            ? "Loading"
            : totalSessions === 0
              ? "No sessions"
              : `${getPercentage(mostCommonType.name)}%`}
        </div>
      </div>

      {/* Training Types */}
      <div className="mt-8 space-y-5">
        {trainingTypes.map((type) => {
          const percentage = getPercentage(type.name);

          return (
            <div key={type.name}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {type.name}
                </span>

                <span className="text-sm font-medium text-foreground">
                  {percentage}%
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${type.color} transition-all duration-500`}
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}