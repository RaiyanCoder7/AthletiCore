import { useState } from "react";
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  Dumbbell,
  HeartPulse,
  ShieldAlert,
  Flame,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import type { CoachAthlete } from "@/services/firebase/coach";
import { generateSquadTacticalAnalysis } from "@/services/firebase/ai";

interface CoachAISections {
  overview: string;
  triage: string[];
  tactical: string[];
  recovery: string[];
  riskAssessment: string;
}

function parseCoachAIResponse(text: string): CoachAISections {
  const sections: CoachAISections = {
    overview: "",
    triage: [],
    tactical: [],
    recovery: [],
    riskAssessment: "",
  };

  const overviewMatch = text.match(
    /SQUAD STATUS OVERVIEW\s*([\s\S]*?)(?=IMMEDIATE TRIAGE DIRECTIVES|$)/i
  );
  const triageMatch = text.match(
    /IMMEDIATE TRIAGE DIRECTIVES\s*([\s\S]*?)(?=TACTICAL TRAINING ADJUSTMENTS|$)/i
  );
  const tacticalMatch = text.match(
    /TACTICAL TRAINING ADJUSTMENTS\s*([\s\S]*?)(?=RECOVERY & CLEARANCE PROTOCOLS|$)/i
  );
  const recoveryMatch = text.match(
    /RECOVERY & CLEARANCE PROTOCOLS\s*([\s\S]*?)(?=MATCHDAY RISK ASSESSMENT|$)/i
  );
  const riskMatch = text.match(
    /MATCHDAY RISK ASSESSMENT\s*([\s\S]*)/i
  );

  sections.overview = overviewMatch?.[1]?.trim() || "";

  sections.triage =
    triageMatch?.[1]
      ?.split("\n")
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean) || [];

  sections.tactical =
    tacticalMatch?.[1]
      ?.split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean) || [];

  sections.recovery =
    recoveryMatch?.[1]
      ?.split("\n")
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean) || [];

  sections.riskAssessment = riskMatch?.[1]?.trim() || "";

  return sections;
}

interface CoachAIInsightsCardProps {
  squadName?: string;
  athletes: CoachAthlete[];
}

export default function CoachAIInsightsCard({
  squadName = "Active Squad",
  athletes,
}: CoachAIInsightsCardProps) {
  const [analysis, setAnalysis] = useState<CoachAISections | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSquadAnalysis = async () => {
    if (!athletes || athletes.length === 0) {
      setError("No athlete data available in the current squad to analyze.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const avgReadiness = Math.round(
        athletes.reduce((acc, a) => acc + (a.fitnessScore || 0), 0) / athletes.length
      );

      const criticalPlayers = athletes.filter(
        (a) => a.status === "Critical" || a.availability === "Out"
      );
      const monitorPlayers = athletes.filter((a) => a.status === "Monitor");

      const athletesAtRisk = [...criticalPlayers, ...monitorPlayers].map((a) => ({
        name: a.name,
        status: a.status,
        readiness: a.fitnessScore,
        position: a.position || "Flex",
      }));

      const rawResult = await generateSquadTacticalAnalysis({
        squadName,
        totalAthletes: athletes.length,
        avgReadiness,
        criticalCount: criticalPlayers.length,
        monitorCount: monitorPlayers.length,
        athletesAtRisk,
      });

      const parsed = parseCoachAIResponse(rawResult);
      setAnalysis(parsed);
    } catch (err) {
      console.error("Coach AI analysis failure:", err);
      setError("Failed to generate squad intelligence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardCard accent="indigo">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeading
          title="AI Squad Intelligence"
          subtitle={`Automated load management & triage analysis for ${squadName}`}
        />
        {analysis && !loading && (
          <button
            type="button"
            onClick={handleGenerateSquadAnalysis}
            className="self-start rounded-xl border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
          >
            Re-Analyze Squad
          </button>
        )}
      </div>

      <div className="mt-5">
        {/* Initial Empty State */}
        {!analysis && !loading && (
          <div className="rounded-2xl border border-border bg-muted/20 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <Sparkles size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  Generate Tactical Squad Analysis
                </h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  AthletiCore AI processes readiness distributions across all {athletes.length} squad
                  members, flags neuromuscular injury risk, and outputs squad load adjustments.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateSquadAnalysis}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <Sparkles size={14} />
                  <span>Run Squad Triage</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex min-h-44 items-center justify-center rounded-2xl border border-border bg-muted/20">
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
              <Loader2 size={18} className="animate-spin text-primary" />
              <span>Synthesizing biometric indices across {athletes.length} squad members...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-500">
            {error}
          </div>
        )}

        {/* Output View */}
        {analysis && !loading && (
          <div className="space-y-4">
            {/* Overview */}
            {analysis.overview && (
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
                <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-foreground">
                  <Flame size={14} className="text-amber-500" />
                  <span>Squad Status Assessment</span>
                </div>
                <p className="text-xs leading-relaxed text-foreground/90">
                  {analysis.overview}
                </p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {/* Triage Alerts */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
                <div className="flex items-center gap-2 mb-3 font-mono text-xs font-bold text-rose-500">
                  <AlertTriangle size={14} />
                  <span>Immediate Triage Directives</span>
                </div>
                <div className="space-y-2">
                  {analysis.triage.map((item, idx) => (
                    <div key={idx} className="rounded-lg bg-card p-2.5 text-xs text-foreground/90 border border-border/60">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tactical Recommendations */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
                <div className="flex items-center gap-2 mb-3 font-mono text-xs font-bold text-primary">
                  <Dumbbell size={14} />
                  <span>Drill & Intensity Prescriptions</span>
                </div>
                <div className="space-y-2">
                  {analysis.tactical.map((item, idx) => (
                    <div key={idx} className="flex gap-2.5 rounded-lg bg-card p-2.5 text-xs text-foreground/90 border border-border/60">
                      <span className="font-mono font-bold text-primary">{idx + 1}.</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recovery & Risk Footer */}
            <div className="grid gap-4 md:grid-cols-2">
              {analysis.recovery.length > 0 && (
                <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
                  <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-emerald-500">
                    <HeartPulse size={14} />
                    <span>Recovery Protocols</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-foreground/90 list-disc list-inside">
                    {analysis.recovery.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.riskAssessment && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold text-amber-500">
                    <ShieldAlert size={14} />
                    <span>Matchday Readiness Risk</span>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/90">
                    {analysis.riskAssessment}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}