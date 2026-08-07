import { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getLatestPerformanceTest } from "@/services/firebase/performance";

interface SkillData {
  name: string;
  value: number;
}

const COLORS = [
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
];

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
          await getLatestPerformanceTest(
            user.uid
          );

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
    <DashboardCard>
      <SectionHeading
        title="Skill Distribution"
        subtitle="Latest athlete skill assessment"
      />

      <div className="mt-8 h-80">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-zinc-500">
              Loading skill distribution...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="font-medium text-white">
                No skill data available
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Add a performance test to see your skills.
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={110}
                paddingAngle={4}
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={
                      COLORS[
                        index %
                          COLORS.length
                      ]
                    }
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => [
                  `${value}%`,
                  "Score",
                ]}
              />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}