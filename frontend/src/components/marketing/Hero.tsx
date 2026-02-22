"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Shield, Users } from "lucide-react";
import gsap from "gsap";

const logos = [
  "/logos/acm.jpg",
  "/logos/building.png",
  "/logos/cls.jpg",
  "/logos/gdgoc1.jpg",
  "/logos/mlsa.jpg",
  "/logos/acm.jpg",
  "/logos/building.png",
  "/logos/cls.jpg",
  "/logos/gdgoc1.jpg",
  "/logos/mlsa.jpg",
  "/logos/acm.jpg",
  "/logos/building.png",
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const oldX = useRef(0);
  const oldY = useRef(0);
  const deltaX = useRef(0);
  const deltaY = useRef(0);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const handleMouseMove = (e: MouseEvent) => {
      deltaX.current = e.clientX - oldX.current;
      deltaY.current = e.clientY - oldY.current;
      oldX.current = e.clientX;
      oldY.current = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const medias = root.querySelectorAll(".media-item");

    const handleMouseEnter = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const image = el.querySelector("img");
      if (!image) return;

      const tl = gsap.timeline({
        onComplete: () => {
          tl.kill();
        },
      });
      tl.timeScale(1.2);

      let dx = deltaX.current * 15;
      let dy = deltaY.current * 15;
      
      dx = Math.max(-150, Math.min(150, dx));
      dy = Math.max(-150, Math.min(150, dy));

      tl.fromTo(
        image,
        {
          x: dx,
          y: dy,
        },
        {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        }
      );

      tl.fromTo(
        image,
        {
          rotate: 0,
        },
        {
          duration: 0.4,
          rotate: (Math.random() - 0.5) * 30,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
        },
        "<"
      );
    };

    medias.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      medias.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
      });
    };
  }, []);

  return (
    <section className="relative pt-7 pb-20 lg:pt-17 lg:pb-27 overflow-hidden bg-[#fffdfa]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl mix-blend-multiply animate-blob" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
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
            className="text-5xl md:text-7xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-stone-900 mb-6 max-w-5xl"
          >
            The Heart of Campus Life at <br className="hidden lg:block" />
            <span className="text-orange-600 italic">
              COMSATS
            </span>
            . <br className="hidden lg:block" />

          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-stone-600 mb-10 max-w-3xl leading-relaxed mx-auto lg:mx-0"
          >
            The unified platform for <span className="font-bold text-stone-900">societies</span> to manage operations, 
            and for <span className="font-bold text-stone-900">students</span> to discover, join, and lead communities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10 lg:mb-0 w-full lg:w-auto"
          >
            <Link
              href="/societies"
              className="w-full sm:w-auto px-8 py-3.5 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200 flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Find a Society
            </Link>
            <Link
              href="/profile"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#fffdfa] text-stone-700 border border-stone-200 rounded-full font-bold hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4 text-stone-500" />
              Manage Society
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full lg:w-1/2 relative"
        >
          <div 
            ref={containerRef}
            className="relative h-[450px] sm:h-[500px] lg:h-[600px] w-full rounded-4xl overflow-hidden flex items-center justify-center p-8"
          >
            <div className="grid grid-cols-4 gap-y-1 gap-x-6 sm:gap-y-[3vw] sm:gap-x-[4vw] lg:gap-y-[4vw] lg:gap-x-[6vw] w-[90%] sm:w-[85%] relative z-0 mt-4">
              {logos.map((src, i) => (
                <div key={i} className="media-item relative aspect-square w-[18vw] sm:w-[11vw] max-w-[100px] lg:max-w-[120px] mx-auto">
                  <Image 
                    src={src} 
                    alt={`Logo ${i + 1}`} 
                    fill
                    className="object-cover rounded-[10%] sm:rounded-[15%] shadow-md pointer-events-none will-change-transform"
                    sizes="(max-width: 768px) 18vw, 11vw"
                  />
                </div>
              ))}
            </div>
            
          </div>
        </motion.div>

      </div>
    </section>
  );
}
