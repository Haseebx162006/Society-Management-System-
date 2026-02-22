"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/marketing/Footer";
import { ArrowLeft, Home, Sparkles, Binary } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fffdfa] flex flex-col text-stone-900 selection:bg-orange-600 selection:text-white">
      <Header />
      
      <main className="flex-1 relative flex items-center justify-center pt-32 pb-24 overflow-hidden">
        {/* Abstract Background Decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl pointer-events-none">
          <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                opacity: [0.05, 0.1, 0.05] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500 rounded-full blur-[140px]"
          />
          <div className="absolute top-20 right-10 opacity-10 animate-pulse">
            <Binary size={300} strokeWidth={0.5} className="text-stone-900" />
          </div>
          <div className="absolute bottom-10 left-10 opacity-10">
            <Sparkles size={150} className="text-orange-600" />
          </div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Massive 404 text with gradient */}
            <motion.h1 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[12rem] md:text-[20rem] font-black leading-none tracking-tighter text-stone-900/5 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
            >
              404
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
                System Out of Range
              </span>
              
              <h2 className="text-6xl md:text-8xl font-black text-stone-900 mb-8 tracking-tighter">
                Lost in the <span className="text-orange-600 italic">Nodes</span>.
              </h2>
              
              <p className="text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
                The resource you are attempting to access has been relocated or never existed in this sector. 
                Please return to core systems.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link 
                  href="/"
                  className="group flex items-center gap-4 px-10 py-5 bg-stone-900 text-white font-bold rounded-full hover:bg-orange-600 transition-all duration-500 shadow-2xl shadow-stone-900/20"
                >
                  <Home size={20} className="group-hover:scale-110 transition-transform" />
                  Return Base
                </Link>
                
                <button 
                  onClick={() => window.history.back()}
                  className="group flex items-center gap-4 px-10 py-5 bg-white border border-stone-100 text-stone-900 font-bold rounded-full hover:border-orange-500 hover:text-orange-600 transition-all duration-500"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  Previous Point
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
