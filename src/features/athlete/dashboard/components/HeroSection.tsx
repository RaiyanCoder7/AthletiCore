import { useEffect, useState } from "react";

import {
  Trophy,
  Activity,
  Flame,
  HeartPulse,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";

import { auth } from "@/services/firebase/firebase";
import { getUserProfile } from "@/services/firebase/users";
import { getTrainingSessions } from "@/services/firebase/training";
import { getTodayRecovery } from "@/services/firebase/recovery";

import type { TrainingSession } from "@/services/firebase/training";

interface UserProfile {
  name?: string;
  email?: string;
  role?: string;
  age?: number;
  height?: number;
  weight?: number;
  position?: string;
  team?: string;
  dominantFoot?: string;
  location?: string;
}

export default function HeroSection() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [sessions, setSessions] = useState<
    TrainingSession[]
  >([]);

  const [recovery, setRecovery] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [
          profileData,
          trainingData,
          recoveryData,
        ] = await Promise.all([
          getUserProfile(user.uid),
          getTrainingSessions(user.uid),
          getTodayRecovery(user.uid),
        ]);

        setProfile(
          profileData as UserProfile | null
        );

        setSessions(trainingData);

        if (recoveryData) {
          setRecovery(
            recoveryData.recoveryScore
          );
        } else {
          setRecovery(null);
        }
      } catch (error) {
        console.error(
          "Failed to load dashboard data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  /* --------------------------------
     Greeting
  -------------------------------- */

  const currentHour =
    new Date().getHours();

  let greeting = "Good Evening";

  if (currentHour < 12) {
    greeting = "Good Morning";
  } else if (currentHour < 17) {
    greeting = "Good Afternoon";
  }

  const userName =
    profile?.name?.trim() || "Athlete";

  /* --------------------------------
     Current Week
  -------------------------------- */

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const startOfWeek =
    new Date(today);

  const day =
    startOfWeek.getDay();

  const difference =
    day === 0 ? 6 : day - 1;

  startOfWeek.setDate(
    startOfWeek.getDate() -
      difference
  );

  startOfWeek.setHours(
    0,
    0,
    0,
    0
  );

  const endOfWeek =
    new Date(startOfWeek);

  endOfWeek.setDate(
    endOfWeek.getDate() + 6
  );

  endOfWeek.setHours(
    23,
    59,
    59,
    999
  );

  /* --------------------------------
     Weekly Training
  -------------------------------- */

  const weeklySessions =
    sessions.filter(
      (session) => {
        const sessionDate =
          new Date(
            `${session.date}T00:00:00`
          );

        return (
          sessionDate >= startOfWeek &&
          sessionDate <= endOfWeek &&
          session.status !== "Rest"
        );
      }
    );

  const completedSessions =
    weeklySessions.filter(
      (session) =>
        session.status ===
        "Completed"
    );

  const weeklyGoal = 6;

  const weeklyProgress =
    Math.min(
      Math.round(
        (completedSessions.length /
          weeklyGoal) *
          100
      ),
      100
    );

  /* --------------------------------
     Display values
  -------------------------------- */

  const trainingDisplay =
    loading
      ? "..."
      : String(
          weeklySessions.length
        );

  const performanceDisplay =
    loading
      ? "..."
      : String(
          weeklyProgress
        );

  const completedDisplay =
    loading
      ? "..."
      : `${completedSessions.length}/${weeklyGoal}`;

  const recoveryDisplay =
    loading
      ? "..."
      : recovery !== null
      ? `${recovery}%`
      : "—";

  const recoverySubtitle =
    recovery !== null
      ? "Today's recovery"
      : "No recovery data";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 text-white">

      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">

        {/* LEFT */}
        <div className="max-w-2xl">

          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
            <Trophy size={16} />
            Athlete Dashboard
          </div>

          {/* Greeting */}
          <p className="text-lg text-blue-100">
            {greeting}, {userName} 👋
          </p>

          {/* Heading */}
          <h1 className="mt-4 text-6xl font-bold leading-tight">
            Welcome Back.
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-lg leading-8 text-blue-100">
            Track every workout, monitor recovery,
            analyse your performance, improve your
            fitness and achieve your next personal best.
          </p>

          {/* Actions */}
          <div className="mt-8 flex gap-4">

            <Button
              onClick={() =>
                navigate("/training")
              }
            >
              Start Training
            </Button>

            <Button
              onClick={() => {
                document
                  .getElementById(
                    "dashboard-performance"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
              }}
            >
              View Progress
            </Button>

          </div>
        </div>

        {/* RIGHT */}
        <div className="grid grid-cols-2 gap-4">

          {/* Training */}
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <Flame className="mb-4 text-orange-200" />

            <p className="text-sm text-blue-100">
              Training
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              {trainingDisplay}
            </h2>

            <p className="mt-1 text-xs text-blue-200">
              Sessions this week
            </p>
          </div>

          {/* Performance */}
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <Activity className="mb-4 text-blue-100" />

            <p className="text-sm text-blue-100">
              Performance
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              {performanceDisplay}
              {loading ? "" : "%"}
            </h2>

            <p className="mt-1 text-xs text-blue-200">
              Weekly completion
            </p>
          </div>

          {/* Recovery */}
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <HeartPulse className="mb-4 text-pink-200" />

            <p className="text-sm text-blue-100">
              Recovery
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              {recoveryDisplay}
            </h2>

            <p className="mt-1 text-xs text-blue-200">
              {recoverySubtitle}
            </p>
          </div>

          {/* Weekly Goal */}
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <Trophy className="mb-4 text-yellow-200" />

            <p className="text-sm text-blue-100">
              Weekly Goal
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              {completedDisplay}
            </h2>

            <p className="mt-1 text-xs text-blue-200">
              Completed workouts
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}