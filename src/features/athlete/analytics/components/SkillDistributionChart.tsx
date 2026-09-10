import { useEffect, useState } from "react";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getLatestPerformanceTest } from "@/services/firebase/performance";

interface SkillData {
  name: string;
  value: number;
}

export default function SkillDistributionChart() {
  const [data, setData] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSkillDistribution = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const performance =
          await getLatestPerformanceTest(user.uid);

        if (!performance) {
          setData([]);
          return;
        }

        setData([
          {
            name: "Speed",
            value: performance.sprintSpeed,
          },
          {
            name: "Strength",
            value: performance.strength,
          },
          {
            name: "Stamina",
            value: performance.stamina,
          },
          {
            name: "Agility",
            value: performance.agility,
          },
          {
            name: "Accuracy",
            value: performance.accuracy,
          },
          {
            name: "Endurance",
            value: performance.endurance,
          },
        ]);
      } catch (error) {
        console.error(
          "Failed to load skill distribution:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadSkillDistribution();
  }, []);

  return (
    <DashboardCard accent="blue">
      <SectionHeading
        title="Skill Distribution"
        subtitle="Latest athlete skill assessment"
      />

      <div className="mt-8 h-80">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              Loading skill distribution...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="font-medium text-foreground">
                No skill data available
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add a performance test to see your skills.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full text-muted-foreground [&_.recharts-default-tooltip]:!rounded-xl [&_.recharts-default-tooltip]:!border-border [&_.recharts-default-tooltip]:!bg-card [&_.recharts-default-tooltip]:!text-foreground">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <RadarChart
                data={data}
                cx="50%"
                cy="50%"
                outerRadius="75%"
              >
                <PolarGrid stroke="currentColor" strokeOpacity={0.2} />

                <PolarAngleAxis
                  dataKey="name"
                  stroke="currentColor"
                  tick={{
                    fill: "currentColor",
                    fontSize: 12,
                  }}
                />

                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{
                    fill: "currentColor",
                    fontSize: 10,
                  }}
                  axisLine={false}
                />

                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.25}
                  strokeWidth={3}
                />

                <Tooltip
                  formatter={(value) => [
                    `${value}%`,
                    "Score",
                  ]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}