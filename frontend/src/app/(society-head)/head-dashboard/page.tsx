"use client";

import { motion } from "framer-motion";

export default function SocietyHeadOverviewPage() {
  return (
    <div className="space-y-8 font-(--font-family-poppins)">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">Society Head Overview</h1>
        <p className="text-sm text-stone-500 mt-1">Welcome to the central authority dashboard.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-stone-200 border-dashed rounded-3xl p-12 text-center"
      >
        <p className="text-stone-400 font-medium">Dashboard overview widgets will appear here.</p>
        <p className="text-xs text-stone-400 mt-2">Use the navigation to view pending requests.</p>
      </motion.div>
    </div>
  );
}
