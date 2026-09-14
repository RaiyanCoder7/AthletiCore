import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  User,
  BarChart3,
  Dumbbell,
  Target,
  Calendar,
  Settings,
  X,
  Users,
  Shield,
  Activity,
} from "lucide-react";

import { auth } from "@/services/firebase/firebase";
import { getUserProfile } from "@/services/firebase/users";

const ATHLETE_MENU = [
  { name: "Dashboard", path: "/athlete", icon: LayoutDashboard },
  { name: "Profile", path: "/profile", icon: User },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "Training", path: "/training", icon: Dumbbell },
  { name: "Goals", path: "/goals", icon: Target },
  { name: "Calendar", path: "/calendar", icon: Calendar },
  { name: "Settings", path: "/settings", icon: Settings },
];

const COACH_MENU = [
  { name: "Dashboard", path: "/coach", icon: LayoutDashboard },
  { name: "Athletes", path: "/coach/athletes", icon: Users },
  { name: "Teams", path: "/coach/teams", icon: Shield },
  { name: "Training", path: "/coach/training", icon: Dumbbell },
  { name: "Performance", path: "/coach/performance", icon: Activity },
  { name: "Calendar", path: "/calendar", icon: Calendar },
  { name: "Settings", path: "/settings", icon: Settings },
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [role, setRole] = useState<string>("athlete");

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const profile = await getUserProfile(user.uid);
        if (profile?.role) {
          setRole(profile.role.toLowerCase());
        }
      } catch (err) {
        console.error("Failed to load user role for sidebar:", err);
      }
    };

    fetchUserRole();
  }, []);

  const menu = role === "coach" ? COACH_MENU : ATHLETE_MENU;

  return (
    <>
      {/* Click-outside Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Slide-over Drawer Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex h-screen w-72 flex-col border-r border-white/[0.08] bg-[#0B1017] text-neutral-100 shadow-[0_0_60px_rgba(0,0,0,0.95)] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Branding */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/10 p-1.5 shadow-lg shadow-[#22C55E]/20">
              <img
                src="/favicon.svg"
                alt="Athleticore Logo"
                className="h-full w-full object-contain filter drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              Athleti<span className="text-[#22C55E]">core</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-xl border border-white/10 p-1.5 text-neutral-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Console */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
          <div className="px-3 pb-2 pt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            {role === "coach" ? "Coach Command Console" : "Athlete Console"}
          </div>

          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/coach" || item.path === "/athlete"}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "border border-[#22C55E]/30 bg-[#22C55E]/10 text-white shadow-md shadow-[#22C55E]/10"
                      : "border border-transparent text-neutral-400 hover:border-white/5 hover:bg-white/[0.03] hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={`transition-colors ${
                        isActive
                          ? "text-[#22C55E] filter drop-shadow-[0_0_6px_rgba(34,197,94,0.4)]"
                          : "text-neutral-500 group-hover:text-neutral-300"
                      }`}
                    />
                    <span>{item.name}</span>

                    {isActive && (
                      <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-[#22C55E] shadow-[0_0_6px_#22C55E]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom System Status */}
        <div className="border-t border-white/[0.08] p-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left">
            <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400">
              <span>SYSTEM STATE</span>
              <span className="font-bold text-[#22C55E]">ONLINE</span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full bg-[#22C55E]" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}