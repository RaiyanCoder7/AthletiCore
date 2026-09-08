import type { ReactNode } from "react";
import { Activity, LineChart, HeartPulse, Users } from "lucide-react";

const FEATURES = [
  {
    icon: LineChart,
    label: "AI-powered performance analytics",
    color: "text-blue-300",
    bg: "bg-blue-500/15",
  },
  {
    icon: HeartPulse,
    label: "Recovery and injury tracking",
    color: "text-emerald-300",
    bg: "bg-emerald-500/15",
  },
  {
    icon: Users,
    label: "Built for teams, coaches, and athletes",
    color: "text-pink-300",
    bg: "bg-pink-500/15",
  },
];

/**
 * Split-screen auth shell used by LoginPage and RegisterPage.
 * Left: brand / value-proposition panel (hidden on small screens).
 * Right: the actual form, passed in as children.
 */
export default function AuthShell({
  heading,
  subheading,
  children,
}: {
  heading: string;
  subheading: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-zinc-950">
      {/* Left: brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        {/* Radial glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-blue-600/25 blur-[120px]" />
          <div className="absolute -bottom-24 -right-16 h-[380px] w-[380px] rounded-full bg-emerald-500/20 blur-[120px]" />
        </div>

        {/* Diagonal texture */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="auth-diagonal"
              width="26"
              height="26"
              patternTransform="rotate(35)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="26" stroke="white" strokeWidth="10" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-diagonal)" />
        </svg>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <Activity size={22} className="text-blue-400" />
          <span className="text-base font-medium text-white">
            Athletic
            <span className="text-blue-400">Core</span>
          </span>
        </div>

        {/* Value prop */}
        <div className="relative z-10">
          <h2 className="mb-4 max-w-md text-3xl font-medium leading-tight text-white">
            The command center for serious athletes.
          </h2>

          <p className="mb-8 max-w-sm text-sm text-zinc-400">
            Track training, monitor recovery, and turn data into performance
            gains.
          </p>

          <div className="flex flex-col gap-4">
            {FEATURES.map(({ icon: Icon, label, color, bg }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg}`}
                >
                  <Icon size={14} className={color} />
                </div>
                <span className="text-sm text-zinc-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-zinc-600">
          Trusted by 200+ athletes and coaches
        </p>
      </div>

      {/* Right: form panel */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Logo shown only on small screens, where left panel is hidden */}
          <div className="mb-8 text-center lg:hidden">
            <h1 className="text-2xl font-bold text-white">
              Athletic
              <span className="text-blue-500">Core</span>
            </h1>
          </div>

          <h2 className="mb-1 text-xl font-medium text-white">{heading}</h2>
          <p className="mb-8 text-sm text-zinc-500">{subheading}</p>

          {children}
        </div>
      </div>
    </div>
  );
}
