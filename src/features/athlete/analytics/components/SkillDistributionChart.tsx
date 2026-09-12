import { useEffect, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Compass, Sparkles } from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { auth } from "@/services/firebase/firebase";
import { getLatestPerformanceTest } from "@/services/firebase/performance";

interface SkillData {
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: SkillData }>;
}

function CustomRadarTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];

  return (
    <div className="rounded-xl border border-border/80 bg-card/95 px-3.5 py-2 shadow-xl backdrop-blur-md">
      <p className="text-[11px] font-medium text-muted-foreground">
        {item.payload.name}
      </p>
      <div className="mt-0.5 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <p className="text-sm font-bold text-foreground">
          {item.value}%{" "}
          <span className="text-xs font-normal text-muted-foreground">Rating</span>
        </p>
      </div>
    </div>
  );
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
        const performance = await getLatestPerformanceTest(user.uid);

        if (!performance) {
          setData([]);
          return;
        }

        setData([
          { name: "Speed", value: performance.sprintSpeed },
          { name: "Strength", value: performance.strength },
          { name: "Stamina", value: performance.stamina },
          { name: "Agility", value: performance.agility },
          { name: "Accuracy", value: performance.accuracy },
          { name: "Endurance", value: performance.endurance },
        ]);
      } catch (error) {
        console.error("Failed to load skill distribution:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSkillDistribution();
  }, []);

  const topSkill =
    data.length > 0
      ? [...data].sort((a, b) => b.value - a.value)[0]
      : null;

  return (
    <DashboardCard accent="blue" hover={false}>
      {/* Header with Top Skill Badge */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          title="Skill Distribution"
          subtitle="Biometric & physical attribute matrix"
        />

        {!loading && topSkill && (
          <div className="mb-4 inline-flex items-center gap-1.5 self-start rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:mb-0 sm:self-auto">
            <Sparkles size={12} />
            <span>
              Primary Strength:{" "}
              <strong className="text-foreground">
                {topSkill.name} ({topSkill.value}%)
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-80 w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground animate-pulse">
              Mapping athletic attributes...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground shadow-xs">
              <Compass size={20} />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">
              No skill assessment recorded
            </p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Complete a multi-point performance test to generate your physical skill polygon.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={data}
              cx="50%"
              cy="50%"
              outerRadius="72%"
              margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
            >
              {/* Subtle Concentric Rings */}
              <PolarGrid
                stroke="currentColor"
                strokeOpacity={0.09}
                gridType="polygon"
              />

              {/* Skill Dimension Labels */}
              <PolarAngleAxis
                dataKey="name"
                stroke="currentColor"
                tick={{
                  fill: "currentColor",
                  fontSize: 12,
                  fontWeight: 500,
                  opacity: 0.8,
                }}
              />

              {/* Radial Scale Range */}
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{
                  fill: "currentColor",
                  fontSize: 9,
                  opacity: 0.4,
                }}
                axisLine={false}
                stroke="currentColor"
                strokeOpacity={0.1}
              />

              <Tooltip content={<CustomRadarTooltip />} />

              {/* Polygon Radar Fill */}
              <Radar
                name="Rating"
                dataKey="value"
                stroke="var(--color-primary, #3b82f6)"
                fill="var(--color-primary, #3b82f6)"
                fillOpacity={0.2}
                strokeWidth={2.5}
                dot={{
                  r: 3.5,
                  fill: "var(--color-primary, #3b82f6)",
                  stroke: "var(--color-card, #ffffff)",
                  strokeWidth: 1.5,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardCard>
  );
}