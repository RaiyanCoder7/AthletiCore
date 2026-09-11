import { ShieldCheck, Sliders, UserRound } from "lucide-react";

export default function SettingsHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm shadow-slate-900/[0.04] transition-colors dark:shadow-black/20 sm:p-8">
      {/* Ambient lighting accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-500/5 blur-2xl dark:bg-indigo-500/10"
      />

      <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        {/* Left Content Area */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
            <Sliders size={13} className="shrink-0" />
            <span>Account Settings</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Personalize Your Experience.
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Configure your athlete profile, calibrate training preferences, optimize display themes, and safeguard your account credentials in one centralized hub.
          </p>
        </div>

        {/* Right Status Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:w-[360px]">
          {/* Profile Status Card */}
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4 transition-colors hover:border-border hover:bg-muted/50 sm:p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <UserRound size={18} />
            </div>

            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Profile Status
            </p>

            <p className="mt-1 text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Personal Info
            </p>
          </div>

          {/* Security Status Card */}
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4 transition-colors hover:border-border hover:bg-muted/50 sm:p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={18} />
            </div>

            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Account Security
            </p>

            <p className="mt-1 text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Protected
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}