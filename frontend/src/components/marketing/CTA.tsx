"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-40 bg-[#fffdfa] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative rounded-[3rem] overflow-hidden bg-stone-900 px-8 py-24 md:px-24 md:py-32 text-center"
        >
          <div className="absolute inset-0 z-0">
             <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-orange-600/20 via-transparent to-stone-900" />
             <div className="absolute top-[-20%] right-[-10%] w-[50%] h-full bg-orange-500/20 rounded-full blur-[120px]" />
             <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-full bg-orange-950/40 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-orange-500 text-[10px] font-extrabold uppercase tracking-[0.3em] mb-10"
            >
                <Sparkles className="w-3.5 h-3.5" />
                Next Generation Platform
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-7xl font-bold text-white tracking-tighter mb-10 leading-[1.1]"
            >
              The future of <br /> campus life is <span className="text-orange-500 italic uppercase">here.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-stone-400 font-normal max-w-xl mx-auto mb-14 leading-relaxed"
            >
              Join thousands of students and hundreds of societies already shaping the future of COMSATS.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link
                href="/signup"
                className="inline-flex items-center gap-3 px-10 py-5 bg-orange-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-orange-700 transition-all shadow-2xl shadow-orange-600/20 hover:scale-105 duration-300"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-3 px-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-md"
              >
                Watch Manifesto
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="absolute top-1/2 left-0 w-full h-px bg-stone-100 z-0" />
      <div className="absolute top-0 left-1/4 w-px h-full bg-stone-100 z-0" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-stone-100 z-0" />
    </section>
  );
}
