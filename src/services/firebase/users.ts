import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

/* --------------------------------
   Types
-------------------------------- */

export type UserRole = "athlete" | "coach" | "manager";

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  createdAt?: any;

  // Profile attributes
  age?: number;
  height?: number;
  weight?: number;
  position?: string;
  category?: "FWD" | "MID" | "DEF" | "GK";
  team?: string;
  teamId?: string;
  teamName?: string;
  dominantFoot?: string;
  location?: string;
  phone?: string;
  bio?: string;

  // Training & Biometric preferences
  trainingLevel?: string;
  primaryGoal?: string;
  trainingDays?: string[];
  sessionDuration?: number;
  recoveryTracking?: boolean;
  fatigueAlertThreshold?: number;

  // Notification preferences
  trainingReminders?: boolean;
  performanceUpdates?: boolean;
  emailNotifications?: boolean;

  // Appearance preference
  appearance?: "Dark" | "Light" | "System";

  // Dynamic index signature for custom coach/athlete preferences
  coachIds?: string[];
  [key: string]: any;
}

/* --------------------------------
   Create User Profile
-------------------------------- */

export async function createUserProfile(
  uid: string,
  name: string,
  email: string,
  role: UserRole = "athlete"
): Promise<void> {
  const userRef = doc(db, "users", uid);

  const existingProfile = await getDoc(userRef);

  // Don't overwrite an existing profile
  if (existingProfile.exists()) {
    return;
  }

  await setDoc(userRef, {
    name,
    email,
    role,
    createdAt: serverTimestamp(),
  });
}

/* --------------------------------
   Get User Profile
-------------------------------- */

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);

  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserProfile;
}

/* --------------------------------
   Update User Profile
-------------------------------- */

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  // Authorization/relationship fields are server-controlled by Firestore.
  const safeData = { ...data } as Record<string, unknown>;

  delete safeData.role;
  delete safeData.coachIds;
  delete safeData.teamId;
  delete safeData.teamName;
  delete safeData.email;

  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, safeData);
}

export async function getUserRole(
  uid: string
): Promise<UserRole | null> {
  const profile = await getUserProfile(uid);

  if (
    profile?.role === "athlete" ||
    profile?.role === "coach" ||
    profile?.role === "manager"
  ) {
    return profile.role;
  }

  return null;
}
