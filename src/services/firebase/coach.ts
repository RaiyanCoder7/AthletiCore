import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";

export interface CoachAthlete {
  id: string;
  name: string;
  email?: string;
  position?: string;
  category?: "FWD" | "MID" | "DEF" | "GK";
  teamId?: string;
  teamName?: string;
  fitnessScore: number;
  status: "Critical" | "Monitor" | "Optimal";
  availability: "Available" | "Questionable" | "Out";
  clearance?: "Full Clearance" | "Conditional" | "Sidelined";
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
  attendance?: Record<string, "Present" | "Late" | "Excused" | "Absent">;
  createdAt?: any;
}

export interface TeamSquadDoc {
  id?: string;
  name: string;
  division: string;
  athleteCount: number;
  avgReadiness: number;
  formation: string;
  homeGround: string;
  coachId: string;
  inviteCode?: string;
  athleteIds?: string[];
  nextFixture?: {
    opponent: string;
    date: string;
    competition: string;
  };
  createdAt?: any;
}

/* --------------------------------------------------------------------------
   ATHLETES
-------------------------------------------------------------------------- */
export function subscribeToAthletes(
  callback: (athletes: CoachAthlete[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, "users"), where("role", "==", "athlete"));

  return onSnapshot(
    q,
    (snap) => {
      const athletes: CoachAthlete[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        const fitnessScore = d.fitnessScore ?? d.readinessScore ?? 85;
        let status: "Critical" | "Monitor" | "Optimal" = "Optimal";
        if (fitnessScore < 65) status = "Critical";
        else if (fitnessScore < 75) status = "Monitor";

        return {
          id: docSnap.id,
          name: d.name || "Athlete",
          email: d.email,
          position: d.position || "Flex",
          category: d.category || "MID",
          teamId: d.teamId,
          teamName: d.teamName,
          fitnessScore,
          status: d.status || status,
          clearance:
            d.clearance ||
            (status === "Critical"
              ? "Sidelined"
              : status === "Monitor"
              ? "Conditional"
              : "Full Clearance"),
          availability:
            d.availability ||
            (status === "Critical"
              ? "Out"
              : status === "Monitor"
              ? "Questionable"
              : "Available"),
          age: d.age || 20,
          height: d.height ? `${d.height} cm` : "180 cm",
          weight: d.weight ? `${d.weight} kg` : "75 kg",
          restingHR: d.restingHR ? `${d.restingHR} bpm` : "56 bpm",
          maxVelocity: d.maxVelocity ? `${d.maxVelocity} km/h` : "31.2 km/h",
          metrics: {
            speed: d.metrics?.speed ?? 82,
            strength: d.metrics?.strength ?? 80,
            endurance: d.metrics?.endurance ?? 84,
            agility: d.metrics?.agility ?? 86,
          },
          notes: d.notes || [],
          lastActive: d.lastActive || "Recently",
        };
      });
      callback(athletes);
    },
    (err) => (onError ? onError(err) : console.error("subscribeToAthletes error:", err))
  );
}

export async function getCoachAthleteDetail(
  athleteId: string
): Promise<CoachAthlete | null> {
  const snap = await getDoc(doc(db, "users", athleteId));
  if (!snap.exists()) return null;
  const d = snap.data();
  const fitnessScore = d.fitnessScore ?? d.readinessScore ?? 85;
  let status: "Critical" | "Monitor" | "Optimal" = "Optimal";
  if (fitnessScore < 65) status = "Critical";
  else if (fitnessScore < 75) status = "Monitor";

  return {
    id: snap.id,
    name: d.name || "Athlete",
    email: d.email,
    position: d.position || "Center Midfielder",
    category: d.category || "MID",
    teamId: d.teamId,
    teamName: d.teamName,
    fitnessScore,
    status: d.status || status,
    clearance: d.clearance || "Full Clearance",
    availability: d.availability || "Available",
    age: d.age || 20,
    height: d.height ? `${d.height} cm` : "178 cm",
    weight: d.weight ? `${d.weight} kg` : "72 kg",
    restingHR: d.restingHR ? `${d.restingHR} bpm` : "54 bpm",
    maxVelocity: d.maxVelocity ? `${d.maxVelocity} km/h` : "32.4 km/h",
    metrics: {
      speed: d.metrics?.speed ?? 88,
      strength: d.metrics?.strength ?? 82,
      endurance: d.metrics?.endurance ?? 85,
      agility: d.metrics?.agility ?? 90,
    },
    notes: d.notes || [],
    lastActive: d.lastActive || "Active Today",
  };
}

