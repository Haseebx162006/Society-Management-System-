"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { ArrowRight, MapPin, Calendar, Sparkles, Ticket } from "lucide-react";
import Link from "next/link";
import { useGetFeaturedEventsQuery, EventData } from "@/lib/features/events/eventApiSlice";
import { truncateWords } from "@/lib/utils";

interface DisplayEvent {
  id: string;
  title: string;
  type: string;
  description: string;
  stats: { venue: string; date: string };
  image: string;
}

const DEFAULT_IMAGE = "/logo.png?v=1";

const FALLBACK_EVENTS: DisplayEvent[] = [
  {
    id: "hackathon-2026",
    title: "COMSATS Annual Hackathon 2026",
    type: "Tech Competition",
    description: "48-hour intensive coding marathon bringing top developer talent together to solve real-world industry challenges.",
    stats: { venue: "Auditorium Hall A", date: "Oct 15, 2026" },
    image: DEFAULT_IMAGE,
  },
  {
    id: "gala-night",
    title: "Grand Cultural & Music Gala",
    type: "Cultural Event",
    description: "An extraordinary evening featuring live musical performances, theatrical plays, and vibrant campus celebrations.",
    stats: { venue: "Main Sports Ground", date: "Nov 02, 2026" },
    image: DEFAULT_IMAGE,
  },
  {
    id: "lead-summit",
    title: "National Leadership Summit",
    type: "Conference",
    description: "Keynote speeches and networking panels with leading entrepreneurs, innovators, and industry visionaries.",
    stats: { venue: "Seminar Complex", date: "Dec 10, 2026" },
    image: DEFAULT_IMAGE,
  }
];

