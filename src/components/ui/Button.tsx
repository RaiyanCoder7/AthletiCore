import type { ReactNode } from "react";
import { motion } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs focus-visible:ring-primary/30",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/60 shadow-xs focus-visible:ring-ring/20",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-muted/60 focus-visible:ring-ring/20",
  ghost:
    "bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:ring-ring/20",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-xl",
  md: "px-5 py-2.5 text-sm rounded-xl font-medium",
  lg: "px-6 py-3 text-base rounded-2xl font-semibold",
};

export default function Button({
  children,
  onClick,
  disabled = false,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        outline-none
        transition-all
        focus-visible:ring-2
        focus-visible:ring-offset-1
        disabled:cursor-not-allowed
        disabled:opacity-40
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}