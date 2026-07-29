"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { ArrowRight, Users, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useGetAllSocietiesQuery } from "@/lib/features/societies/societyApiSlice";
import { truncateWords } from "@/lib/utils";

interface SocietyData {
  _id: string;
  name: string;
  description: string;
  category?: string;
  status: string;
  logo?: string;
  membersCount?: number;
  [key: string]: unknown;
}

interface DisplaySociety {
  id: string;
  name: string;
  category: string;
  description: string;
  stats: { members: string; events: string };
  image: string;
}

const DEFAULT_IMAGE = "/logo.png?v=1";

const FALLBACK_SOCIETIES: DisplaySociety[] = [
  {
    id: "comsoc",
    name: "COMSOC Platform",
    category: "Primary Platform",
    description: "The official governing student body unifying technology, leadership, and campus innovation across COMSATS.",
    stats: { members: "1,200+", events: "25+/yr" },
    image: DEFAULT_IMAGE,
  },
  {
    id: "ctec",
    name: "CTEC Tech Club",
    category: "Tech Powerhouse",
    description: "Driving hands-on developer hackathons, AI bootcamps, and open-source tech projects for future engineers.",
    stats: { members: "850+", events: "18+/yr" },
    image: DEFAULT_IMAGE,
  },
  {
    id: "literary",
    name: "Literary Society",
    category: "Creative & Arts",
    description: "Fostering world-class eloquence, parliamentary debate, creative writing, and dramatic arts excellence.",
    stats: { members: "450+", events: "12+/yr" },
    image: DEFAULT_IMAGE,
  }
];

