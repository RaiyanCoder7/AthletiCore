import { useEffect, useState } from "react";
import { ArrowUpRight, Sparkles, Sun, Moon } from "lucide-react";
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
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const data = await getUserProfile(user.uid);
        setProfile(data as UserProfile | null);
      } catch (error) {
        console.error("Failed to load hero profile:", error);
      }
    };

    loadProfile();
  }, []);

  /* --------------------------------
      Dynamic Greeting & Icon
  -------------------------------- */
  const currentHour = new Date().getHours();
  let greeting = "Good evening";
  let GreetingIcon = Moon;

  if (currentHour < 12) {
    greeting = "Good morning";
    GreetingIcon = Sun;
  } else if (currentHour < 17) {
    greeting = "Good afternoon";
    GreetingIcon = Sun;
  }

  const userName = profile?.name?.trim() || "Athlete";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm shadow-slate-900/[0.04] transition-colors dark:shadow-black/20 sm:p-8">
      {/* Subtle ambient gradient mesh in the background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 right-1/3 h-52 w-52 rounded-full bg-blue-500/5 blur-2xl dark:bg-blue-500/10"
      />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Text & Content Block */}
        <div className="max-w-2xl space-y-3">
          {/* Greeting Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <GreetingIcon size={13} className="shrink-0" />
            <span>
              {greeting}, {userName}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Ready to train?
          </h1>

          {/* Description */}
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Track your workout load, evaluate recovery readiness, and monitor weekly trends. Stay aligned with your targets and keep building toward your next personal best.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0">
          <Button
            size="md"
            variant="primary"
            onClick={() => navigate("/training")}
            className="shadow-sm"
          >
            <Sparkles size={16} />
            <span>Start Training</span>
          </Button>

          <Button
            size="md"
            variant="secondary"
            onClick={() => {
              document
                .getElementById("dashboard-performance")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
            }}
          >
            <span>View Progress</span>
            <ArrowUpRight size={15} className="text-muted-foreground" />
          </Button>
        </div>
      </div>
    </section>
  );
}