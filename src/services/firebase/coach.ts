import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface CoachAthlete {
  id: string;
  name: string;
  email?: string;
  position?: string;
  category?: "FWD" | "MID" | "DEF" | "GK";
  fitnessScore: number;
  status: "Critical" | "Monitor" | "Optimal";
  availability: "Available" | "Questionable" | "Out";
  age?: number;
  height?: string | number;
  weight?: string | number;
  restingHR?: string | number;
  maxVelocity?: string | number;
  metrics?: {
    speed: number;
    strength: number;
    endurance: number;
    agility: number;
  };
  notes?: Array<{
    id: string;
    date: string;
    text: string;
    author: string;
  }>;
  lastActive?: string;
}

export interface CoachTrainingDoc {
  id?: string;
  title: string;
  squad: string;
  focus: "Conditioning" | "Tactical" | "Recovery" | "Strength";
  intensity: "High" | "Moderate" | "Low";
  date: string;
  time: string;
  duration: string;
  pitch: string;
  coachId: string;
  attendeesCount: number;
  maxSquadSize: number;
  status: "Scheduled" | "In Progress" | "Completed";
  createdAt?: any;
}

export interface TeamDoc {
  id?: string;
  name: string;
  division: string;
  athleteCount: number;
  avgReadiness: number;
  formation: string;
  homeGround: string;
  coachId: string;
  nextFixture: {
    opponent: string;
    date: string;
    competition: string;
  };
}

/**
 * 1. Listen to all athletes registered in the platform
 */
export function subscribeToAthletes(
  callback: (athletes: CoachAthlete[]) => void,
  onError?: (error: Error) => void
) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("role", "==", "athlete"));

  return onSnapshot(
    q,
    (snapshot) => {
      const athletes: CoachAthlete[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        const fitnessScore = data.fitnessScore ?? data.readinessScore ?? 85;
        let status: "Critical" | "Monitor" | "Optimal" = "Optimal";
        if (fitnessScore < 65) status = "Critical";
        else if (fitnessScore < 75) status = "Monitor";

        return {
          id: docSnap.id,
          name: data.name || "Athlete",
          email: data.email,
          position: data.position || "Flex",
          category: data.category || "MID",
          fitnessScore,
          status: data.status || status,
          availability:
            data.availability ||
            (status === "Critical" ? "Questionable" : "Available"),
          age: data.age || 20,
          height: data.height ? `${data.height} cm` : "180 cm",
          weight: data.weight ? `${data.weight} kg` : "75 kg",
          restingHR: data.restingHR ? `${data.restingHR} bpm` : "56 bpm",
          maxVelocity: data.maxVelocity ? `${data.maxVelocity} km/h` : "31.2 km/h",
          metrics: {
            speed: data.metrics?.speed ?? 82,
            strength: data.metrics?.strength ?? 80,
            endurance: data.metrics?.endurance ?? 84,
            agility: data.metrics?.agility ?? 86,
          },
          notes: data.notes || [],
          lastActive: data.lastActive || "Recently",
        };
      });

      callback(athletes);
    },
    (err) => {
      if (onError) onError(err);
      else console.error("Error subscribing to athletes:", err);
    }
  );
}

/**
 * 2. Get single athlete biometrics and notes
 */
export async function getCoachAthleteDetail(
  athleteId: string
): Promise<CoachAthlete | null> {
  const docRef = doc(db, "users", athleteId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) return null;

  const data = snap.data();
  const fitnessScore = data.fitnessScore ?? data.readinessScore ?? 85;
  let status: "Critical" | "Monitor" | "Optimal" = "Optimal";
  if (fitnessScore < 65) status = "Critical";
  else if (fitnessScore < 75) status = "Monitor";

  return {
    id: snap.id,
    name: data.name || "Athlete",
    email: data.email,
    position: data.position || "Center Midfielder",
    category: data.category || "MID",
    fitnessScore,
    status: data.status || status,
    availability: data.availability || "Available",
    age: data.age || 20,
    height: data.height ? `${data.height} cm` : "178 cm",
    weight: data.weight ? `${data.weight} kg` : "72 kg",
    restingHR: data.restingHR ? `${data.restingHR} bpm` : "54 bpm",
    maxVelocity: data.maxVelocity ? `${data.maxVelocity} km/h` : "32.4 km/h",
    metrics: {
      speed: data.metrics?.speed ?? 88,
      strength: data.metrics?.strength ?? 82,
      endurance: data.metrics?.endurance ?? 85,
      agility: data.metrics?.agility ?? 90,
    },
    notes: data.notes || [],
    lastActive: data.lastActive || "Active Today",
  };
}

