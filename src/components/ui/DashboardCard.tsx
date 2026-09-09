import type { ReactNode } from "react";
import { motion } from "framer-motion";

const accentColors = {
  blue: "bg-primary",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
  emerald: "bg-emerald-500",
  indigo: "bg-indigo-500",
} as const;

type DashboardCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  id?: string;
  /** Optional colored strip along the top edge, tying the card to its category. */
  accent?: keyof typeof accentColors;
};

export default function DashboardCard({
  children,
  className = "",
  hover = true,
  id,
  accent,
}: DashboardCardProps) {
  return (
    <motion.div
      id={id}
      whileHover={
        hover
          ? {
              y: -4,
              scale: 1.01,
            }
          : {}
      }
      transition={{
        duration: 0.2,
      }}
      className={`
        relative
        flex
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-border
        bg-card/80
        backdrop-blur-xl
        p-6
        shadow-lg
        shadow-black/5
        dark:shadow-black/20
        transition-all
        duration-300
        ${
          hover
            ? "hover:border-primary/40 hover:shadow-primary/10"
            : ""
        }
        ${className}
      `}
    >
      {accent && (
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 top-0 h-1 ${accentColors[accent]}`}
        />
      )}

      {children}
    </motion.div>
  );
}