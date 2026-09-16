import { MapPin, Shield, Pencil, Users, KeyRound, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import Button from "@/components/ui/Button";

import { auth } from "@/services/firebase/firebase";
import { getUserProfile } from "@/services/firebase/users";

import EditProfileModal from "./EditProfileModal";
import JoinTeamModal from "./JoinTeamModal";

interface UserProfile {
  name?: string;
  email?: string;
  role?: string;
  position?: string;
  location?: string;
  teamId?: string;
  teamName?: string;
}

interface ProfileHeaderProps {
  onSaved: () => void;
}

export default function ProfileHeader({
  onSaved,
}: ProfileHeaderProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const loadProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const data = await getUserProfile(user.uid);
    if (data) {
      setProfile(data as UserProfile);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const name =
    profile?.name ||
    auth.currentUser?.displayName ||
    "Athlete";

  const position = profile?.position || "Striker";
  const location = profile?.location || "Jamshedpur, India";
  const squad = profile?.teamName || null;

  const initial = name.charAt(0).toUpperCase();

  return (
    <>
      <DashboardCard accent="blue">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          {/* Left Avatar + Core Info */}
          <div className="flex items-center gap-6">

            {/* Avatar */}
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl font-bold text-white ring-4 ring-background shadow-md">
              {initial}
            </div>

            {/* Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-3xl font-bold text-foreground">
                  {name}
                </h1>

                {/* Squad Confirmation Badge */}
                {squad ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-emerald-500">
                    <CheckCircle2 size={12} />
                    <span>{squad}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-amber-500">
                    ● No Squad Linked
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Professional Football Player
              </p>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium">
                  <Shield size={14} className="text-primary" />
                  <span>{position}</span>
                </div>

                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin size={14} className="text-primary" />
                  <span>{location}</span>
                </div>

                {squad && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users size={14} className="text-emerald-500" />
                    <span>{squad}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Join Squad Trigger (Shown when unlinked or switching squads) */}
            {!squad ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsJoinOpen(true)}
                className="gap-1.5"
              >
                <KeyRound size={15} />
                <span>Join Squad</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsJoinOpen(true)}
                className="gap-1.5 text-xs"
              >
                <KeyRound size={13} />
                <span>Switch Squad</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="gap-1.5"
            >
              <Pencil size={15} />
              <span>Edit Profile</span>
            </Button>
          </div>

        </div>
      </DashboardCard>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSaved={() => {
          loadProfile();
          onSaved();
        }}
      />

      {/* Join Squad Code Modal */}
      <JoinTeamModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={() => {
          loadProfile();
          onSaved();
        }}
      />
    </>
  );
}