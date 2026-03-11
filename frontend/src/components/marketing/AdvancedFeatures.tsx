"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const advancedFeatures = [
  {
    title: "Infinite Discovery.",
    description: "Discover active societies at COMSATS Lahore based on your precise interests. We've built the most advanced taxonomy for student groups.",
    benefits: ["Intuitive category mapping", "High-fidelity portfolios", "Executive direct line"],
    accent: "text-orange-600",
    bg: "bg-orange-50/50",
    image: "/images/infinite_discovery_societies.png"
  },
  {
    title: "Event Command Zero.",
    description: "The complete infrastructure for campus events. From ticketing to real-time check-ins, control every variable from one node.",
    benefits: ["Custom RSVP protocols", "Seamless QR validation", "Automated broadcast system"],
    accent: "text-stone-600",
    bg: "bg-stone-50",
    image: "/images/circus_events.png"
  }
];

export default function AdvancedFeatures() {
  return (
    <section id="advanced-features" className="py-40 bg-[#fffdfa] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-40">
        {advancedFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-24 lg:gap-32`}
          >
            <div className="flex-1 space-y-10">
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-stone-200" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-stone-400">Tactical Module {index + 1}</span>
              </div>
              
              <h3 className={`text-4xl md:text-6xl font-bold ${feature.accent} leading-tight tracking-tighter`}>
                {feature.title}
              </h3>
              
              <p className="text-lg text-stone-500 leading-relaxed font-normal max-w-lg">
                {feature.description}
              </p>
              
              <ul className="grid grid-cols-1 gap-5">
                {feature.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-white border border-stone-100 flex items-center justify-center shadow-sm group-hover:border-orange-500 transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                    </div>
                    <span className="text-stone-700 font-semibold text-sm tracking-wide">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-6">
                <Link 
                  href="/signup" 
                  className="inline-flex items-center gap-3 py-4 px-8 rounded-2xl bg-stone-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-all duration-500 shadow-xl shadow-stone-900/10"
                >
                  Request Early Access
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="flex-1 w-full relative">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.6 }}
                className={`relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-stone-200 border border-stone-100/50 ${feature.bg}`}
              >
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-xl flex items-center justify-center p-6"
              >
                <Sparkles className="w-8 h-8 text-orange-600" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
