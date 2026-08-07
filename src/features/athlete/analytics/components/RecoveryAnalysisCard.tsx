import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

export default function RecoveryAnalysisCard() {
  return (
    <DashboardCard>
      <SectionHeading
        title="Recovery Analysis"
        subtitle="Today's recovery metrics"
      />

      <div className="mt-8 flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center">
        <div>
          <p className="font-medium text-white">
            Recovery tracking coming soon
          </p>

          <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
            Sleep quality, hydration, energy level, and
            muscle recovery will appear here once recovery
            tracking is available.
          </p>
        </div>
      </div>
    </DashboardCard>
  );
}