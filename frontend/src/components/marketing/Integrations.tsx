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
    <section className="py-24 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-12">
          Seamlessly integrates with your favorite tools
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-70">
          {integrations.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center gap-2 group cursor-default"
            >
              <div className="relative w-16 h-16 md:w-20 md:h-20 grayscale hover:grayscale-0 transition-all duration-300">
                <Image
                  src={item.logo}
                  alt={item.name}
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
