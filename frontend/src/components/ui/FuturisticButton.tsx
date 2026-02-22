"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import React from "react";

interface FuturisticButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export const FuturisticButton = ({
  children,
  isLoading,
  variant = "primary",
  className,
  ...props
}: FuturisticButtonProps) => {
  const baseStyles =
    "relative px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 overflow-hidden group flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-500/30 hover:scale-[1.02]",
    secondary:
      "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 hover:border-stone-300 shadow-sm transition-all",
    outline:
      "border-2 border-orange-600 text-orange-600 hover:bg-orange-50",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${
        isLoading ? "opacity-80 cursor-not-allowed" : ""
      } ${className || ""}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Subtle Shine Effect */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};
