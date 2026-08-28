import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "./firebase";
import {
  createUserProfile,
  getUserProfile,
} from "./users";

/* --------------------------------
   Email / Password Registration
-------------------------------- */

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  try {
    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user = userCredential.user;

    await updateProfile(user, {
      displayName: name,
    });

    await createUserProfile(
      user.uid,
      name,
      email
    );

    return user;
  } catch (error: any) {
    console.error(
      "Firebase registration error:",
      error
    );

    throw error;
  }
}

/* --------------------------------
   Email / Password Login
-------------------------------- */

export async function loginUser(
  email: string,
  password: string
) {
  try {
    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    return userCredential.user;
  } catch (error: any) {
    console.error(
      "Firebase login error:",
      error
    );

    throw error;
  }
}

/* --------------------------------
   Google Authentication
-------------------------------- */

const googleProvider =
  new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export async function loginWithGoogle() {
  try {
    const result =
      await signInWithPopup(
        auth,
        googleProvider
      );

    const user = result.user;

    /*
     * Check whether the Athleticore
     * Firestore profile already exists.
     */

    const existingProfile =
      await getUserProfile(user.uid);

    /*
     * Google account is new to Athleticore.
     * Create a Firestore profile.
     */

    if (!existingProfile) {
      await createUserProfile(
        user.uid,
        user.displayName || "Athlete",
        user.email || ""
      );
    }

    return user;
  } catch (error: any) {
    console.error(
      "Google authentication error:",
      error
    );

    throw error;
  }
}

/* --------------------------------
   Logout
-------------------------------- */

export async function logoutUser() {
  await signOut(auth);
}