import { useEffect, useState } from "react";
import { User } from "lucide-react";

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
    const loadProfile = async () => {
      const user = auth.currentUser;

      if (!user) return;

      const data = await getUserProfile(user.uid);

      if (data) {
        setProfile(data as PersonalInfo);
      }
    };

    loadProfile();
  }, [profileVersion]);

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
      label: "Team",
      value: profile?.team || "Not set",
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
        subtitle="Basic athlete information"
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
              <span className="text-muted-foreground">
                {item.label}
              </span>

              <span
                className={
                  isUnset
                    ? "italic text-muted-foreground"
                    : "font-semibold text-foreground"
                }
              >
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}