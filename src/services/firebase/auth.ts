import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

import { auth } from "./firebase";
import {
  createUserProfile,
  getUserProfile,
  type UserProfile,
  type UserRole,
} from "./users";

/* --------------------------------
   Role Navigation Helper
-------------------------------- */

export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case "coach":
      return "/coach";
    case "manager":
      return "/manager";
    case "athlete":
    default:
      return "/athlete";
  }
}

/* --------------------------------
   Email / Password Registration
-------------------------------- */

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: UserRole = "athlete"
): Promise<{ user: User; profile: UserProfile }> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    await updateProfile(user, {
      displayName: name,
    });

    await createUserProfile(user.uid, name, email, role);

    const profile = await getUserProfile(user.uid);

    return {
      user,
      profile: profile ?? { name, email, role },
    };
  } catch (error: any) {
    console.error("Firebase registration error:", error);
    throw error;
  }
}

/* --------------------------------
   Email / Password Login
-------------------------------- */

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: User; profile: UserProfile }> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;
    const profile = await getUserProfile(user.uid);

    if (!profile) {
      throw new Error("User profile not found in database.");
    }

    return { user, profile };
  } catch (error: any) {
    console.error("Firebase login error:", error);
    throw error;
  }
}

/* --------------------------------
   Google Authentication
-------------------------------- */

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export interface GoogleAuthResult {
  user: User;
  profile: UserProfile | null;
  isNewUser: boolean;
}

export async function loginWithGoogle(): Promise<GoogleAuthResult> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    /*
     * Check whether the AthletiCore
     * Firestore profile already exists.
     */
    const existingProfile = await getUserProfile(user.uid);

    if (!existingProfile) {
      return {
        user,
        profile: null,
        isNewUser: true,
      };
    }

    return {
      user,
      profile: existingProfile,
      isNewUser: false,
    };
  } catch (error: any) {
    console.error("Google authentication error:", error);
    throw error;
  }
}

/* --------------------------------
   Logout
-------------------------------- */

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}