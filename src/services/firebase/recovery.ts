import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "./firebase";

export interface RecoveryEntry {
  id?: string;
  date: string;
  sleepQuality: number;
  hydration: number;
  energyLevel: number;
  muscleRecovery: number;
  recoveryScore: number;
  createdAt?: unknown;
}

/* --------------------------------
   Add / Update Recovery Entry
--------------------------------- */

export async function addRecoveryEntry(
  uid: string,
  recovery: Omit<RecoveryEntry, "id" | "createdAt">
) {
  const recoveryRef = doc(
    db,
    "users",
    uid,
    "recoveryEntries",
    recovery.date
  );

  await setDoc(
    recoveryRef,
    {
      date: recovery.date,
      sleepQuality: recovery.sleepQuality,
      hydration: recovery.hydration,
      energyLevel: recovery.energyLevel,
      muscleRecovery: recovery.muscleRecovery,
      recoveryScore: recovery.recoveryScore,
      createdAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

/* --------------------------------
   Get All Recovery Entries
--------------------------------- */

export async function getRecoveryEntries(
  uid: string
): Promise<RecoveryEntry[]> {
  const recoveryRef = collection(
    db,
    "users",
    uid,
    "recoveryEntries"
  );

  const recoveryQuery = query(
    recoveryRef,
    orderBy("date", "asc")
  );

  const snapshot = await getDocs(recoveryQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...(document.data() as Omit<
      RecoveryEntry,
      "id"
    >),
  }));
}

/* --------------------------------
   Get Today's Recovery
--------------------------------- */

export async function getTodayRecovery(
  uid: string
): Promise<RecoveryEntry | null> {
  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const recoveryRef = doc(
    db,
    "users",
    uid,
    "recoveryEntries",
    todayString
  );

  const snapshot = await getDoc(recoveryRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<
      RecoveryEntry,
      "id"
    >),
  };
}

/* --------------------------------
   Realtime Today's Recovery
--------------------------------- */

export function subscribeToTodayRecovery(
  uid: string,
  callback: (recovery: RecoveryEntry | null) => void
) {
  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const recoveryRef = doc(
    db,
    "users",
    uid,
    "recoveryEntries",
    todayString
  );

  const unsubscribe = onSnapshot(
    recoveryRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      callback({
        id: snapshot.id,
        ...(snapshot.data() as Omit<
          RecoveryEntry,
          "id"
        >),
      });
    },
    (error) => {
      console.error(
        "Failed to listen to today's recovery:",
        error
      );

      callback(null);
    }
  );

  return unsubscribe;
}