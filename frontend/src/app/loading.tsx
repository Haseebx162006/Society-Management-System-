"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#fffdfa] flex flex-col items-center justify-center overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px] animate-pulse" />
      
      <div className="relative flex flex-col items-center justify-center z-10">
        
        {/* Main rotating rings */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-orange-500/80"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-b-2 border-l-2 border-stone-800/40"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-4 rounded-full border-t-2 border-l-2 border-orange-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
          />
          
          {/* Center core */}
          <div className="absolute w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.6)]">
            <motion.div 
              className="w-4 h-4 bg-white rounded-full mix-blend-overlay"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Loading Text */}
        <div className="mt-10 flex flex-col items-center">
          <motion.div 
            className="flex items-center gap-1 text-orange-600 font-bold tracking-[0.3em] font-display text-sm md:text-base uppercase"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span>I</span>
            <span>N</span>
            <span>I</span>
            <span>T</span>
            <span>I</span>
            <span>A</span>
            <span>L</span>
            <span>I</span>
            <span>Z</span>
            <span>I</span>
            <span>N</span>
            <span>G</span>
          </motion.div>
          
          <div className="mt-3 flex items-center gap-2">
            <motion.div 
              className="w-1.5 h-1.5 bg-orange-500 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.div 
              className="w-1.5 h-1.5 bg-orange-500 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div 
              className="w-1.5 h-1.5 bg-orange-500 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
          </div>

          <motion.div 
            className="mt-6 h-[1px] w-48 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"
            animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}
