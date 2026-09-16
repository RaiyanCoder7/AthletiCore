import { useEffect, useState } from "react";
import { User, ShieldCheck, AlertCircle } from "lucide-react";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth } from "@/services/firebase/firebase";
import { getUserProfile } from "@/services/firebase/users";

interface PersonalInfo {
  age?: number;
  height?: number;
  weight?: number;
  position?: string;
  team?: string;
  teamName?: string;
  dominantFoot?: string;
}

interface PersonalInfoCardProps {
  profileVersion: number;
}

export default function PersonalInfoCard({
  profileVersion,
}: PersonalInfoCardProps) {
  const [profile, setProfile] = useState<PersonalInfo | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const data = await getUserProfile(user.uid);
        if (data && isMounted) {
          setProfile(data as PersonalInfo);
        }
      } catch (err) {
        console.error("Failed to load personal info profile:", err);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [profileVersion]);

  const squadName = profile?.teamName || profile?.team || null;

  const personalInfo = [
    {
      label: "Age",
      value: profile?.age ? `${profile.age} Years` : "Not set",
    },
    {
      label: "Height",
      value: profile?.height ? `${profile.height} cm` : "Not set",
    },
    {
      label: "Weight",
      value: profile?.weight ? `${profile.weight} kg` : "Not set",
    },
    {
      label: "Position",
      value: profile?.position || "Not set",
    },
    {
      label: "Team / Squad",
      value: squadName || "Not set",
      isSquad: true,
    },
    {
      label: "Dominant Foot",
      value: profile?.dominantFoot || "Not set",
    },
  ];

  return (
    <DashboardCard hover accent="blue">
      <SectionHeading
        title="Personal Information"
        subtitle="Basic athlete biometrics & affiliation"
        action={
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <User size={20} />
          </div>
        }
      />

      <div className="mt-8 space-y-5">
        {personalInfo.map((item) => {
          const isUnset = item.value === "Not set";

          return (
            <div
              key={item.label}
              className="flex items-center justify-between border-b border-border pb-3 last:border-none"
            >
              <span className="text-sm text-muted-foreground">{item.label}</span>

              {item.isSquad ? (
                isUnset ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-medium text-amber-500">
                    <AlertCircle size={11} /> Unlinked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-medium text-emerald-500">
                    <ShieldCheck size={12} /> {item.value}
                  </span>
                )
              ) : (
                <span
                  className={
                    isUnset
                      ? "text-sm italic text-muted-foreground"
                      : "text-sm font-semibold text-foreground"
                  }
                >
                  {item.value}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}