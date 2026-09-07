import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  BarChart3,
  Dumbbell,
  Target,
  Calendar,
  Settings,
} from "lucide-react";

import athleticoreLogo from "@/assets/logos/athleticore-logo.png";

const menu = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Profile", path: "/profile", icon: User },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "Training", path: "/training", icon: Dumbbell },
  { name: "Goals", path: "/goals", icon: Target },
  { name: "Calendar", path: "/calendar", icon: Calendar },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div className="flex items-center gap-3">
          <img
            src={athleticoreLogo}
            alt="Athleticore"
            className="h-8 w-8 object-contain"
          />

          <h1 className="text-xl font-semibold text-sidebar-foreground">
            Athleticore
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <Icon size={20} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}