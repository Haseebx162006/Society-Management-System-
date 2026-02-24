"use client";

import { motion } from "framer-motion";
import { 
  Zap, 
  ShieldCheck, 
  Globe, 
  Search,
  UserPlus,
  Calendar
} from "lucide-react";

const features = [
  {
    icon: Search,
    name: "Discovery",
    title: "Find Your Tribe",
    description: "Browse curated societies at COMSATS. Filter by category, interest, or department."
  },
  {
    icon: UserPlus,
    name: "Onboarding",
    title: "Instant Access",
    description: "One-click registration. Universal profile sync across multiple campus societies."
  },
  {
    icon: Calendar,
    name: "Activity",
    title: "Live Events",
    description: "Stay synchronized with the campus pulse. Seminars, workshops, and competitions."
  },
  {
    icon: Zap,
    name: "Control",
    title: "Digital Command",
    description: "Centralized executive management. Streamline data, attendance, and recruitment."
  },
  {
    icon: ShieldCheck,
    name: "Security",
    title: "Verified Identity",
    description: "Trusted campus environment with official badges and verified student profiles."
  },
  {
    icon: Globe,
    name: "Portfolio",
    title: "Public Presence",
    description: "Showcase your group's achievements, galleries, and history to the entire campus."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-orange-600 mb-4 block">Core Ecosystem</span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-stone-900 leading-[1.1]">
                Everything you need to <br className="hidden md:block" />
                <span className="text-orange-600 italic underline decoration-orange-500/30 decoration-8 underline-offset-8">dominate</span> campus life.
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-stone-100">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="p-12 border-r border-b border-stone-100 group hover:bg-[#fffdfa] transition-all duration-500 cursor-default"
            >
              <div className="w-10 h-10 mb-8 flex items-center justify-center rounded-xl bg-stone-50 text-stone-400 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-sm shadow-stone-100">
                <feature.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-stone-300 mb-2 block group-hover:text-orange-500 transition-colors">{feature.name}</span>
              <h3 className="text-xl font-bold text-stone-900 mb-4 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-stone-500 font-normal leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
