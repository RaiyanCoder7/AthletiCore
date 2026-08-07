import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

export interface PerformanceTest {
  id?: string;
  date: string;

  sprintSpeed: number;
  strength: number;
  stamina: number;
  agility: number;
  accuracy: number;
  endurance: number;
}

export async function addPerformanceTest(
  uid: string,
  performance: PerformanceTest
) {
  const performanceRef = collection(
    db,
    "users",
    uid,
    "performanceTests"
  );

  await addDoc(performanceRef, {
    date: performance.date,
    sprintSpeed: performance.sprintSpeed,
    strength: performance.strength,
    stamina: performance.stamina,
    agility: performance.agility,
    accuracy: performance.accuracy,
    endurance: performance.endurance,
    createdAt: serverTimestamp(),
  });
}

export async function getPerformanceTests(
  uid: string
): Promise<PerformanceTest[]> {
  const performanceRef = collection(
    db,
    "users",
    uid,
    "performanceTests"
  );

  const performanceQuery = query(
    performanceRef,
    orderBy("date", "asc")
  );

  const snapshot = await getDocs(performanceQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...(document.data() as Omit<PerformanceTest, "id">),
  }));
}

export async function getLatestPerformanceTest(
  uid: string
): Promise<PerformanceTest | null> {
  const tests = await getPerformanceTests(uid);

  if (tests.length === 0) {
    return null;
  }

  return tests[tests.length - 1];
}