import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "./firebase";

export interface Goal {
  id?: string;

  name: string;
  type: string;
  target: string;
  current: string;
  progress: number;

  deadline: string;
  description: string;

  status: "Active" | "Completed";

  createdAt?: unknown;
  completedAt?: unknown;
}

/* -----------------------------
   Add Goal
----------------------------- */

export async function addGoal(
  uid: string,
  goal: Omit<Goal, "id" | "createdAt" | "completedAt">
) {
  const goalsRef = collection(
    db,
    "users",
    uid,
    "goals"
  );

  await addDoc(goalsRef, {
    name: goal.name,
    type: goal.type,
    target: goal.target,
    current: goal.current,
    progress: goal.progress,
    deadline: goal.deadline,
    description: goal.description,
    status: goal.status,
    createdAt: serverTimestamp(),
  });
}

/* -----------------------------
   Get Goals
----------------------------- */

export async function getGoals(
  uid: string
): Promise<Goal[]> {
  const goalsRef = collection(
    db,
    "users",
    uid,
    "goals"
  );

  const goalsQuery = query(
    goalsRef,
    orderBy("deadline", "asc")
  );

  const snapshot = await getDocs(goalsQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...(document.data() as Omit<Goal, "id">),
  }));
}

/* -----------------------------
   Update Goal Progress
----------------------------- */

export async function updateGoalProgress(
  uid: string,
  goalId: string,
  progress: number,
  current: string
) {
  const goalRef = doc(
    db,
    "users",
    uid,
    "goals",
    goalId
  );

  const updates: {
    progress: number;
    current: string;
    status?: "Active" | "Completed";
    completedAt?: unknown;
  } = {
    progress,
    current,
  };

  if (progress >= 100) {
    updates.progress = 100;
    updates.status = "Completed";
    updates.completedAt = serverTimestamp();
  }

  await updateDoc(goalRef, updates);
}