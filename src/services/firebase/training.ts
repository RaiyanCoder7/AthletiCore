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

export interface TrainingSession {
  id?: string;
  date: string;
  day: string;
  workout: string;
  time: string;
  duration: string;
  type: string;
  status: string;
}

export async function addTrainingSession(
  uid: string,
  session: TrainingSession
) {
  const trainingRef = collection(
    db,
    "users",
    uid,
    "trainingSessions"
  );

  await addDoc(trainingRef, {
    date: session.date,
    day: session.day,
    workout: session.workout,
    time: session.time,
    duration: session.duration,
    type: session.type,
    status: session.status,
    createdAt: serverTimestamp(),
  });
}

export async function getTrainingSessions(
  uid: string
): Promise<TrainingSession[]> {
  const trainingRef = collection(
    db,
    "users",
    uid,
    "trainingSessions"
  );

  const trainingQuery = query(
    trainingRef,
    orderBy("date", "asc")
  );

  const snapshot = await getDocs(trainingQuery);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<TrainingSession, "id">),
  }));
}

/* Start / update a workout */
export async function updateTrainingSessionStatus(
  uid: string,
  sessionId: string,
  status: string
) {
  const sessionRef = doc(
    db,
    "users",
    uid,
    "trainingSessions",
    sessionId
  );

  await updateDoc(sessionRef, {
    status,
  });
}