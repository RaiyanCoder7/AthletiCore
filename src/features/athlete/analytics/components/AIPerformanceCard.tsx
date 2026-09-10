import { useState } from "react";
import {
  Sparkles,
  Loader2,
  TrendingUp,
  Target,
  Dumbbell,
  HeartPulse,
} from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getLatestPerformanceTest } from "@/services/firebase/performance";
import { generatePerformanceAnalysis } from "@/services/firebase/ai";

interface AISections {
  overall: string;
  strengths: string[];
  improvements: string[];
  training: string[];
  recovery: string[];
  goal: string;
}

function parseAIResponse(text: string): AISections {
  const sections: AISections = {
    overall: "",
    strengths: [],
    improvements: [],
    training: [],
    recovery: [],
    goal: "",
  };

  const overallMatch = text.match(
    /OVERALL ASSESSMENT\s*([\s\S]*?)(?=STRONGEST AREAS|$)/i
  );

  const strengthsMatch = text.match(
    /STRONGEST AREAS\s*([\s\S]*?)(?=AREAS TO IMPROVE|$)/i
  );

  const improvementsMatch = text.match(
    /AREAS TO IMPROVE\s*([\s\S]*?)(?=TRAINING RECOMMENDATIONS|$)/i
  );

  const trainingMatch = text.match(
    /TRAINING RECOMMENDATIONS\s*([\s\S]*?)(?=RECOVERY RECOMMENDATIONS|$)/i
  );

  const recoveryMatch = text.match(
    /RECOVERY RECOMMENDATIONS\s*([\s\S]*?)(?=SHORT-TERM GOAL|$)/i
  );

  const goalMatch = text.match(
    /SHORT-TERM GOAL\s*([\s\S]*)/i
  );

  sections.overall =
    overallMatch?.[1]?.trim() || "";

  sections.strengths =
    strengthsMatch?.[1]
      ?.split("\n")
      .map((item) =>
        item
          .replace(/^[-•*]\s*/, "")
          .trim()
      )
      .filter(Boolean) || [];

  sections.improvements =
    improvementsMatch?.[1]
      ?.split("\n")
      .map((item) =>
        item
          .replace(/^[-•*]\s*/, "")
          .trim()
      )
      .filter(Boolean) || [];

  sections.training =
    trainingMatch?.[1]
      ?.split("\n")
      .map((item) =>
        item
          .replace(/^\d+\.\s*/, "")
          .trim()
      )
      .filter(Boolean) || [];

  sections.recovery =
    recoveryMatch?.[1]
      ?.split("\n")
      .map((item) =>
        item
          .replace(/^[-•*]\s*/, "")
          .trim()
      )
      .filter(Boolean) || [];

  sections.goal =
    goalMatch?.[1]?.trim() || "";

  return sections;
}

