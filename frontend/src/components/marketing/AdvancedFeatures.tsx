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
    bg: "bg-orange-50/50"
  },
  {
    title: "Event Command Zero.",
    description: "The complete infrastructure for campus events. From ticketing to real-time check-ins, control every variable from one node.",
    benefits: ["Custom RSVP protocols", "Seamless QR validation", "Automated broadcast system"],
    accent: "text-stone-600",
    bg: "bg-stone-50"
  },
  {
    title: "Crystal Clarity.",
    description: "Radical financial transparency for your members. Manage budgets and track expenditure with institutional-grade tools.",
    benefits: ["Real-time ledger access", "Multi-stage approvals", "Instant audit export"],
    accent: "text-amber-600",
    bg: "bg-orange-50/30"
  },
  {
    title: "Unity of Command.",
    description: "Empower your executive committee with enterprise-level role-based access. Synchronize tasks and files across the entire team.",
    benefits: ["Granular security matrix", "Tactical task boards", "Encrypted document vault"],
    accent: "text-stone-900",
    bg: "bg-stone-100/50"
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
                className={`relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-stone-200 border border-stone-100/50 ${feature.bg} p-8 lg:p-12`}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="relative h-full bg-white rounded-3xl shadow-lg border border-white p-1 overflow-hidden">
                    <div className="h-full w-full bg-[#fffdfa] rounded-[1.4rem] p-6 flex flex-col gap-6">
                        <div className="flex items-center justify-between pb-6 border-b border-stone-100">
                             <div className="flex gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-stone-100" />
                                <div className="w-2.5 h-2.5 rounded-full bg-stone-100" />
                                <div className="w-2.5 h-2.5 rounded-full bg-stone-100" />
                             </div>
                             <div className="w-32 h-2.5 rounded-full bg-stone-100" />
                        </div>
                        <div className="flex-1 flex flex-col gap-6">
                            <div className="flex gap-4">
                                <div className="w-1/2 aspect-square rounded-2xl bg-stone-50 border border-stone-100 p-4 flex flex-col justify-end">
                                    <div className="w-12 h-2 rounded-full bg-orange-200 mb-3" />
                                    <div className="w-8 h-2 rounded-full bg-stone-100" />
                                </div>
                                <div className="w-1/2 aspect-square rounded-2xl bg-stone-50 border border-stone-100 p-4 flex flex-col justify-end">
                                    <div className="w-8 h-2 rounded-full bg-stone-100 mb-3" />
                                    <div className="w-12 h-2 rounded-full bg-stone-200" />
                                </div>
                            </div>
                            <div className="flex-1 rounded-2xl bg-stone-50 border border-stone-100 relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent transition-opacity" />
                                <div className="p-6">
                                    <div className="w-32 h-3 bg-stone-200 rounded-full mb-4" />
                                    <div className="w-full h-2 bg-stone-100 rounded-full mb-2" />
                                    <div className="w-2/3 h-2 bg-stone-100 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
