import {
  Settings,
  ShieldCheck,
  UserRound,
  Sliders,
} from "lucide-react";

export default function SettingsHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xs transition-colors lg:p-8">
      {/* Shared Diagonal Pattern Texture */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="settings-hero-diagonal"
            width="24"
            height="24"
            patternTransform="rotate(35)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="24" stroke="white" strokeWidth="8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#settings-hero-diagonal)" />
      </svg>

      {/* Ambient Lighting Accents */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-400/20 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        {/* Left Content Area */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium text-blue-100 backdrop-blur">
            <Sliders size={13} />
            <span>Account Settings</span>
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-blue-200/80">
            AthletiCore Preferences
          </p>

          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Personalize Your Experience.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-blue-100/90 sm:text-base">
            Configure your athlete profile, manage training notifications, optimize display themes, and safeguard your account credentials in one centralized hub.
          </p>
        </div>

        {/* Right Status Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:w-[360px]">
          {/* Profile Card */}
          <div className="group rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur transition-all duration-200 hover:bg-white/[0.14]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-blue-100 transition-transform duration-200 group-hover:scale-105">
              <UserRound size={20} />
            </div>

            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-blue-100/70">
              Profile Status
            </p>

            <p className="mt-1 text-lg font-bold tracking-tight text-white">
              Personal Info
            </p>
          </div>

          {/* Security Card */}
          <div className="group rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur transition-all duration-200 hover:bg-white/[0.14]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 transition-transform duration-200 group-hover:scale-105">
              <ShieldCheck size={20} />
            </div>

            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-blue-100/70">
              Account Security
            </p>

            <p className="mt-1 text-lg font-bold tracking-tight text-white">
              Protected
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}