import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";

export interface AthleteMatch {
  id: string;
  opponent?: string;
  result?: "Win" | "Draw" | "Loss";
  date?: string;
  competition?: string;
}

export interface AthleteAchievement {
  id: string;
  title: string;
  description?: string;
  type?: "trophy" | "medal" | "award" | "star";
  date?: string;
}

/* =========================
   MATCHES
========================= */

export async function getAthleteMatches(
  uid: string
): Promise<AthleteMatch[]> {
  const matchesRef = collection(
    db,
    "users",
    uid,
    "matches"
  );

  const snapshot = await getDocs(matchesRef);

  return snapshot.docs
    .map((doc): AthleteMatch => ({
      id: doc.id,
      ...(doc.data() as Omit<AthleteMatch, "id">),
    }))
    .sort((a, b) => {
      const dateA = a.date
        ? new Date(a.date).getTime()
        : 0;

      const dateB = b.date
        ? new Date(b.date).getTime()
        : 0;

      return dateB - dateA;
    });
}

export async function createAthleteMatch(
  uid: string,
  data: Omit<AthleteMatch, "id">
) {
  const matchesRef = collection(
    db,
    "users",
    uid,
    "matches"
  );

  await addDoc(matchesRef, data);
}

export async function updateAthleteMatch(
  uid: string,
  matchId: string,
  data: Partial<Omit<AthleteMatch, "id">>
) {
  const matchRef = doc(
    db,
    "users",
    uid,
    "matches",
    matchId
  );

  await updateDoc(matchRef, data);
}

export async function deleteAthleteMatch(
  uid: string,
  matchId: string
) {
  const matchRef = doc(
    db,
    "users",
    uid,
    "matches",
    matchId
  );

  await deleteDoc(matchRef);
}

/* =========================
   ACHIEVEMENTS
========================= */

export async function getAthleteAchievements(
  uid: string
): Promise<AthleteAchievement[]> {
  const achievementsRef = collection(
    db,
    "users",
    uid,
    "achievements"
  );

  const snapshot = await getDocs(achievementsRef);

  return snapshot.docs
    .map((doc): AthleteAchievement => ({
      id: doc.id,
      ...(doc.data() as Omit<AthleteAchievement, "id">),
    }))
    .sort((a, b) => {
      const dateA = a.date
        ? new Date(a.date).getTime()
        : 0;

      const dateB = b.date
        ? new Date(b.date).getTime()
        : 0;

      return dateB - dateA;
    });
}

export async function createAthleteAchievement(
  uid: string,
  data: Omit<AthleteAchievement, "id">
) {
  const achievementsRef = collection(
    db,
    "users",
    uid,
    "achievements"
  );

  await addDoc(achievementsRef, data);
}

export async function updateAthleteAchievement(
  uid: string,
  achievementId: string,
  data: Partial<Omit<AthleteAchievement, "id">>
) {
  const achievementRef = doc(
    db,
    "users",
    uid,
    "achievements",
    achievementId
  );

  await updateDoc(achievementRef, data);
}

export async function deleteAthleteAchievement(
  uid: string,
  achievementId: string
) {
  const achievementRef = doc(
    db,
    "users",
    uid,
    "achievements",
    achievementId
  );

  await deleteDoc(achievementRef);
}