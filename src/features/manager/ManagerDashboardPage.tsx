import { ShieldCheck } from "lucide-react";

import PageContainer from "@/components/layout/PageContainer";
import SectionHeading from "@/components/ui/SectionHeading";
import DashboardCard from "@/components/ui/DashboardCard";

export default function ManagerDashboardPage() {
  return (
    <PageContainer>
      <SectionHeading
        title="Manager Workspace"
        subtitle="Organization-level management is being prepared."
      />

      <DashboardCard className="mt-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Manager access is secured
            </h2>
            <p className="mt-1 text-sm leading-6 text-neutral-400">
              Your manager role is recognized, but organization and
              multi-squad permissions will be enabled after the club
              authorization model is implemented.
            </p>
          </div>
        </div>
      </DashboardCard>
    </PageContainer>
  );
}