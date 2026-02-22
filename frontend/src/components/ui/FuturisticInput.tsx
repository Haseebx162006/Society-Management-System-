"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import React, { useState } from "react";

interface FuturisticInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  rightElement?: React.ReactNode;
}

export const FuturisticInput = React.forwardRef<
  HTMLInputElement,
  FuturisticInputProps
>(({ label, icon: Icon, error, rightElement, className, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative mb-6 group">
      <div
        className={`relative flex items-center bg-stone-50 border rounded-2xl transition-all duration-500 ${
          error
            ? "border-red-200 bg-red-50/30"
            : isFocused
            ? "border-orange-500/30 bg-white ring-4 ring-orange-500/5 shadow-sm"
            : "border-stone-100 hover:border-stone-200 hover:bg-stone-100/30 shadow-xs"
        }`}
      >
        {Icon && (
          <div className={`pl-5 transition-colors duration-300 ${isFocused ? "text-orange-600" : "text-stone-300 group-hover:text-stone-400"}`}>
            <Icon size={18} strokeWidth={2.5} />
          </div>
        )}

        <input
          {...props}
          ref={ref}
          className={`w-full bg-transparent px-5 py-4 text-[15px] font-medium text-stone-900 placeholder-stone-300 focus:outline-none transition-all ${
            Icon ? "pl-3" : ""
          } ${rightElement ? "pr-12" : ""} ${className || ""}`}
          placeholder={label}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            props.onChange?.(e);
          }}
        />

        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-5 left-1 text-[10px] text-red-500 font-bold uppercase tracking-wider"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

FuturisticInput.displayName = "FuturisticInput";
