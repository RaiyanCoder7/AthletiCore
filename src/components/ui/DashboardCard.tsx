import type { ReactNode } from "react";
import { motion } from "framer-motion";

const accentStyles = {
  blue: "from-blue-600 via-indigo-500 to-sky-400",
  orange: "from-orange-500 via-amber-500 to-rose-500",
  rose: "from-rose-500 via-pink-500 to-orange-400",
  emerald: "from-emerald-500 via-teal-500 to-sky-400",
  indigo: "from-indigo-600 via-blue-500 to-violet-500",
} as const;

type DashboardCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  id?: string;
  accent?: keyof typeof accentStyles;
};

export default function DashboardCard({
  children,
  className = "",
  hover = false, // Disabled jumpy hover by default for dashboard telemetry
  id,
  accent,
}: DashboardCardProps) {
  return (
    <motion.div
      id={id}
      whileHover={hover ? { y: -2 } : {}}
      transition={{ duration: 0.15 }}
      className={`
        relative
        flex
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-border/80
        bg-card
        p-6
        shadow-sm
        shadow-slate-900/[0.04]
        dark:shadow-black/20
        transition-all
        duration-200
        ${hover ? "hover:border-border hover:shadow-md" : ""}
        ${className}
      `}
    >
      {/* Sleek blended gradient accent strip */}
      {accent && (
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${accentStyles[accent]}`}
        />
      )}

      {children}
    </motion.div>
  );
}