"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Handshake, Zap } from "lucide-react";

export const Collaboration = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[#fffdfa]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 text-stone-500 text-xs font-bold uppercase tracking-widest mb-12">
            <Zap className="w-4 h-4 text-orange-600" />
            Official Partnership
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex-1 w-full"
            >
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-orange-100/50 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-500">
                <div className="w-24 h-24 mb-6 relative">
                  <div className="absolute inset-0 bg-orange-100 rounded-full scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-20 transition-all duration-700" />
                  <Image
                    src="/logo.png"
                    alt="COMSOC"
                    width={96}
                    height={96}
                    className="w-full h-full object-contain relative z-10"
                  />
                </div>
                <h3 className="text-3xl font-black text-stone-950 tracking-tighter mb-2">COMSOC</h3>
                <p className="text-stone-500 text-sm font-medium uppercase tracking-tight">Society Platform</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="z-20 -my-6 md:my-0 relative"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/80 backdrop-blur-xl border border-stone-200 shadow-2xl shadow-orange-100 flex items-center justify-center group transition-all duration-500 hover:scale-110">
                <div className="absolute inset-2 rounded-full border border-dashed border-orange-200 animate-[spin_10s_linear_infinite]" />
                <Handshake className="w-8 h-8 md:w-10 md:h-10 text-orange-600 relative z-10" />
              </div>
              <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-20 pointer-events-none" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex-1 w-full"
            >
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-orange-100/50 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-500">
                <div className="w-24 h-24 mb-6 relative">
                  <div className="absolute inset-0 bg-orange-100 rounded-full scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-20 transition-all duration-700" />
                  <Image
                    src="/logos/ctec.jpg"
                    alt="CTEC"
                    width={96}
                    height={96}
                    className="w-full h-full object-contain rounded-2xl relative z-10"
                  />
                </div>
                <h3 className="text-3xl font-black text-stone-950 tracking-tighter mb-2">CTEC</h3>
                <p className="text-stone-500 text-sm font-medium uppercase tracking-tight">Technical Club</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center max-w-2xl"
          >
            <p className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight leading-tight mb-6">
              Working together to bring the <span className="text-orange-600 italic">best opportunities</span> for every COMSATS student.
            </p>
            
            <Link
              href="/about"
              className="group inline-flex flex-col items-center gap-2 transition-all"
            >
              <span className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em]">Crafted with passion by</span>
              <div className="px-6 py-2 rounded-full bg-stone-950 text-white text-sm font-bold group-hover:bg-orange-600 transition-colors shadow-lg shadow-stone-200">
                Technical Leads of CTEC
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-100/40 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-100/40 rounded-full blur-[120px] translate-y-1/2 pointer-events-none" />
      
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
      />
    </section>
  );
};

export default Collaboration;
