"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { ArrowRight, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { useGetAllPublicEventsQuery, EventData } from "@/lib/features/events/eventApiSlice";


interface DisplayEvent {
  id: string;
  title: string;
  type: string;
  description: string;
  stats: { venue: string; date: string };
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

const DEFAULT_IMAGE = "/logos/building.png";
export default function EventShowcase() {
  const { data: eventsResponse, isLoading } = useGetAllPublicEventsQuery({});
  
  const displayEvents = useMemo<DisplayEvent[]>(() => {
    if (!eventsResponse || !eventsResponse.events || !Array.isArray(eventsResponse.events)) return [];
    
    return eventsResponse.events
      .filter((e: EventData) => e.status === 'PUBLISHED' || e.status === 'ONGOING')
      .map((e: EventData, index: number) => {
        return {
            id: e._id,
            title: e.title,
            type: e.event_type || "Event",
            description: e.description || "No description available.",
            stats: { 
                venue: e.venue || "TBA", 
                date: new Date(e.event_date).toLocaleDateString() 
            },
            color: GRADIENTS[index % GRADIENTS.length],
            image: e.banner || DEFAULT_IMAGE,
        };
      });
  }, [eventsResponse]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeEvent = useMemo(() => {
      if (displayEvents.length === 0) return null;
      if (selectedId) {
          return displayEvents.find(e => e.id === selectedId) || displayEvents[0];
      }
      return displayEvents[0];
  }, [displayEvents, selectedId]);

  if (isLoading) {
      return (
          <div className="h-[800px] w-full bg-gray-900 flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
          </div>
      );
  }

  if (!activeEvent) {
      return null;
  }

  return (
    <section className="relative h-[800px] w-full overflow-hidden bg-gray-900 flex items-center">
      
      <AnimatePresence mode="popLayout">

         <div className="max-w-7xl mx-auto px-6 text-center mb-20">
                            <motion.h2 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-4xl md:text-5xl font-black text-stone-900 mb-6"
                            >
                                The <span className="text-orange-600 italic">Founders</span>
                            </motion.h2>
                            <p className="text-stone-500 max-w-2xl mx-auto">
                                A duo of visionaries dedicated to redefining the student experience at COMSATS.
                            </p>
                        </div>

                        
        <motion.div
            key={activeEvent.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 z-0"
        >
             <div className="absolute inset-0 bg-black/60 z-10" /> 
             <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${activeEvent.image})` }}
             />
             <div className={`absolute inset-0 bg-linear-to-r ${activeEvent.color} opacity-20 mix-blend-overlay z-10`} />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 container mx-auto px-6 h-full flex flex-col md:flex-row items-center gap-12 py-24">
        
        <div className="flex-1 text-white space-y-8 w-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeEvent.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center space-x-3 mb-4">
                         <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/20`}>
                            {activeEvent.type}
                         </span>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                        {activeEvent.title}
                    </h2>
                    
                    <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl mb-8">
                        {activeEvent.description}
                    </p>

                    <div className="flex items-center gap-8 mb-10 text-sm font-medium text-gray-300">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-current" />
                            <span>{activeEvent.stats.venue}</span>
                        </div>
                         <div className="flex items-center gap-2">
                             <Calendar className="w-5 h-5 text-current" />
                             <span>{activeEvent.stats.date}</span>
                         </div>
                    </div>

                    <Link href={`/events/${activeEvent.id}`} className="group w-fit flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors">
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
                {displayEvents.map((event) => (
                    <motion.div 
                        key={event.id}
                        onClick={() => setSelectedId(event.id)}
                        className={`
                            relative shrink-0 w-48 h-72 rounded-xl overflow-hidden cursor-pointer transition-all duration-500 snap-center group
                            ${activeEvent.id === event.id 
                                ? "ring-2 ring-white shadow-2xl scale-105 z-10" 
                                : "opacity-60 hover:opacity-100 hover:scale-105"}
                        `}
                        whileHover={{ y: -5 }}
                    >
                         <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${event.image})` }}
                         />
                         <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
                         
                         <div className="absolute bottom-0 left-0 p-4 w-full">
                            <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider mb-1 block">
                                {event.type}
                            </span>
                            <h3 className="text-lg font-bold text-white leading-tight">
                                {event.title}
                            </h3>
                         </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
  );
}
