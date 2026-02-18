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
      "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02]",
    secondary:
      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
    outline:
      "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
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
