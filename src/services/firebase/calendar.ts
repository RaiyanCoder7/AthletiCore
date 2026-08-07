import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";

export interface CalendarEvent {
  id?: string;

  title: string;
  type: string;
  date: string;
  time: string;
  notes: string;

  createdAt?: unknown;
}

/* -----------------------------
   Add Calendar Event
----------------------------- */

export async function addCalendarEvent(
  uid: string,
  event: Omit<CalendarEvent, "id" | "createdAt">
) {
  const eventsRef = collection(
    db,
    "users",
    uid,
    "calendarEvents"
  );

  await addDoc(eventsRef, {
    title: event.title,
    type: event.type,
    date: event.date,
    time: event.time,
    notes: event.notes,
    createdAt: serverTimestamp(),
  });
}

/* -----------------------------
   Get Calendar Events
----------------------------- */

export async function getCalendarEvents(
  uid: string
): Promise<CalendarEvent[]> {
  const eventsRef = collection(
    db,
    "users",
    uid,
    "calendarEvents"
  );

  const eventsQuery = query(
    eventsRef,
    orderBy("date", "asc")
  );

  const snapshot = await getDocs(eventsQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...(document.data() as Omit<
      CalendarEvent,
      "id"
    >),
  }));
}

/* -----------------------------
   Update Calendar Event
----------------------------- */

export async function updateCalendarEvent(
  uid: string,
  eventId: string,
  event: Omit<CalendarEvent, "id" | "createdAt">
) {
  const eventRef = doc(
    db,
    "users",
    uid,
    "calendarEvents",
    eventId
  );

  await updateDoc(eventRef, {
    title: event.title,
    type: event.type,
    date: event.date,
    time: event.time,
    notes: event.notes,
  });
}

/* -----------------------------
   Delete Calendar Event
----------------------------- */

export async function deleteCalendarEvent(
  uid: string,
  eventId: string
) {
  const eventRef = doc(
    db,
    "users",
    uid,
    "calendarEvents",
    eventId
  );

  await deleteDoc(eventRef);
}