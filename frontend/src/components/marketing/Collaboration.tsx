"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Handshake, Zap, Sparkles, ArrowUpRight, ShieldCheck, Cpu } from "lucide-react";

export const Collaboration = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[#fffdfa] text-stone-900 selection:bg-orange-500 selection:text-white">
      
      {/* Soft Light Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-70">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-200/50 via-amber-100/30 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-200/40 via-orange-100/30 to-transparent pointer-events-none" />
      </div>

      {/* Elegant Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-60" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center">
          
          {/* Header Pill */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50/80 border border-orange-200/80 text-orange-700 text-xs font-mono uppercase tracking-[0.25em] mb-14 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
            <span>Official Strategic Alliance</span>
          </motion.div>

          {/* Alliance Cards */}
          <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 w-full max-w-5xl">
            
            {/* Connecting Line for Desktop */}
            <div className="hidden lg:block absolute top-1/2 left-28 right-28 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-orange-300 to-transparent pointer-events-none z-0" />

            {/* CARD 1: COMSOC */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-full lg:w-1/2 z-10"
            >
              <div className="group relative bg-white/70 backdrop-blur-xl p-8 sm:p-11 rounded-[2.5rem] border border-orange-200/60 hover:border-orange-500/50 transition-all duration-500 transform-gpu hover:-translate-y-2 shadow-[0_15px_40px_-15px_rgba(249,115,22,0.12)] hover:shadow-[0_25px_60px_-15px_rgba(249,115,22,0.25)] overflow-hidden">
                
                {/* Top Subtle Neon Beam */}
                <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Card Background Radial Gradient */}
                <div className="absolute inset-0 bg-radial from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Logo Frame */}
                <div className="relative w-28 h-28 mb-8 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/20 to-amber-300/20 rounded-3xl blur-xl group-hover:scale-125 transition-transform duration-500" />
                  <div className="relative w-full h-full p-4 rounded-3xl bg-white/90 border border-stone-200/80 shadow-md group-hover:border-orange-400 group-hover:shadow-lg transition-all duration-500 flex items-center justify-center">
                    <Image
                      src="/logo.png"
                      alt="COMSOC Logo"
                      width={96}
                      height={96}
                      className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Typography */}
                <div className="text-center space-y-3 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[10px] font-mono text-orange-700 uppercase tracking-widest shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-600 animate-pulse" /> Primary Platform
                  </div>
                  <h3 className="text-4xl font-black tracking-tight text-stone-950 group-hover:text-orange-600 transition-colors duration-300">
                    COMSOC
                  </h3>
                  <p className="text-stone-400 text-xs font-mono tracking-[0.2em] uppercase font-semibold">
                    Society Platform
                  </p>
                </div>

                {/* Corner Sparkle */}
                <div className="absolute top-6 right-6 text-stone-300 group-hover:text-orange-500 transition-colors">
                  <Sparkles className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-300" />
                </div>
              </div>
            </motion.div>

            {/* CENTER HANDSHAKE BADGE */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="z-20 -my-6 lg:my-0 relative shrink-0"
            >
              <div className="relative group cursor-pointer">
                {/* Rotating Orbit */}
                <div className="absolute -inset-3 rounded-full border border-dashed border-orange-400/50 animate-[spin_15s_linear_infinite]" />
                
                {/* Badge Core */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-2 border-orange-300 shadow-2xl shadow-orange-300/40 flex items-center justify-center group-hover:scale-110 group-hover:border-orange-500 group-hover:shadow-orange-400/60 transition-all duration-300">
                  <Handshake className="w-10 h-10 text-orange-600 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
            </motion.div>

            {/* CARD 2: CTEC */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full lg:w-1/2 z-10"
            >
              <div className="group relative bg-white/70 backdrop-blur-xl p-8 sm:p-11 rounded-[2.5rem] border border-amber-200/60 hover:border-amber-500/50 transition-all duration-500 transform-gpu hover:-translate-y-2 shadow-[0_15px_40px_-15px_rgba(245,158,11,0.12)] hover:shadow-[0_25px_60px_-15px_rgba(245,158,11,0.25)] overflow-hidden">
                
                {/* Top Subtle Neon Beam */}
                <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Card Background Radial Gradient */}
                <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Logo Frame */}
                <div className="relative w-28 h-28 mb-8 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-orange-300/20 rounded-3xl blur-xl group-hover:scale-125 transition-transform duration-500" />
                  <div className="relative w-full h-full p-4 rounded-3xl bg-white/90 border border-stone-200/80 shadow-md group-hover:border-amber-400 group-hover:shadow-lg transition-all duration-500 flex items-center justify-center">
                    <Image
                      src="/logos/ctec.jpg"
                      alt="CTEC Logo"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover rounded-2xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Typography */}
                <div className="text-center space-y-3 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-[10px] font-mono text-amber-700 uppercase tracking-widest shadow-xs">
                    <Cpu className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Tech Powerhouse
                  </div>
                  <h3 className="text-4xl font-black tracking-tight text-stone-950 group-hover:text-amber-600 transition-colors duration-300">
                    CTEC
                  </h3>
                  <p className="text-stone-400 text-xs font-mono tracking-[0.2em] uppercase font-semibold">
                    Technical Club
                  </p>
                </div>

                {/* Corner Sparkle */}
                <div className="absolute top-6 right-6 text-stone-300 group-hover:text-amber-500 transition-colors">
                  <Sparkles className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-300" />
                </div>
              </div>
            </motion.div>

          </div>

          {/* Bottom Statement & CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 text-center max-w-3xl flex flex-col items-center"
          >
            <p className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-wide text-stone-800 leading-relaxed mb-8">
              Working together to bring the{" "}
              <span className="font-semibold text-orange-600 underline decoration-orange-300 underline-offset-8">
                best opportunities
              </span>{" "}
              for every COMSATS student.
            </p>

            <Link
              href="/about"
              className="group relative inline-flex items-center gap-3.5 px-7 py-3.5 rounded-full bg-stone-950 text-white text-xs font-mono uppercase tracking-[0.2em] hover:bg-orange-600 transition-all duration-300 shadow-xl shadow-stone-300 hover:shadow-orange-200 hover:scale-105"
            >
              <span className="text-stone-300 group-hover:text-white transition-colors">Crafted with passion by</span>
              <span className="px-3 py-1 rounded-full bg-white/10 group-hover:bg-black/20 text-orange-400 group-hover:text-white font-bold transition-all">
                Technical Leads of CTEC
              </span>
              <ArrowUpRight className="w-4 h-4 text-orange-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Collaboration;


