import { useEffect, useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Dumbbell,
  Target,
  Activity,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getTrainingSessions } from "@/services/firebase/training";
import { getLatestPerformanceTest } from "@/services/firebase/performance";

interface Insight {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function AIPerformanceInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [
          trainingSessions,
          performance,
        ] = await Promise.all([
          getTrainingSessions(user.uid),
          getLatestPerformanceTest(user.uid),
        ]);

        const generatedInsights: Insight[] = [];

        /* -----------------------------
           Performance Insight
        ----------------------------- */

        if (performance) {
          const scores = [
            performance.sprintSpeed,
            performance.strength,
            performance.stamina,
            performance.agility,
            performance.accuracy,
            performance.endurance,
          ];

          const average =
            scores.reduce(
              (total, score) => total + score,
              0
            ) / scores.length;

          const weakestSkill = Math.min(
            ...scores
          );

          const weakestSkillIndex =
            scores.indexOf(weakestSkill);

          const skillNames = [
            "Sprint Speed",
            "Strength",
            "Stamina",
            "Agility",
            "Accuracy",
            "Endurance",
          ];

          generatedInsights.push({
            title: "Performance Overview",
            description: `Your latest overall performance score is ${Math.round(
              average
            )}%.`,
            icon: <TrendingUp size={18} />,
            color:
              "bg-blue-500/10 text-blue-400",
          });

          generatedInsights.push({
            title: "Focus Area",
            description: `${skillNames[weakestSkillIndex]} is currently your lowest performance area at ${weakestSkill}%. Consider giving extra attention to this area during training.`,
            icon: <Target size={18} />,
            color:
              "bg-yellow-500/10 text-yellow-400",
          });
        }

        /* -----------------------------
           Training Insight
        ----------------------------- */

        const completedSessions =
          trainingSessions.filter(
            (session) =>
              session.status === "Completed"
          );

        if (completedSessions.length > 0) {
          const totalMinutes =
            completedSessions.reduce(
              (total, session) => {
                const match =
                  session.duration.match(
                    /\d+/
                  );

                if (!match) {
                  return total;
                }

                return (
                  total +
                  Number(match[0])
                );
              },
              0
            );

          generatedInsights.push({
            title: "Training Activity",
            description: `You have completed ${completedSessions.length} training session${
              completedSessions.length === 1
                ? ""
                : "s"
            } for a total of approximately ${totalMinutes} minutes.`,
            icon: <Dumbbell size={18} />,
            color:
              "bg-emerald-500/10 text-emerald-400",
          });
        } else {
          generatedInsights.push({
            title: "Training Activity",
            description:
              "No completed training sessions have been recorded yet. Complete a session to start building your training insights.",
            icon: <Dumbbell size={18} />,
            color:
              "bg-blue-500/10 text-blue-400",
          });
        }

        /* -----------------------------
           Training Consistency
        ----------------------------- */

        const scheduledSessions =
          trainingSessions.filter(
            (session) =>
              session.status !== "Rest"
          );

        if (scheduledSessions.length > 0) {
          const completionRate = Math.round(
            (completedSessions.length /
              scheduledSessions.length) *
              100
          );

          generatedInsights.push({
            title: "Training Consistency",
            description: `You have completed ${completionRate}% of your recorded training sessions. ${
              completionRate >= 80
                ? "Your consistency is looking strong."
                : "Try to maintain a more consistent training routine."
            }`,
            icon: <Activity size={18} />,
            color:
              "bg-purple-500/10 text-purple-400",
          });
        }

        setInsights(generatedInsights);
      } catch (error) {
        console.error(
          "Failed to generate performance insights:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  return (
    <DashboardCard>
      <SectionHeading
        title="AI Performance Insights"
        subtitle="Personalised recommendations"
        action={
          <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
            <Sparkles size={20} />
          </div>
        }
      />

      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-zinc-500">
              Analysing your performance...
            </p>
          </div>
        ) : insights.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-center">
            <p className="text-zinc-500">
              Not enough data to generate insights.
            </p>
          </div>
        ) : (
          insights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-800/60 p-5 transition hover:border-blue-500/40"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}
                >
                  {item.icon}
                </div>

                <div>
                  <h4 className="font-semibold text-white">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardCard>
  );
}