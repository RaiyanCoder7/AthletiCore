import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  User,
  BarChart3,
  Dumbbell,
  Target,
  Calendar,
  Settings,
} from "lucide-react";

export type DomainAccent =
  | "blue"
  | "indigo"
  | "emerald"
  | "orange"
  | "rose"
  | "amber";

export interface AthleteNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  accent: DomainAccent;
  exact?: boolean;
  badge?: string | number;
  activeClass: {
    badge: string;
    border: string;
    glow: string;
    icon: string;
  };
}

export const athleteNavigation: readonly AthleteNavItem[] = [
  {
    title: "Performance Hub",
    href: "/",
    icon: LayoutDashboard,
    accent: "blue",
    exact: true,
    activeClass: {
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      border: "border-blue-500/30",
      glow: "bg-blue-500/10",
      icon: "text-blue-600 dark:text-blue-400",
    },
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    accent: "indigo",
    activeClass: {
      badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      border: "border-indigo-500/30",
      glow: "bg-indigo-500/10",
      icon: "text-indigo-600 dark:text-indigo-400",
    },
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    accent: "blue",
    activeClass: {
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      border: "border-blue-500/30",
      glow: "bg-blue-500/10",
      icon: "text-blue-600 dark:text-blue-400",
    },
  },
  {
    title: "Training",
    href: "/training",
    icon: Dumbbell,
    accent: "orange",
    activeClass: {
      badge: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
      border: "border-orange-500/30",
      glow: "bg-orange-500/10",
      icon: "text-orange-600 dark:text-orange-400",
    },
  },
  {
    title: "Goals",
    href: "/goals",
    icon: Target,
    accent: "emerald",
    activeClass: {
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      border: "border-emerald-500/30",
      glow: "bg-emerald-500/10",
      icon: "text-emerald-600 dark:text-emerald-400",
    },
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Calendar,
    accent: "indigo",
    activeClass: {
      badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      border: "border-indigo-500/30",
      glow: "bg-indigo-500/10",
      icon: "text-indigo-600 dark:text-indigo-400",
    },
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    accent: "blue",
    activeClass: {
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      border: "border-blue-500/30",
      glow: "bg-blue-500/10",
      icon: "text-blue-600 dark:text-blue-400",
    },
  },
] as const;