import {
  collection,
  getDocs,
  orderBy,
  query,
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

export async function getAthleteMatches(
  uid: string
): Promise<AthleteMatch[]> {
  const matchesRef = collection(
    db,
    "users",
    uid,
    "matches"
  );

  const snapshot = await getDocs(
    query(matchesRef, orderBy("date", "desc"))
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AthleteMatch[];
}

export async function getAthleteAchievements(
  uid: string
): Promise<AthleteAchievement[]> {
  const achievementsRef = collection(
    db,
    "users",
    uid,
    "achievements"
  );

  const snapshot = await getDocs(
    query(achievementsRef, orderBy("date", "desc"))
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AthleteAchievement[];
}