export default function EventShowcase() {
  const { data: eventsData, isLoading } = useGetFeaturedEventsQuery();
  
  const displayEvents = useMemo<DisplayEvent[]>(() => {
    if (!eventsData || !Array.isArray(eventsData) || eventsData.length === 0) {
      return FALLBACK_EVENTS;
    }
    
    return eventsData
      .filter((e: EventData) => e.status === 'PUBLISHED' || e.status === 'ONGOING')
      .map((e: EventData) => {
        return {
          id: e._id,
          title: e.title,
          type: e.event_type || "Featured Event",
          description: e.description || "Join us for an unforgettable campus experience with hands-on learning and networking.",
          stats: { 
            venue: e.venue || "Campus Auditorium", 
            date: e.event_date ? new Date(e.event_date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "Upcoming" 
          },
          image: e.banner || DEFAULT_IMAGE,
        };
      });
  }, [eventsData]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeEvent = useMemo(() => {
    if (displayEvents.length === 0) return FALLBACK_EVENTS[0];
    if (selectedId) {
      return displayEvents.find(e => e.id === selectedId) || displayEvents[0];
    }
    return displayEvents[0];
  }, [displayEvents, selectedId]);

  if (isLoading) {
    return (
      <section className="relative h-[650px] w-full overflow-hidden bg-stone-950 flex items-center justify-center border-t border-stone-800">
        <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </section>
    );
  }

  if (!activeEvent) {
      return null;
  }

  return (
    <>
      {/* Desktop/Tablet Enhanced Slider Layout (md+) */}
      <section className="hidden md:flex relative h-[650px] w-full overflow-hidden bg-stone-950 items-center transform-gpu selection:bg-amber-500 selection:text-black border-t border-stone-900">
        
        {/* Dynamic Background Image Crossfade with Ken Burns Scale Effect */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeEvent.id}
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
              style={{ backgroundImage: `url(${activeEvent.image})` }}
            />
            
            {/* Ambient Amber Overlay Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/15 via-transparent to-orange-500/10 mix-blend-screen z-10 pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-10" />

        {/* Main Content Info Area */}
        <div className="relative z-20 container mx-auto px-8 lg:px-12 h-full flex flex-col justify-center py-16">
          <div className="max-w-2xl space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeEvent.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                {/* Category Pill Tag */}
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-[0.2em] bg-white/10 backdrop-blur-xl border border-white/20 text-amber-400 shadow-inner">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {activeEvent.type}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Registration Open
                  </span>
                </div>

                {/* Main Title */}
                <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
                  {activeEvent.title}
                </h2>
                
                {/* Description */}
                <p className="text-base lg:text-lg text-stone-300 font-light leading-relaxed max-w-xl">
                  {truncateWords(activeEvent.description, 24)}
                </p>

                {/* Glassmorphic Stats Pills */}
                <div className="flex items-center gap-4 pt-1 text-xs font-mono text-stone-300">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900/70 backdrop-blur-md border border-stone-800">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    <span><strong className="text-white font-bold">{activeEvent.stats.venue}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900/70 backdrop-blur-md border border-stone-800">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span><strong className="text-white font-bold">{activeEvent.stats.date}</strong></span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <Link 
                    href={`/events/${activeEvent.id}`} 
                    className="group inline-flex items-center gap-3 px-7 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-full hover:from-orange-400 hover:to-amber-400 transition-all duration-300 shadow-[0_0_35px_rgba(249,115,22,0.3)] hover:shadow-[0_0_45px_rgba(249,115,22,0.5)] hover:scale-105"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Reserve Seat</span>
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
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-widest">
              Click to preview &rarr;
            </span>
          </div>

          <div className="flex space-x-3.5 overflow-x-auto pb-2 px-2 items-center snap-x snap-mandatory 
            [&::-webkit-scrollbar]:h-1 
            [&::-webkit-scrollbar-track]:bg-transparent 
            [&::-webkit-scrollbar-thumb]:bg-amber-500/40 
            [&::-webkit-scrollbar-thumb]:rounded-full 
            hover:[&::-webkit-scrollbar-thumb]:bg-amber-500 
            transition-colors w-full md:w-[480px] pointer-events-auto"
          >
            {displayEvents.map((event, idx) => {
              const isActive = activeEvent.id === event.id;
              return (
                <motion.div 
                  key={event.id}
                  onClick={() => setSelectedId(event.id)}
                  whileHover={{ y: -4, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`
                    relative shrink-0 w-38 h-56 rounded-xl overflow-hidden cursor-pointer transition-all duration-400 snap-center group border transform-gpu
                    ${isActive 
                      ? "ring-2 ring-amber-500 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.4)] scale-105 z-10" 
                      : "border-stone-800/80 opacity-60 hover:opacity-100 hover:border-stone-700"}
                  `}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${event.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
                  
                  {/* Top Index Pill */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                      isActive ? "bg-amber-500 text-stone-950" : "bg-stone-900/80 backdrop-blur-md text-stone-300 border border-stone-800"
                    }`}>
                      0{idx + 1}
                    </span>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-0 left-0 p-3.5 w-full">
                    <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-0.5 block">
                      {event.type}
                    </span>
                    <h3 className="text-xs font-bold text-white leading-tight line-clamp-1">
                      {truncateWords(event.title, 4)}
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
              <span className="text-amber-500 font-mono font-bold text-xs tracking-widest uppercase">Upcoming</span>
              <h2 className="text-4xl font-black text-white">Featured Events</h2>
            </div>
            {displayEvents.slice(0, 5).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 flex flex-col"
              >
                <div className="relative h-56 w-full">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${event.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-stone-900/80 backdrop-blur-md border border-stone-700 text-amber-400">
                      {event.type}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-stone-400 text-sm mb-6 line-clamp-3">
                    {truncateWords(event.description, 20)}
                  </p>
                  <div className="flex flex-col gap-3 pt-4 border-t border-stone-800">
                    <div className="flex items-center gap-2 text-stone-400 font-mono text-xs font-bold">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      <span>{event.stats.venue}</span>
                    </div>
                    <Link href={`/events/${event.id}`} className="text-amber-500 font-bold text-sm flex items-center gap-1 mt-2">
                      Explore Event <ArrowRight className="w-4 h-4" />
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