export async function addAthleteCoachNote(
  athleteId: string,
  note: { text: string; author: string }
) {
  const payload = {
    id: `note-${Date.now()}`,
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    text: note.text,
    author: note.author,
  };
  await updateDoc(doc(db, "users", athleteId), { notes: arrayUnion(payload) });
  return payload;
}

export async function createAthleteRosterEntry(athleteData: {
  name: string;
  email: string;
  position: string;
  category: "FWD" | "MID" | "DEF" | "GK";
  age: number;
  teamId?: string;
  teamName?: string;
}) {
  const docRef = await addDoc(collection(db, "users"), {
    ...athleteData,
    role: "athlete",
    fitnessScore: 85,
    status: "Optimal",
    clearance: "Full Clearance",
    availability: "Available",
    metrics: { speed: 80, strength: 80, endurance: 80, agility: 80 },
    notes: [],
    createdAt: serverTimestamp(),
    lastActive: "Just added",
  });
  return docRef.id;
}

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
  if (typeof payload.fitnessScore === "number")
    updates.fitnessScore = payload.fitnessScore;

  await updateDoc(doc(db, "users", athleteId), updates);

  if (payload.protocolNote?.trim()) {
    await addAthleteCoachNote(athleteId, {
      text: `[Workload ${payload.workloadCapPercent}% • ${payload.clearance}]: ${payload.protocolNote.trim()}`,
      author: payload.coachName,
    });
  }
}

/* --------------------------------------------------------------------------
   TEAMS & INVITE CODES
-------------------------------------------------------------------------- */
export function generateTeamCode(teamName: string): string {
  const prefix = teamName
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${randomNum}`;
}

export function subscribeToTeams(
  callback: (teams: TeamSquadDoc[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, "teams"),
    (snap) => {
      const teams = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<TeamSquadDoc, "id">),
      }));
      callback(teams);
    },
    (err) => (onError ? onError(err) : console.error("subscribeToTeams error:", err))
  );
}

export async function createTeamSquad(
  team: Omit<TeamSquadDoc, "id" | "coachId" | "createdAt">
) {
  const coachId = auth.currentUser?.uid || "coach-system";
  const inviteCode = team.inviteCode || generateTeamCode(team.name);

  const docRef = await addDoc(collection(db, "teams"), {
    ...team,
    coachId,
    inviteCode,
    athleteIds: team.athleteIds || [],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function joinTeamWithCode(athleteId: string, inviteCode: string) {
  const code = inviteCode.trim().toUpperCase();

  const teamsRef = collection(db, "teams");
  const q = query(teamsRef, where("inviteCode", "==", code));
  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error("Invalid team invite code. Please check with your coach.");
  }

  const teamDoc = snap.docs[0];
  const teamData = teamDoc.data();
  const teamId = teamDoc.id;

  // Add athlete ID to the squad
  await updateDoc(doc(db, "teams", teamId), {
    athleteIds: arrayUnion(athleteId),
  });

  // Assign team to athlete profile
  await updateDoc(doc(db, "users", athleteId), {
    teamId: teamId,
    teamName: teamData.name || "Squad",
  });

  return { teamId, teamName: teamData.name };
}

/* --------------------------------------------------------------------------
   TRAINING SESSIONS & ATTENDANCE
-------------------------------------------------------------------------- */
export function subscribeToTrainingSessions(
  callback: (sessions: CoachTrainingDoc[]) => void,
  onError?: (err: Error) => void
) {
  return onSnapshot(
    collection(db, "training_sessions"),
    (snap) => {
      const items: CoachTrainingDoc[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CoachTrainingDoc, "id">),
      }));
      callback(items);
    },
    (err) =>
      onError
        ? onError(err)
        : console.error("subscribeToTrainingSessions error:", err)
  );
}

export async function createTrainingSessionDoc(
  session: Omit<CoachTrainingDoc, "id" | "coachId" | "createdAt">
) {
  const coachId = auth.currentUser?.uid || "coach-system";
  const docRef = await addDoc(collection(db, "training_sessions"), {
    ...session,
    coachId,
    attendance: {},
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateSessionAttendance(
  sessionId: string,
  athleteId: string,
  status: "Present" | "Late" | "Excused" | "Absent"
) {
  await updateDoc(doc(db, "training_sessions", sessionId), {
    [`attendance.${athleteId}`]: status,
  });
}

export async function updateSessionStatus(
  sessionId: string,
  status: "Scheduled" | "In Progress" | "Completed"
) {
  await updateDoc(doc(db, "training_sessions", sessionId), { status });
}