"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useGetAllSocietiesQuery } from "@/lib/features/societies/societyApiSlice";
import { Users, LayoutGrid, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function SocietyHeadSocietiesPage() {
  const { data: societies = [], isLoading, error } = useGetAllSocietiesQuery(undefined);

  return (
    <div className="space-y-8 font-(--font-family-poppins)">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">Active Societies</h1>
        <p className="text-sm text-stone-500 mt-1">View all currently active and approved societies across the campus.</p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <p className="font-bold">Failed to load societies. Please try again later.</p>
          </div>
        ) : societies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border text-stone-400 border-stone-200 border-dashed rounded-3xl p-12 text-center"
          >
            <CheckCircle2 className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="font-bold text-lg text-stone-900">No Active Societies</p>
            <p className="text-sm mt-1">There are no approved societies operating yet.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {societies.map((society: any, index: number) => (
              <motion.div
                key={society._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Decorative Top Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600" />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-xl text-stone-900 tracking-tight leading-tight group-hover:text-orange-600 transition-colors">
                      {society.name}
                    </h3>
                  </div>
                  <div className="inline-flex px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider mb-4">
                    {society.category}
                  </div>
                  <p className="text-sm text-stone-500 line-clamp-3 leading-relaxed">
                    {society.description || "No description provided for this society."}
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-500">
                    <Users className="w-4 h-4 text-stone-400" />
                    <span className="text-sm font-semibold">{society.membersCount || 0} Members</span>
                  </div>
                  
                  <Link 
                    href={`/societies/${society._id}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
