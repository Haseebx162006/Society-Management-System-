"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Shield, Users, ArrowRight } from "lucide-react";
import Lottie from "lottie-react";
import blobData from "../../../public/blob.json";

const leftLogos = [
  "/logos/acm.jpg",
  "/logos/cfds.jpg",
  "/logos/cls.jpg",
];

const rightLogos = [
  "/logos/gdgoc1.jpg",
  "/logos/ctec.jpg",
  "/logos/ieee.jpg",
];

const HangingLogo = ({ logo, index }: { logo: string; index: number }) => {
  const ropeLength = 180 + (index % 2) * 60;
  const swingDelay = index * 0.3;
  const swingDuration = 3 + (index % 3) * 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="relative flex flex-col items-center"
      style={{ zIndex: 10 }}
    >
      {/* Rope */}
      <motion.div
        drag
        dragConstraints={{ left: -100, right: 100, top: 0, bottom: 50 }}
        dragElastic={0.2}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
        whileDrag={{ scale: 1.1, cursor: "grabbing" }}
        animate={{
          rotate: [-3, 3, -3],
        }}
        transition={{
          duration: swingDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: swingDelay,
        }}
        className="relative flex flex-col items-center cursor-grab"
        style={{ transformOrigin: "top center" }}
      >
        <div
          className="w-0.5 bg-gradient-to-b from-stone-400 to-stone-600"
          style={{ height: `${ropeLength}px` }}
        />
        
        {/* Logo Card */}
        <motion.div
          whileHover={{ scale: 1.15, rotate: 0 }}
          className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-xl border-2 border-stone-200 shadow-lg flex items-center justify-center p-3 hover:shadow-2xl transition-shadow"
        >
          <img
            src={logo}
            alt="Society Logo"
            className="w-full h-full object-contain pointer-events-none"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen md:min-h-[95vh] flex items-center justify-center overflow-hidden bg-[#fffdfa] pt-24 pb-16">
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-100">
        <div className="w-[1200px] h-[1200px] flex items-center justify-center -translate-y-10">
          <Lottie
            animationData={blobData}
            loop={true}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      {/* Hanging Logos from Navbar - Left Side */}
      <div className="absolute top-0 left-0 z-10 hidden lg:block">
        <div className="flex gap-8 pl-12 pt-2">
          {leftLogos.map((logo, index) => (
            <HangingLogo key={`left-${index}`} logo={logo} index={index} />
          ))}
        </div>
      </div>

      {/* Hanging Logos from Navbar - Right Side */}
      <div className="absolute top-0 right-0 z-10 hidden lg:block">
        <div className="flex gap-8 pr-12 pt-2">
          {rightLogos.map((logo, index) => (
            <HangingLogo key={`right-${index}`} logo={logo} index={index} />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50/80 backdrop-blur-sm border border-orange-200 text-orange-700 text-sm font-semibold mb-10 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-100"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          COMSATS Lahore Student Portal
        </motion.div>

        <motion.div
           style={{ y: y1, opacity }}
           className="relative"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-7xl font-family-poppins font-semibold tracking-tighter text-stone-950 mb-10 max-w-6xl leading-[0.9] drop-shadow-sm"
          >
            THE HEART OF <br />
            CAMPUS LIFE AT <br />
            <span className="text-orange-700 italic font-family-poppins font-semibold">COMSATS</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl lg:text-2xl text-stone-600 mb-14 max-w-3xl leading-relaxed mx-auto font-normal"
          >
            The unified platform for <span className="font-bold text-stone-950 underline decoration-orange-400 decoration-wavy decoration-2 underline-offset-4">societies</span> to thrive, 
            and for <span className="font-bold text-stone-950 underline decoration-orange-400 decoration-wavy decoration-2 underline-offset-4">students</span> to rewrite their journey.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto mt-6"
          >
            <Link
              href="/societies"
              className="group w-full sm:w-auto px-12 py-5 bg-orange-600 text-white rounded-2xl font-black hover:bg-orange-700 transition-all shadow-2xl hover:shadow-orange-400/30 flex items-center justify-center gap-3 text-xl hover:-translate-y-1 active:scale-95"
            >
              <Users className="w-6 h-6 transition-transform group-hover:scale-110" />
              Explore Societies
              <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
            <Link
              href="/profile"
              className="w-full sm:w-auto px-12 py-5 bg-white text-stone-900 border-2 border-stone-200 rounded-2xl font-black hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-3 text-xl hover:-translate-y-1 shadow-md active:scale-95"
            >
              <Shield className="w-6 h-6 text-orange-600" />
              Manage Portal
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fffdfa] to-transparent z-30 pointer-events-none" />
    </section>
  );
}
