import { useState } from "react";
import {
  Brain,
  Sparkles,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Check,
  ShieldCheck,
} from "lucide-react";
import DashboardCard from "@/components/ui/DashboardCard";
import Button from "@/components/ui/Button";

interface TacticalAlert {
  id: string;
  type: "warning" | "positive" | "action";
  title: string;
  detail: string;
  target?: string;
  actionText?: string;
}

const INSIGHTS_DATA: TacticalAlert[] = [
  {
    id: "alert-1",
    type: "warning",
    title: "Aerobic Capacity Deficit Detected",
    detail:
      "Midfield quadrant showed a 4.2% dip in sustained high-speed running during the second half of recent scrimmage sessions. Consider adding two aerobic threshold sessions this microcycle.",
    target: "Midfield Group",
    actionText: "Apply Conditioning Preset",
  },
  {
    id: "alert-2",
    type: "warning",
    title: "Elevated Fatigue Risk: Rahul Sharma",
    detail:
      "Neuromuscular fatigue index has trended above threshold for 3 consecutive days post-interval sprints. Sprint volume reduction recommended by 25%.",
    target: "Rahul Sharma (RW)",
    actionText: "Adjust Workload",
  },
  {
    id: "alert-3",
    type: "positive",
    title: "Agility & Reactive Acceleration Surge",
    detail:
      "Team-wide agility scores rose by +11.8% over the past 4 weeks following the modified shuttle drill protocol.",
    target: "Entire Squad",
  },
];

export default function CoachAIInsightsCard() {
  const [insights, setInsights] = useState<TacticalAlert[]>(INSIGHTS_DATA);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [appliedActions, setAppliedActions] = useState<Record<string, boolean>>({});

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 900);
  };

  const handleApply = (id: string) => {
    setAppliedActions((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <DashboardCard accent="emerald" hover={false}>
      {/* Card Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Brain size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                AI Squad Intelligence & Tactical Alerts
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                <Sparkles size={10} /> Active Model
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Algorithmic synthesis of collective biometric fatigue, workload volume, and injury indicators
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw size={12} className={isRefreshing ? "animate-spin text-primary" : ""} />
          <span>{isRefreshing ? "Analyzing telemetry..." : "Re-evaluate"}</span>
        </button>
      </div>

      {/* Feed of Prescriptive Insights */}
      <div className="mt-4 space-y-3">
        {insights.map((alert) => {
          const isWarning = alert.type === "warning";
          const isApplied = appliedActions[alert.id];

          return (
            <div
              key={alert.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5 transition hover:border-border/80 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isWarning
                      ? "border border-amber-500/20 bg-amber-500/10 text-amber-500"
                      : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                  }`}
                >
                  {isWarning ? <AlertCircle size={15} /> : <TrendingUp size={15} />}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-foreground">
                      {alert.title}
                    </h3>
                    {alert.target && (
                      <span className="rounded-md border border-border/60 bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {alert.target}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {alert.detail}
                  </p>
                </div>
              </div>

              {/* Action Button if actionable */}
              {alert.actionText && (
                <div className="shrink-0 sm:pl-4">
                  <Button
                    size="sm"
                    variant={isApplied ? "outline" : "primary"}
                    disabled={isApplied}
                    onClick={() => handleApply(alert.id)}
                    className="w-full sm:w-auto text-[11px] gap-1.5 px-3 py-1.5"
                  >
                    {isApplied ? (
                      <>
                        <Check size={12} className="text-emerald-500" />
                        <span>Applied to Plan</span>
                      </>
                    ) : (
                      <>
                        <span>{alert.actionText}</span>
                        <ArrowRight size={12} />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}