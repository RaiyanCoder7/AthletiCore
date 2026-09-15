import { useEffect, useState } from "react";
import { ShieldCheck, Sliders, UserRound, Award } from "lucide-react";
import { auth } from "@/services/firebase/firebase";
import { getUserProfile } from "@/services/firebase/users";

export default function SettingsHero() {
  const [role, setRole] = useState<"athlete" | "coach" | "manager">("athlete");
  const [position, setPosition] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const profile = await getUserProfile(user.uid);
        if (isMounted && profile) {
          const userRole = (profile.role?.toLowerCase() || "athlete") as
            | "athlete"
            | "coach"
            | "manager";
          setRole(userRole);
          setPosition(
            profile.position || (userRole === "coach" ? "Coach" : "Athlete")
          );
        }
      } catch (err) {
        console.error("Failed to load user profile for SettingsHero:", err);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const isCoach = role === "coach";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-colors sm:p-8">
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl ${
          isCoach
            ? "bg-emerald-500/10 dark:bg-emerald-500/15"
            : "bg-primary/10 dark:bg-primary/15"
        }`}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-500/5 blur-2xl dark:bg-indigo-500/10"
      />

      <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        {/* Left Information Area */}
        <div className="max-w-2xl space-y-3">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium ${
              isCoach
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                : "border-primary/20 bg-primary/10 text-primary"
            }`}
          >
            <Sliders size={13} className="shrink-0" />
            <span>{isCoach ? "Coach Operations & Settings" : "Account Settings"}</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {isCoach
              ? "Squad Command & System Settings."
              : "Personalize Your Experience."}
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {isCoach
              ? "Manage your staff credentials, configure default pitch logistics, set automated squad fatigue alerts, and safeguard platform access."
              : "Configure your athlete profile, calibrate training preferences, optimize display themes, and safeguard your account credentials in one centralized hub."}
          </p>
        </div>

        {/* Right Status Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:w-[440px] shrink-0">
          {/* Dynamic Staff/Profile Status Card */}
          <div className="min-w-0 rounded-xl border border-border/70 bg-muted/30 p-4 transition-colors hover:border-border hover:bg-muted/50 sm:p-5">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                isCoach
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                  : "border-primary/20 bg-primary/10 text-primary"
              }`}
            >
              {isCoach ? <Award size={18} /> : <UserRound size={18} />}
            </div>

            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {isCoach ? "Staff Role" : "Profile Status"}
            </p>

            <p className="mt-1 text-sm font-semibold tracking-tight text-foreground sm:text-base leading-snug break-words">
              {position || (isCoach ? "Coach" : "Personal Info")}
            </p>
          </div>

          {/* Security Status Card */}
          <div className="min-w-0 rounded-xl border border-border/70 bg-muted/30 p-4 transition-colors hover:border-border hover:bg-muted/50 sm:p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={18} />
            </div>

            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Account Security
            </p>

            <p className="mt-1 text-sm font-semibold tracking-tight text-foreground sm:text-base leading-snug">
              Protected
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}