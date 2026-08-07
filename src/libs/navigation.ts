import {
  LayoutDashboard,
  User,
  BarChart3,
  Dumbbell,
  Target,
  Calendar,
  Settings,
} from "lucide-react";

export const athleteNavigation = [
  {
    title: "Performance Hub",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Training",
    href: "/training",
    icon: Dumbbell,
  },
  {
    title: "Goals",
    href: "/goals",
    icon: Target,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];