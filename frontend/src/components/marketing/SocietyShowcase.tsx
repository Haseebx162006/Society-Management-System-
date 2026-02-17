"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Users, Calendar } from "lucide-react";

const societies = [
  { 
    id: 1,
    name: "CodeSoc", 
    category: "Technology", 
    description: "The premier coding society. We host hackathons, coding competitions, and workshops to help you master modern tech stacks.",
    stats: { members: "500+", events: "24/yr" },
    color: "from-blue-600 to-cyan-500",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2070" 
  },
  { 
    id: 2,
    name: "Debating Society", 
    category: "Arts & Culture", 
    description: "Voice your opinion. Join the most prestigious debating platform and compete in national and international tournaments.",
    stats: { members: "200+", events: "12/yr" },
    color: "from-purple-600 to-pink-500",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=2070"
  },
  { 
    id: 3,
    name: "Music Society", 
    category: "Performing Arts", 
    description: "For the rhythm in you. Jam sessions, concerts, and musical training for vocalists and instrumentalists alike.",
    stats: { members: "350+", events: "15/yr" },
    color: "from-amber-500 to-orange-600",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=2070"
  },
  { 
    id: 4,
    name: "Gamer's Hub", 
    category: "E-Sports", 
    description: "Level up your game. Competitive e-sports tournaments, casual gaming nights, and a community for every gamer.",
    stats: { members: "600+", events: "30/yr" },
    color: "from-emerald-500 to-green-600",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070"
  },
  { 
    id: 5,
    name: "IEEE", 
    category: "Engineering", 
    description: "Advancing technology for humanity. Connect with the world's largest technical professional organization.",
    stats: { members: "450+", events: "20/yr" },
    color: "from-indigo-600 to-blue-700",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2070"
  },
];

export default function SocietyShowcase() {
  const [activeSociety, setActiveSociety] = useState(societies[0]);

  return (
    <section className="relative h-[800px] w-full overflow-hidden bg-gray-900 flex items-center">
      
      {/* Dynamic Background */}
      <AnimatePresence mode="popLayout">
        <motion.div
            key={activeSociety.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 z-0"
        >
             <div className="absolute inset-0 bg-black/60 z-10" /> {/* Overlay */}
             <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${activeSociety.image})` }}
             />
             <div className={`absolute inset-0 bg-linear-to-r ${activeSociety.color} opacity-20 mix-blend-overlay z-10`} />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 container mx-auto px-6 h-full flex flex-col md:flex-row items-center gap-12 py-24">
        
        {/* Left Side: Detail View */}
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
                         <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/20`}>
                            {activeSociety.category}
                         </span>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
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

                    <button className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors">
                        <span>Learn More</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>
                </motion.div>
            </AnimatePresence>
        </div>

      </div>
      
        {/* Right Side: Horizontal Scrollable Cards */}
        <div className="absolute bottom-0 right-0 w-full md:w-auto h-auto z-30 flex flex-col items-end pb-8 pl-4 pointer-events-none">
             
             {/* Hint at scroll/swipe */}
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
                {societies.map((society) => (
                    <motion.div 
                        key={society.id}
                        onClick={() => setActiveSociety(society)}
                        className={`
                            relative shrink-0 w-48 h-72 rounded-xl overflow-hidden cursor-pointer transition-all duration-500 snap-center group
                            ${activeSociety.id === society.id 
                                ? "ring-2 ring-white shadow-2xl scale-105 z-10" 
                                : "opacity-60 hover:opacity-100 hover:scale-105"}
                        `}
                        whileHover={{ y: -5 }}
                    >
                         {/* Card Image */}
                         <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${society.image})` }}
                         />
                         <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
                         
                         {/* Card Content */}
                         <div className="absolute bottom-0 left-0 p-4 w-full">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1 block">
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
