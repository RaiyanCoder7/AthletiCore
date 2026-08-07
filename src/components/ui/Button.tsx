import type { ReactNode } from "react";
import { motion } from "framer-motion";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export default function Button({
  children,
  onClick,
  disabled = false,
  type = "button",
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className="
        rounded-2xl
        bg-blue-600
        px-6
        py-3
        font-semibold
        text-white
        transition-colors
        hover:bg-blue-500
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      {children}
    </motion.button>
  );
}