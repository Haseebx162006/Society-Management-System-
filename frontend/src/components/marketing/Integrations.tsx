"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const integrations = [
  { name: "ACM", logo: "/logos/acm.jpg" },
  { name: "GDGOC", logo: "/logos/gdgoc1.jpg" },
  { name: "MLSA", logo: "/logos/mlsa.jpg" },
  { name: "CLS", logo: "/logos/cls.jpg" },
  { name: "Society", logo: "/logos/building.png" }
];

export default function Integrations() {
  return (
    <section className="py-20 bg-[#fffdfa] border-y border-stone-100/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            <div className="shrink-0 text-center md:text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-orange-600 mb-3 block">Partnership Ecosystem</span>
                <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Our Trusted <br className="hidden md:block" /> Network</h2>
            </div>
            
            <div className="flex flex-1 items-center justify-around gap-8 py-4 overflow-hidden relative">
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
                    {integrations.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="group relative"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 p-4 rounded-2xl bg-white border border-stone-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1">
                                <Image
                                    src={item.logo}
                                    alt={item.name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
