"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { ArrowRight, Users, Calendar } from "lucide-react";
import Link from "next/link"
import { useGetAllSocietiesQuery } from "@/lib/features/societies/societyApiSlice";

interface SocietyData {
  _id: string;
  name: string;
  description: string;
  category?: string;
  status: string;
  logo?: string;
  [key: string]: unknown;
}

interface DisplaySociety {
  id: string;
  name: string;
  category: string;
  description: string;
  stats: { members: string; events: string };
  color: string;
  image: string;
}

const GRADIENTS = [
  "from-blue-600 to-cyan-500",
  "from-purple-600 to-pink-500",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-green-600",
  "from-indigo-600 to-blue-700",
];

// const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2070";
const DEFAULT_IMAGE = "/logos/building.png";

export default function SocietyShowcase() {
  const { data: societiesData, isLoading } = useGetAllSocietiesQuery({});
  
  const displaySocieties = useMemo<DisplaySociety[]>(() => {
    if (!societiesData || !Array.isArray(societiesData)) return [];
    
    return societiesData
      .filter((s: SocietyData) => s.status === 'ACTIVE')
      .map((s: SocietyData, index: number) => {
        const seed = s._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const members = (seed % 450) + 50; 
        const events = (seed % 15) + 5;

        return {
            id: s._id,
            name: s.name,
            category: s.category || "General",
            description: s.description || "No description available.",
            stats: { 
                members: `${members}+`, 
                events: `${events}/yr` 
            },
            color: GRADIENTS[index % GRADIENTS.length],
            image: s.logo || DEFAULT_IMAGE,
        };
      });
  }, [societiesData]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeSociety = useMemo(() => {
      if (displaySocieties.length === 0) return null;
      if (selectedId) {
          return displaySocieties.find(s => s.id === selectedId) || displaySocieties[0];
      }
      return displaySocieties[0];
  }, [displaySocieties, selectedId]);

  if (isLoading) {
      return (
          <div className="h-[800px] w-full bg-gray-900 flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
          </div>
      );
  }

  if (!activeSociety) {
      return null;
  }

  return (
    <section className="relative h-[800px] w-full overflow-hidden bg-gray-900 flex items-center">
      
      <AnimatePresence mode="popLayout">
        <motion.div
            key={activeSociety.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 z-0"
        >
             <div className="absolute inset-0 bg-black/60 z-10" /> 
             <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${activeSociety.image})` }}
             />
             <div className={`absolute inset-0 bg-linear-to-r ${activeSociety.color} opacity-20 mix-blend-overlay z-10`} />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 container mx-auto px-6 h-full flex flex-col md:flex-row items-center gap-12 py-24">
        
        <div className="flex-1 text-white space-y-8 w-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSociety.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center space-x-3 mb-4">
                         <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/20`}>
                            {activeSociety.category}
                         </span>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                        {activeSociety.name}
                    </h2>
                    
                    <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl mb-8">
                        {activeSociety.description}
                    </p>

                    <div className="flex items-center gap-8 mb-10 text-sm font-medium text-gray-300">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-current" />
                            <span>{activeSociety.stats.members} Members</span>
                        </div>
                         <div className="flex items-center gap-2">
                             <Calendar className="w-5 h-5 text-current" />
                             <span>{activeSociety.stats.events} Events</span>
                         </div>
                    </div>

                    <Link href={`/societies/${activeSociety.id}`} className="group w-fit flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors">
                        <span>Learn More</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </motion.div>
            </AnimatePresence>
        </div>

      </div>
      
        <div className="absolute bottom-0 right-0 w-full md:w-auto h-auto z-30 flex flex-col items-end pb-8 pl-4 pointer-events-none">
             
             <div className="flex justify-end mb-4 px-8 pointer-events-auto">
                 <span className="text-xs font-medium text-gray-400 uppercase tracking-widest animate-pulse">Swipe to explore &rarr;</span>
             </div>

            <div className="flex space-x-6 overflow-x-auto pb-4 px-8 items-center snap-x snap-mandatory 
                [&::-webkit-scrollbar]:h-1 
                [&::-webkit-scrollbar-track]:bg-transparent 
                [&::-webkit-scrollbar-thumb]:bg-white/20 
                [&::-webkit-scrollbar-thumb]:rounded-full 
                hover:[&::-webkit-scrollbar-thumb]:bg-white/40 
                transition-colors w-full md:w-[600px] pointer-events-auto">
                {displaySocieties.map((society) => (
                    <motion.div 
                        key={society.id}
                        onClick={() => setSelectedId(society.id)}
                        className={`
                            relative shrink-0 w-48 h-72 rounded-xl overflow-hidden cursor-pointer transition-all duration-500 snap-center group
                            ${activeSociety.id === society.id 
                                ? "ring-2 ring-white shadow-2xl scale-105 z-10" 
                                : "opacity-60 hover:opacity-100 hover:scale-105"}
                        `}
                        whileHover={{ y: -5 }}
                    >
                         <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${society.image})` }}
                         />
                         <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
                         
                         <div className="absolute bottom-0 left-0 p-4 w-full">
                            <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider mb-1 block">
                                {society.category}
                            </span>
                            <h3 className="text-lg font-bold text-white leading-tight">
                                {society.name}
                            </h3>
                         </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
  );
}
