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
  team?: string;
  dominantFoot?: string;
  location?: string;
  phone?: string;
  bio?: string;

  // Training preferences
  trainingLevel?: string;
  primaryGoal?: string;
  trainingDays?: string[];
  sessionDuration?: number;
  recoveryTracking?: boolean;

  // Notification preferences
  trainingReminders?: boolean;
  performanceUpdates?: boolean;
  emailNotifications?: boolean;

  // Appearance preference
  appearance?: "Dark" | "Light" | "System";
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
   (Role is excluded to prevent elevation)
-------------------------------- */

export async function updateUserProfile(
  uid: string,
  data: Omit<Partial<UserProfile>, "role" | "createdAt" | "email">
): Promise<void> {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, data);
}