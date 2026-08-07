import { useState } from "react";

import PageContainer from "@/components/layout/PageContainer";

import ProfileHeader from "./components/ProfileHeader";
import ProfileGrid from "./components/ProfileGrid";

export default function ProfilePage() {
  const [profileVersion, setProfileVersion] = useState<number>(0);

  const handleProfileSaved = () => {
    setProfileVersion((version: number) => version + 1);
  };

  return (
    <PageContainer>
      <ProfileHeader onSaved={handleProfileSaved} />

      <ProfileGrid profileVersion={profileVersion} />
    </PageContainer>
  );
}