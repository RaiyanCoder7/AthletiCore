import { useEffect, useState } from "react";
import { Activity, Flame, Zap } from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";
import StatBar from "@/components/ui/StatBar";
import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";
import type { TrainingSession } from "@/services/firebase/training";

const trainingTypes = [
  { name: "Strength", color: "bg-purple-500", dot: "bg-purple-500" },
  { name: "Speed", color: "bg-blue-500", dot: "bg-blue-500" },
  { name: "Recovery", color: "bg-rose-500", dot: "bg-rose-500" },
  { name: "Agility", color: "bg-teal-500", dot: "bg-teal-500" },
  { name: "Endurance", color: "bg-orange-500", dot: "bg-orange-500" },
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
        console.error("Failed to load training intensity:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const totalSessions = sessions.length;

  const getPercentage = (type: string) => {
    if (totalSessions === 0) return 0;
    const count = sessions.filter((session) => session.type === type).length;
    return Math.round((count / totalSessions) * 100);
  };

  const mostCommonType = trainingTypes.reduce((current, type) => {
    const currentPercentage = getPercentage(current.name);
    const typePercentage = getPercentage(type.name);
    return typePercentage > currentPercentage ? type : current;
  }, trainingTypes[0]);

  return (
    <DashboardCard accent="orange" hover={false}>
      <SectionHeading
        title="Training Intensity"
        subtitle="Distribution of completed training categories"
        action={
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-2.5 text-orange-600 dark:text-orange-400">
            <Flame size={18} />
          </div>
        }
      />

      {/* Primary Focus Telemetry Box */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-border/80 bg-muted/30 p-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Primary Discipline
            </p>
            <p className="mt-0.5 text-lg font-bold tracking-tight text-foreground">
              {loading ? "..." : totalSessions === 0 ? "No Activity" : mostCommonType.name}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400">
          <Zap size={13} />
          <span>
            {loading
              ? "..."
              : totalSessions === 0
              ? "0%"
              : `${getPercentage(mostCommonType.name)}%`}
          </span>
        </div>
      </div>

      {/* Progress Breakdown Bars */}
      <div className="mt-6 space-y-4">
        {trainingTypes.map((type) => {
          const percentage = getPercentage(type.name);

          return (
            <div
              key={type.name}
              className="rounded-xl border border-border/60 bg-muted/20 p-3 transition-colors hover:border-border/80 hover:bg-muted/40"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${type.dot}`} />
                  <span className="text-xs font-semibold text-foreground">
                    {type.name}
                  </span>
                </div>

                <span className="rounded-md border border-border/60 bg-card px-2 py-0.5 text-xs font-bold text-foreground shadow-2xs">
                  {percentage}%
                </span>
              </div>

              <StatBar percent={percentage} className={type.color} />
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}