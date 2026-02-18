"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import React, { useState } from "react";

interface FuturisticInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

export const FuturisticInput = React.forwardRef<
  HTMLInputElement,
  FuturisticInputProps
>(({ label, icon: Icon, error, className, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className="relative mb-6 group">
      <div
        className={`relative flex items-center bg-gray-50 border rounded-xl transition-all duration-300 ${
          error
            ? "border-red-300 bg-red-50"
            : isFocused
            ? "border-indigo-500 shadow-md bg-white ring-1 ring-indigo-500/20"
            : "border-gray-200 hover:border-gray-300 hover:bg-white"
        }`}
      >
        {Icon && (
          <div className={`pl-4 transition-colors ${isFocused ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500"}`}>
            <Icon size={20} />
          </div>
        )}

        <input
          {...props}
          ref={ref}
          className={`w-full bg-transparent px-4 py-3.5 text-gray-900 placeholder-transparent focus:outline-none transition-all ${
            Icon ? "pl-3" : ""
          } ${className || ""}`}
          placeholder={label}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(!!e.target.value);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
        />

        <motion.label
          initial={false}
          animate={{
            y: isFocused || hasValue || props.value ? -28 : 0,
            x: isFocused || hasValue || props.value ? (Icon ? -32 : 0) : 0,
            scale: isFocused || hasValue || props.value ? 0.85 : 1,
            color: error ? "#ef4444" : isFocused ? "#4f46e5" : "#6b7280", // indigo-600 or gray-500
          }}
          className={`absolute left-4 pointer-events-none transition-all duration-200 font-medium ${
            Icon ? "pl-8" : ""
          }`}
        >
          {label}
        </motion.label>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-5 left-1 text-xs text-red-500 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

FuturisticInput.displayName = "FuturisticInput";
