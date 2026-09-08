import type { ReactNode } from "react";
import { motion } from "framer-motion";

type DashboardCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  id?: string;
};

export default function DashboardCard({
  children,
  className = "",
  hover = true,
  id,
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
        flex
        flex-col
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
      {children}
    </motion.div>
  );
}
