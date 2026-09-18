import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

/* --------------------------------------------------------------------------
   Domain Types & Interfaces
-------------------------------------------------------------------------- */

export interface TeamMatchFixture {
  id?: string;
  opponent: string;
  venue: string;
  date: string;
  time: string;
  competition: "League" | "Cup" | "Friendly" | "Playoffs";
  isHome: boolean;
  status: "Upcoming" | "Live" | "Completed" | "Postponed";
  score?: {
    team: number;
    opponent: number;
  };
  lineupIds?: string[];
  notes?: string;
  createdAt?: any;
}

export interface TeamStatistics {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
  avgReadiness: number;
  winRatePercent: number;
}

export interface DetailedTeamProfile {
  id: string;
  name: string;
  code: string;
  division: string;
  formation?: string;
  logoUrl?: string;
  description?: string;
  homeGround: string;
  headCoachId?: string;
  headCoachName?: string;
  athleteIds: string[];
  inviteCode?: string;
  stats?: TeamStatistics;
  createdAt?: any;
}

/* --------------------------------------------------------------------------
   Team Profile Subscriptions & CRUD
-------------------------------------------------------------------------- */

export function subscribeToTeamProfile(
  teamId: string,
  callback: (team: DetailedTeamProfile | null) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, "teams", teamId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      const data = snap.data();
      callback({
        id: snap.id,
        name: data.name || "Squad",
        code: data.code || data.inviteCode || "SQD",
        division: data.division || "Regional",
        formation: data.formation || "4-3-3 Holding",
        logoUrl: data.logoUrl,
        description: data.description || "",
        homeGround: data.homeGround || "Pitch A - Main Stadium",
        headCoachId: data.headCoachId,
        headCoachName: data.headCoachName || "Head Coach",
        athleteIds: data.athleteIds || [],
        inviteCode: data.inviteCode,
        stats: data.stats || {
          matchesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          cleanSheets: 0,
          avgReadiness: data.avgReadiness || 85,
          winRatePercent: 0,
        },
        createdAt: data.createdAt,
      });
    },
    (err) => (onError ? onError(err) : console.error("subscribeToTeamProfile error:", err))
  );
}

export async function setInitialTeamProfile(
  teamId: string,
  teamData: Omit<DetailedTeamProfile, "id" | "stats">
) {
  const teamRef = doc(db, "teams", teamId);
  await setDoc(
    teamRef,
    {
      ...teamData,
      stats: {
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        cleanSheets: 0,
        avgReadiness: 85,
        winRatePercent: 0,
      },
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateTeamProfile(
  teamId: string,
  updates: Partial<Omit<DetailedTeamProfile, "id" | "stats" | "createdAt">>
) {
  const teamRef = doc(db, "teams", teamId);
  await updateDoc(teamRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function assignTeamCoach(
  teamId: string,
  coachId: string,
  coachName: string
) {
  const teamRef = doc(db, "teams", teamId);
  await updateDoc(teamRef, {
    headCoachId: coachId,
    headCoachName: coachName,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTeamSquad(teamId: string) {
  const teamRef = doc(db, "teams", teamId);
  const teamSnap = await getDoc(teamRef);

  if (teamSnap.exists()) {
    const athleteIds: string[] = teamSnap.data().athleteIds || [];
    const batch = writeBatch(db);

    athleteIds.forEach((uid) => {
      const athleteRef = doc(db, "users", uid);
      batch.update(athleteRef, { teamId: null, teamName: null });
    });

    batch.delete(teamRef);
    await batch.commit();
  } else {
    await deleteDoc(teamRef);
  }
}

export async function getTeamsByDivision(division: string): Promise<DetailedTeamProfile[]> {
  const teamsRef = collection(db, "teams");
  const q = query(teamsRef, where("division", "==", division));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<DetailedTeamProfile, "id">),
  }));
}

export async function updateTeamRoster(
  teamId: string,
  teamName: string,
  athleteId: string,
  action: "add" | "remove"
) {
  const teamRef = doc(db, "teams", teamId);
  const userRef = doc(db, "users", athleteId);
  const batch = writeBatch(db);

  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) throw new Error("Team not found.");

  const teamData = teamSnap.data();
  const coachId = teamData.coachId;
  if (!coachId) throw new Error("Team is missing its coach assignment.");

  if (action === "add") {
    batch.update(teamRef, { athleteIds: arrayUnion(athleteId) });
    batch.update(userRef, {
      teamId,
      teamName,
      coachIds: arrayUnion(coachId),
    });
  } else {
    batch.update(teamRef, { athleteIds: arrayRemove(athleteId) });
    batch.update(userRef, {
      teamId: null,
      teamName: null,
      coachIds: arrayRemove(coachId),
    });
  }

  await batch.commit();
}

/* --------------------------------------------------------------------------
   Team Matches Subcollection: teams/{teamId}/matches
-------------------------------------------------------------------------- */

export function subscribeToTeamMatches(
  teamId: string,
  callback: (matches: TeamMatchFixture[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, "teams", teamId, "matches");
  return onSnapshot(
    colRef,
    (snap) => {
      const matches = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<TeamMatchFixture, "id">),
      }));
      callback(matches);
    },
    (err) => (onError ? onError(err) : console.error("subscribeToTeamMatches error:", err))
  );
}

