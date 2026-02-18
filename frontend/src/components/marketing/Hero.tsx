"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BarChart2, Shield, Users } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-15 pb-20 lg:pt-34 lg:pb-32 overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl mix-blend-multiply animate-blob" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          COMSATS Lahore Official Portal
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 max-w-5xl"
        >
          The Heart of Campus Life at <br className="hidden md:block" />
          <span className="text-indigo-600">
            COMSATS Lahore
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-gray-600 mb-10 max-w-3xl leading-relaxed mx-auto"
        >
          The unified platform for <span className="font-semibold text-gray-900">societies</span> to manage operations, 
          and for <span className="font-semibold text-gray-900">students</span> to discover, join, and lead communities.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link
            href="/societies"
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            Find a Society
          </Link>
          <Link
            href="/register-society"
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-full font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4 text-gray-500" />
            Manage Society
          </Link>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative w-full max-w-5xl"
        >
          {/* Removed gradient overlay for cleaner look as requested */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden ring-1 ring-gray-900/5">
              <div className="h-8 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
            {/* Creates a mockup dashboard UI using CSS/Tailwind directly for preview */}
            <div className="grid grid-cols-12 h-[500px] bg-gray-50/50">
                {/* Sidebar Mockup */}
                <div className="col-span-2 border-r border-gray-200 bg-white p-4 hidden md:flex flex-col gap-4">
                    <div className="h-8 w-24 bg-gray-100 rounded-md animate-pulse" />
                    <div className="h-4 w-32 bg-gray-50 rounded-md mt-4" />
                    <div className="h-4 w-28 bg-gray-50 rounded-md" />
                    <div className="h-4 w-32 bg-gray-50 rounded-md" />
                </div>
                {/* Main Content Mockup */}
                <div className="col-span-12 md:col-span-10 p-6 md:p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div className="h-10 w-48 bg-white rounded-lg shadow-sm" />
                        <div className="flex gap-3">
                            <div className="h-10 w-10 bg-white rounded-full shadow-sm" />
                            <div className="h-10 w-10 bg-white rounded-full shadow-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between mb-4">
                                    <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                                        {i === 1 ? <Users size={20} /> : i === 2 ? <Shield size={20} /> : <BarChart2 size={20} />}
                                    </div>
                                </div>
                                <div className="h-6 w-16 bg-gray-100 rounded mb-2" />
                                <div className="h-4 w-24 bg-gray-50 rounded" />
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm h-64 p-6">
                        <div className="h-6 w-32 bg-gray-100 rounded mb-6" />
                        <div className="flex items-end gap-2 h-40">
                             {[40, 60, 45, 70, 50, 80, 65, 85, 90, 75].map((h, i) => (
                                 <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-indigo-50 hover:bg-indigo-100 rounded-t-md transition-colors" />
                             ))}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
