import { useEffect, useState } from "react";

import { Sun, Zap } from "lucide-react";

import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";

import { auth } from "@/services/firebase/firebase";
import { getUserProfile } from "@/services/firebase/users";

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

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;

      if (!user) return;

      try {
        const data = await getUserProfile(user.uid);

        setProfile(data as UserProfile | null);
      } catch (error) {
        console.error(
          "Failed to load hero profile:",
          error
        );
      }
    };

    loadProfile();
  }, []);

  /* --------------------------------
     Greeting
  -------------------------------- */

  const currentHour = new Date().getHours();

  let greeting = "Good evening";

  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 17) {
    greeting = "Good afternoon";
  }

  const userName =
    profile?.name?.trim() || "Athlete";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white lg:p-10">

      {/* Diagonal texture */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="hero-diagonal"
            width="24"
            height="24"
            patternTransform="rotate(35)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="24" stroke="white" strokeWidth="8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-diagonal)" />
      </svg>

      {/* Watermark icon */}
      <Zap
        aria-hidden="true"
        strokeWidth={1}
        className="pointer-events-none absolute -bottom-10 -right-6 h-56 w-56 text-white/[0.06]"
      />

      {/* Background Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />

      <div className="relative max-w-2xl">

        {/* Greeting pill */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-blue-100 backdrop-blur">
          <Sun size={13} />
          {greeting}, {userName}
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold leading-tight lg:text-5xl">
          Ready to train?
        </h1>

        {/* Description */}
        <p className="mt-4 max-w-lg text-sm leading-6 text-blue-100 lg:text-base">
          Track every workout, monitor your recovery, and see how
          your performance trends week over week. Stay on pace with
          your goals and keep pushing toward your next personal
          best.
        </p>

        {/* Actions */}
        <div className="mt-8 flex gap-3">

          <Button
            onClick={() =>
              navigate("/training")
            }
          >
            Start Training
          </Button>

          <button
            type="button"
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
            className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            View Progress
          </button>

        </div>
      </div>
    </section>
  );
}