export async function scheduleTeamMatch(
  teamId: string,
  match: Omit<TeamMatchFixture, "id">
) {
  const colRef = collection(db, "teams", teamId, "matches");
  const docRef = await addDoc(colRef, {
    ...match,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteTeamMatch(teamId: string, matchId: string) {
  const matchRef = doc(db, "teams", teamId, "matches", matchId);
  await deleteDoc(matchRef);
}

/* --------------------------------------------------------------------------
   Match Scoring & Outcome Logging
-------------------------------------------------------------------------- */

export async function recordMatchResult(
  teamId: string,
  matchId: string,
  result: {
    teamScore: number;
    opponentScore: number;
    notes?: string;
    lineupIds?: string[];
  }
) {
  const matchRef = doc(db, "teams", teamId, "matches", matchId);
  const teamRef = doc(db, "teams", teamId);

  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) throw new Error("Team not found");

  const currentStats: TeamStatistics = teamSnap.data().stats || {
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    cleanSheets: 0,
    avgReadiness: 85,
    winRatePercent: 0,
  };

  const isWin = result.teamScore > result.opponentScore;
  const isDraw = result.teamScore === result.opponentScore;
  const isLoss = result.teamScore < result.opponentScore;
  const isCleanSheet = result.opponentScore === 0;

  const matchesPlayed = currentStats.matchesPlayed + 1;
  const wins = currentStats.wins + (isWin ? 1 : 0);
  const draws = currentStats.draws + (isDraw ? 1 : 0);
  const losses = currentStats.losses + (isLoss ? 1 : 0);
  const goalsFor = currentStats.goalsFor + result.teamScore;
  const goalsAgainst = currentStats.goalsAgainst + result.opponentScore;
  const cleanSheets = currentStats.cleanSheets + (isCleanSheet ? 1 : 0);
  const winRatePercent = Math.round((wins / matchesPlayed) * 100);

  const batch = writeBatch(db);

  // 1. Update match fixture state
  batch.update(matchRef, {
    status: "Completed",
    score: {
      team: result.teamScore,
      opponent: result.opponentScore,
    },
    notes: result.notes || "",
    ...(result.lineupIds ? { lineupIds: result.lineupIds } : {}),
    updatedAt: serverTimestamp(),
  });

  // 2. Roll up updated statistics to team profile
  batch.update(teamRef, {
    stats: {
      ...currentStats,
      matchesPlayed,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      cleanSheets,
      winRatePercent,
    },
  });

  await batch.commit();
}