import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "./firebase";
import { createUserProfile } from "./users";

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
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

export async function logoutUser() {
  await signOut(auth);
}