export default function SocietyShowcase() {
  const { data: societiesData, isLoading } = useGetAllSocietiesQuery({ limit: 6 });
  
  const displaySocieties = useMemo<DisplaySociety[]>(() => {
    if (!societiesData || !Array.isArray(societiesData) || societiesData.length === 0) {
      return FALLBACK_SOCIETIES;
    }
    
    return societiesData
      .filter((s: SocietyData) => s.status === 'ACTIVE')
      .map((s: SocietyData) => {
        const seed = s._id ? s._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 10;
        const events = (seed % 15) + 5;

        return {
          id: s._id,
          name: s.name,
          category: s.category || "Official Society",
          description: s.description || "Leading student organization committed to campus excellence and community.",
          stats: { 
            members: s.membersCount !== undefined ? `${s.membersCount}+` : "150+", 
            events: `${events}/yr` 
          },
          image: s.logo || DEFAULT_IMAGE,
        };
      });
  }, [societiesData]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeSociety = useMemo(() => {
    if (displaySocieties.length === 0) return FALLBACK_SOCIETIES[0];
    if (selectedId) {
      return displaySocieties.find(s => s.id === selectedId) || displaySocieties[0];
    }
    return displaySocieties[0];
  }, [displaySocieties, selectedId]);

  if (isLoading) {
    return (
      <section className="relative h-[800px] w-full overflow-hidden bg-stone-950 flex items-center justify-center border-t border-stone-800">
        <div className="w-10 h-10 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </section>
    );
  }

  return (
    <>
      {/* Desktop/Tablet Enhanced Slider Layout (md+) */}
      <section className="hidden md:flex relative h-[650px] w-full overflow-hidden bg-stone-950 items-center transform-gpu selection:bg-orange-500 selection:text-black">
        
        {/* Dynamic Background Image Crossfade with Ken Burns Scale Effect */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeSociety.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-0 transform-gpu"
          >
            {/* Multi-layered Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/75 to-stone-950/40 z-10" /> 
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/60 z-10" />
            
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
              style={{ backgroundImage: `url(${activeSociety.image})` }}
            />
            
            {/* Ambient Orange Overlay Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/15 via-transparent to-amber-500/10 mix-blend-screen z-10 pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-10" />

        {/* Main Content Info Area */}
        <div className="relative z-20 container mx-auto px-8 lg:px-12 h-full flex flex-col justify-center py-16">
          <div className="max-w-2xl space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSociety.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                {/* Category Pill Tag */}
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-[0.2em] bg-white/10 backdrop-blur-xl border border-white/20 text-orange-400 shadow-inner">
                    <Sparkles className="w-3 h-3 text-orange-400" />
                    {activeSociety.category}
                  </span>
                </div>

                {/* Main Title */}
                <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
                  {activeSociety.name}
                </h2>
                
                {/* Description */}
                <p className="text-base lg:text-lg text-stone-300 font-light leading-relaxed max-w-xl">
                  {truncateWords(activeSociety.description, 24)}
                </p>

                {/* Glassmorphic Stats Pills */}
                <div className="flex items-center gap-4 pt-1 text-xs font-mono text-stone-300">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900/70 backdrop-blur-md border border-stone-800">
                    <Users className="w-3.5 h-3.5 text-orange-400" />
                    <span><strong className="text-white font-bold">{activeSociety.stats.members}</strong> Members</span>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900/70 backdrop-blur-md border border-stone-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span><strong className="text-white font-bold">{activeSociety.stats.events}</strong> Events</span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <Link 
                    href={`/societies/${activeSociety.id}`} 
                    className="group inline-flex items-center gap-3 px-7 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-full hover:from-orange-400 hover:to-amber-400 transition-all duration-300 shadow-[0_0_35px_rgba(249,115,22,0.3)] hover:shadow-[0_0_45px_rgba(249,115,22,0.5)] hover:scale-105"
                  >
                    <span>Explore Profile</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        {/* Bottom Right Horizontal Carousel Preview Deck */}
        <div className="absolute bottom-0 right-0 w-full md:w-auto h-auto z-30 flex flex-col items-end pb-6 pr-6 pl-4 pointer-events-none">
          <div className="flex items-center gap-2 mb-3 px-2 pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span className="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-widest">
              Click to preview &rarr;
            </span>
          </div>

          <div className="flex space-x-3.5 overflow-x-auto pb-2 px-2 items-center snap-x snap-mandatory 
            [&::-webkit-scrollbar]:h-1 
            [&::-webkit-scrollbar-track]:bg-transparent 
            [&::-webkit-scrollbar-thumb]:bg-orange-500/40 
            [&::-webkit-scrollbar-thumb]:rounded-full 
            hover:[&::-webkit-scrollbar-thumb]:bg-orange-500 
            transition-colors w-full md:w-[480px] pointer-events-auto"
          >
            {displaySocieties.map((society, idx) => {
              const isActive = activeSociety.id === society.id;
              return (
                <motion.div 
                  key={society.id}
                  onClick={() => setSelectedId(society.id)}
                  whileHover={{ y: -4, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`
                    relative shrink-0 w-38 h-56 rounded-xl overflow-hidden cursor-pointer transition-all duration-400 snap-center group border transform-gpu
                    ${isActive 
                      ? "ring-2 ring-orange-500 border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.4)] scale-105 z-10" 
                      : "border-stone-800/80 opacity-60 hover:opacity-100 hover:border-stone-700"}
                  `}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${society.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
                  
                  {/* Top Index Pill */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                      isActive ? "bg-orange-500 text-stone-950" : "bg-stone-900/80 backdrop-blur-md text-stone-300 border border-stone-800"
                    }`}>
                      0{idx + 1}
                    </span>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-0 left-0 p-3.5 w-full">
                    <span className="text-[9px] font-mono font-bold text-orange-400 uppercase tracking-wider mb-0.5 block">
                      {society.category}
                    </span>
                    <h3 className="text-xs font-bold text-white leading-tight line-clamp-1">
                      {society.name}
                    </h3>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mobile Card Grid Layout (< md) */}
      <section className="md:hidden py-16 w-full bg-stone-950 text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col gap-8">
            <div className="space-y-2 mb-4">
              <span className="text-orange-500 font-mono font-bold text-xs tracking-widest uppercase">Explore</span>
              <h2 className="text-4xl font-black text-white">Student Societies</h2>
            </div>
            {displaySocieties.slice(0, 5).map((society, index) => (
              <motion.div
                key={society.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 flex flex-col"
              >
                <div className="relative h-56 w-full">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${society.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-stone-900/80 backdrop-blur-md border border-stone-700 text-orange-400">
                      {society.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{society.name}</h3>
                  <p className="text-stone-400 text-sm mb-6 line-clamp-3">
                    {truncateWords(society.description, 20)}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-stone-800">
                    <div className="flex items-center gap-2 text-stone-400 font-mono text-xs font-bold">
                      <Users className="w-4 h-4 text-orange-500" />
                      <span>{society.stats.members} Members</span>
                    </div>
                    <Link href={`/societies/${society.id}`} className="text-orange-500 font-bold text-sm flex items-center gap-1">
                      Learn More <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

