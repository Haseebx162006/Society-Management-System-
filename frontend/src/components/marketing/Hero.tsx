"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Shield, Users } from "lucide-react";
import gsap from "gsap";

const logos = [
  "/logos/acm.jpg",
  "/logos/cfds.jpg",
  "/logos/cls.jpg",
  "/logos/gdgoc1.jpg",
  "/logos/mlsa.jpg",
  "/logos/ctec.jpg",
  "/logos/cec.jpg",
  "/logos/cics.jpg",
  "/logos/cms.jpg",
  "/logos/ieee.jpg",
  "/logos/acm.jpg",
  "/logos/building.png",
];

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const logoIndex = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const spawnLogo = (x: number, y: number) => {
      const imgPath = logos[logoIndex.current % logos.length];
      logoIndex.current++;

      const logo = document.createElement("div");
      logo.className = "absolute pointer-events-none z-0 select-none";
      logo.style.left = `${x}px`;
      logo.style.top = `${y}px`;
      logo.style.width = "80px";
      logo.style.height = "80px";
      logo.style.transform = "translate(-50%, -50%) scale(0)";
      
      const img = document.createElement("img");
      img.src = imgPath;
      img.className = "w-full h-full object-contain rounded-xl shadow-lg border border-white/40 backdrop-blur-[2px]";
      logo.appendChild(img);
      section.appendChild(logo);

      const tl = gsap.timeline({
        onComplete: () => {
          logo.remove();
        }
      });

      tl.to(logo, {
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)"
      })
      .to(logo, {
        y: y - 100 - Math.random() * 100,
        x: x + (Math.random() - 0.5) * 200,
        rotation: (Math.random() - 0.5) * 45,
        opacity: 0,
        scale: 0.5,
        duration: 2,
        ease: "power2.out"
      }, "-=0.1");
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dist = Math.hypot(x - lastMousePos.current.x, y - lastMousePos.current.y);

      if (dist > 80) {
        spawnLogo(x, y);
        lastMousePos.current = { x, y };
      }
    };

    section.addEventListener("mousemove", handleMouseMove);
    return () => section.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#fffdfa] py-20 mt-10"
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-sm font-medium mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          COMSATS Lahore Student Portal
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-stone-900 mb-8 max-w-5xl leading-none"
        >
          The Heart of <br />
          Campus Life at <br />
          <span className="text-orange-600 italic">COMSATS</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl text-stone-600 mb-12 max-w-2xl leading-relaxed"
        >
          The unified platform for <span className="font-bold text-stone-900">societies</span> to manage operations, 
          and for <span className="font-bold text-stone-900">students</span> to discover, join, and lead communities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto"
        >
          <Link
            href="/societies"
            className="w-full sm:w-auto px-10 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-xl hover:shadow-orange-200 flex items-center justify-center gap-2 text-lg hover:-translate-y-1"
          >
            <Users className="w-5 h-5" />
            Find a Society
          </Link>
          <Link
            href="/profile"
            className="w-full sm:w-auto px-10 py-4 bg-white text-stone-700 border-2 border-stone-100 rounded-full font-bold hover:bg-stone-50 hover:border-stone-200 transition-all flex items-center justify-center gap-2 text-lg hover:-translate-y-1 shadow-sm"
          >
            <Shield className="w-5 h-5 text-stone-500" />
            Manage Society
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