/**
 * 3. Append observation note to an athlete's record
 */
export async function addAthleteCoachNote(
  athleteId: string,
  note: { text: string; author: string }
) {
  const athleteRef = doc(db, "users", athleteId);
  const notePayload = {
    id: `note-${Date.now()}`,
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    text: note.text,
    author: note.author,
  };

  await updateDoc(athleteRef, {
    notes: arrayUnion(notePayload),
  });

  return notePayload;
}

/**
 * 4. Register or invite a new athlete to the squad roster
 */
export async function createAthleteRosterEntry(athleteData: {
  name: string;
  email: string;
  position: string;
  category: "FWD" | "MID" | "DEF" | "GK";
  age: number;
}) {
  const usersRef = collection(db, "users");
  const docRef = await addDoc(usersRef, {
    ...athleteData,
    role: "athlete",
    fitnessScore: 85,
    status: "Optimal",
    availability: "Available",
    metrics: {
      speed: 80,
      strength: 80,
      endurance: 80,
      agility: 80,
    },
    notes: [],
    createdAt: serverTimestamp(),
    lastActive: "Just added",
  });
  return docRef.id;
}

/**
 * 5. Adjust workload targets and clearance status for an athlete
 */
export async function updateAthleteWorkload(
  athleteId: string,
  payload: {
    fitnessScore?: number;
    clearance: "Full Clearance" | "Conditional" | "Sidelined";
    workloadCapPercent: number;
    protocolNote?: string;
    coachName: string;
  }
) {
  const athleteRef = doc(db, "users", athleteId);

  const updates: Record<string, any> = {
    clearance: payload.clearance,
    workloadCapPercent: payload.workloadCapPercent,
    status:
      payload.clearance === "Sidelined"
        ? "Critical"
        : payload.clearance === "Conditional"
        ? "Monitor"
        : "Optimal",
    availability:
      payload.clearance === "Sidelined"
        ? "Out"
        : payload.clearance === "Conditional"
        ? "Questionable"
        : "Available",
  };

  if (typeof payload.fitnessScore === "number") {
    updates.fitnessScore = payload.fitnessScore;
  }

  await updateDoc(athleteRef, updates);

  if (payload.protocolNote?.trim()) {
    await addAthleteCoachNote(athleteId, {
      text: `[Workload Adjusted to ${payload.workloadCapPercent}% • ${payload.clearance}]: ${payload.protocolNote.trim()}`,
      author: payload.coachName,
    });
  }
}

/**
 * 6. Subscribe to scheduled training drills
 */
export function subscribeToTrainingSessions(
  callback: (sessions: CoachTrainingDoc[]) => void,
  onError?: (err: Error) => void
) {
  const sessionsRef = collection(db, "training_sessions");

  return onSnapshot(
    sessionsRef,
    (snapshot) => {
      const items: CoachTrainingDoc[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<CoachTrainingDoc, "id">),
      }));
      callback(items);
    },
    (err) => {
      if (onError) onError(err);
      else console.error("Error subscribing to training sessions:", err);
    }
  );
}

/**
 * 7. Create new pitch drill session in Firestore
 */
export async function createTrainingSessionDoc(
  session: Omit<CoachTrainingDoc, "id" | "createdAt">
) {
  const colRef = collection(db, "training_sessions");
  const docRef = await addDoc(colRef, {
    ...session,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}