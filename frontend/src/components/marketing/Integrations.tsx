"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// Placeholder logos - in a real app these would be SVGs or images
const integrations = [
  "Slack", "Discord", "Google Calendar", "Notion", "Zoom", "Stripe"
];

export default function Integrations() {
  return (
    <section className="py-24 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-12">
          Seamlessly integrates with your favorite tools
        </p>
        
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-70">
          {integrations.map((name, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center gap-2 group cursor-default"
            >
              {/* Logo Placeholder */}
              <div className="text-xl md:text-2xl font-bold text-gray-400 group-hover:text-gray-900 transition-colors duration-300">
                {name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
