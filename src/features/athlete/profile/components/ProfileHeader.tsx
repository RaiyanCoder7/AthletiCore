import { MapPin, Shield, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

import DashboardCard from "@/components/ui/DashboardCard";
import Button from "@/components/ui/Button";

import { auth } from "@/services/firebase/firebase";
import { getUserProfile } from "@/services/firebase/users";

import EditProfileModal from "./EditProfileModal";

interface UserProfile {
  name?: string;
  email?: string;
  role?: string;
  position?: string;
  location?: string;
}

interface ProfileHeaderProps {
  onSaved: () => void;
}

export default function ProfileHeader({
  onSaved,
}: ProfileHeaderProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

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

  const initial = name.charAt(0).toUpperCase();

  return (
    <>
      <DashboardCard>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          {/* Left */}
          <div className="flex items-center gap-6">

            {/* Avatar */}
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl font-bold text-white">
              {initial}
            </div>

            {/* Info */}
            <div>
              <h1 className="text-3xl font-bold text-white">
                {name}
              </h1>

              <p className="mt-2 text-zinc-400">
                Professional Football Player
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-400">

                <div className="flex items-center gap-2">
                  <Shield size={16} />
                  {position}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  {location}
                </div>

              </div>
            </div>
          </div>

          {/* Right */}
          <Button onClick={() => setIsEditOpen(true)}>
            <div className="flex items-center gap-2">
              <Pencil size={18} />
              Edit Profile
            </div>
          </Button>

        </div>
      </DashboardCard>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSaved={() => {
          loadProfile();
          onSaved();
        }}
      />
    </>
  );
}