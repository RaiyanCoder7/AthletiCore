import { ArrowRight, CheckCircle2, Plus, Target } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Goal } from "@/services/firebase/goals";

interface GoalsHeroProps {
  goals?: Goal[];
}

export default function GoalsHero({ goals = [] }: GoalsHeroProps) {
  const completedGoals = goals.filter(
    (g) => g.status === "Completed" || (g.progress ?? 0) >= 100
  ).length;
  const totalGoals = goals.length;
  const completionRate =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const handleScrollToCreate = () => {
    document.getElementById("create-goal")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm shadow-slate-900/[0.04] transition-colors dark:shadow-black/20 sm:p-8">
      {/* Ambient goals domain glow (Emerald) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 right-1/4 h-48 w-48 rounded-full bg-teal-500/5 blur-2xl dark:bg-teal-500/10"
      />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Content Block */}
        <div className="max-w-xl space-y-3">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <Target size={13} className="shrink-0" />
            <span>Target & Milestone Tracking</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Turn Your Goals Into Results.
          </h1>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Set calibrated benchmarks, track weekly milestones, and build sustained momentum across your athletic journey.
          </p>

          {/* Inline Telemetry Chips using the goals prop */}
          {totalGoals > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1 text-muted-foreground">
                <Target size={12} className="text-emerald-500" />
                <span>
                  <strong className="font-semibold text-foreground">{totalGoals}</strong> Total Targets
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1 text-muted-foreground">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>
                  <strong className="font-semibold text-foreground">{completedGoals}</strong> Completed ({completionRate}%)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="shrink-0 pt-2 lg:pt-0">
          <Button
            variant="primary"
            size="md"
            onClick={handleScrollToCreate}
            className="bg-emerald-600 text-white shadow-xs hover:bg-emerald-500 focus-visible:ring-emerald-500/30"
          >
            <Plus size={16} />
            <span>Create New Goal</span>
            <ArrowRight size={15} />
          </Button>
        </div>
      </div>
    </section>
  );
}