export default function AIPerformanceCard() {
  const [analysis, setAnalysis] =
    useState<AISections | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const handleGenerateAnalysis =
    async () => {
      const user = auth.currentUser;

      if (!user) {
        setError(
          "Please log in to generate an AI analysis."
        );
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const performance =
          await getLatestPerformanceTest(
            user.uid
          );

        if (!performance) {
          setError(
            "No performance test found. Complete a performance test first."
          );
          return;
        }

        const result =
          await generatePerformanceAnalysis({
            sprintSpeed:
              performance.sprintSpeed,
            strength:
              performance.strength,
            stamina:
              performance.stamina,
            agility:
              performance.agility,
            accuracy:
              performance.accuracy,
            endurance:
              performance.endurance,
          });

        const parsed =
          parseAIResponse(result);

        setAnalysis(parsed);
      } catch (err) {
        console.error(
          "AI analysis failed:",
          err
        );

        setError(
          "Unable to generate AI analysis. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <DashboardCard accent="blue">
      <SectionHeading
        title="AI Performance Coach"
        subtitle="Personalized insights from your latest performance test"
      />

      <div className="mt-6">

        {/* Initial State */}

        {!analysis && !loading && (
          <div className="rounded-2xl border border-border bg-muted/40 p-6">
            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles size={22} />
              </div>

              <div className="flex-1">

                <h3 className="font-semibold text-foreground">
                  Get AI-powered performance insights
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  AthletiCore AI will analyze your
                  latest performance metrics and provide
                  personalized training and recovery
                  recommendations.
                </p>

                <button
                  type="button"
                  onClick={
                    handleGenerateAnalysis
                  }
                  className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Generate Analysis
                </button>

              </div>
            </div>
          </div>
        )}

        {/* Loading */}

        {loading && (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-border bg-muted/40">

            <div className="flex items-center gap-3 text-muted-foreground">

              <Loader2
                size={20}
                className="animate-spin"
              />

              <span>
                Analyzing your performance...
              </span>

            </div>

          </div>
        )}

        {/* Error */}

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* AI Result */}

        {analysis && !loading && (
          <div className="space-y-6">

            {/* Header */}

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-foreground">
                  Your AI Performance Analysis
                </h3>

                <p className="text-xs text-muted-foreground">
                  Generated from your latest performance test
                </p>
              </div>

            </div>

            {/* Overall Assessment */}

            {analysis.overall && (
              <div className="rounded-2xl border border-border bg-muted/40 p-6">

                <div className="mb-3 flex items-center gap-3">

                  <TrendingUp
                    size={20}
                    className="text-primary"
                  />

                  <h4 className="font-semibold text-foreground">
                    Overall Assessment
                  </h4>

                </div>

                <p className="text-sm leading-7 text-foreground/90">
                  {analysis.overall}
                </p>

              </div>
            )}

            {/* Strengths + Improvements */}

            <div className="grid gap-6 xl:grid-cols-2">

              {/* Strengths */}

              <div className="rounded-2xl border border-border bg-muted/40 p-6">

                <div className="mb-4 flex items-center gap-3">

                  <TrendingUp
                    size={20}
                    className="text-emerald-600 dark:text-emerald-400"
                  />

                  <h4 className="font-semibold text-foreground">
                    Strongest Areas
                  </h4>

                </div>

                <div className="space-y-3">

                  {analysis.strengths.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="rounded-xl bg-card p-4 text-sm leading-6 text-foreground/90"
                      >
                        {item}
                      </div>
                    )
                  )}

                </div>

              </div>

              {/* Improvements */}

              <div className="rounded-2xl border border-border bg-muted/40 p-6">

                <div className="mb-4 flex items-center gap-3">

                  <Target
                    size={20}
                    className="text-orange-600 dark:text-orange-400"
                  />

                  <h4 className="font-semibold text-foreground">
                    Areas to Improve
                  </h4>

                </div>

                <div className="space-y-3">

                  {analysis.improvements.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="rounded-xl bg-card p-4 text-sm leading-6 text-foreground/90"
                      >
                        {item}
                      </div>
                    )
                  )}

                </div>

              </div>

            </div>

            {/* Training Recommendations */}

            <div className="rounded-2xl border border-border bg-muted/40 p-6">

              <div className="mb-4 flex items-center gap-3">

                <Dumbbell
                  size={20}
                  className="text-primary"
                />

                <h4 className="font-semibold text-foreground">
                  Training Recommendations
                </h4>

              </div>

              <div className="space-y-3">

                {analysis.training.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 rounded-xl bg-card p-4"
                    >

                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>

                      <p className="text-sm leading-6 text-foreground/90">
                        {item}
                      </p>

                    </div>
                  )
                )}

              </div>

            </div>

            {/* Recovery Recommendations */}

            <div className="rounded-2xl border border-border bg-muted/40 p-6">

              <div className="mb-4 flex items-center gap-3">

                <HeartPulse
                  size={20}
                  className="text-rose-500"
                />

                <h4 className="font-semibold text-foreground">
                  Recovery Recommendations
                </h4>

              </div>

              <div className="space-y-3">

                {analysis.recovery.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-card p-4 text-sm leading-6 text-foreground/90"
                    >
                      {item}
                    </div>
                  )
                )}

              </div>

            </div>

            {/* Short-Term Goal */}

            {analysis.goal && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">

                <div className="mb-3 flex items-center gap-3">

                  <Target
                    size={20}
                    className="text-primary"
                  />

                  <h4 className="font-semibold text-foreground">
                    Short-Term Goal
                  </h4>

                </div>

                <p className="text-sm leading-7 text-foreground/90">
                  {analysis.goal}
                </p>

              </div>
            )}

            {/* Regenerate */}

            <button
              type="button"
              onClick={
                handleGenerateAnalysis
              }
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
            >
              Regenerate Analysis
            </button>

          </div>
        )}

      </div>
    </DashboardCard>
  );
}