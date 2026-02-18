"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden bg-indigo-600 px-6 py-16 md:px-20 md:py-24 text-center shadow-2xl">
          {/* Background decorations - Solid Clean Look */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 bg-indigo-600">
            {/* Subtle pattern or just solid color as requested */}
          </div>

          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6"
            >
              Ready to join the movement?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-10"
            >
              Join the official platform for COMSATS Lahore students and societies.
              Start your journey today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform duration-200"
              >
                Start for free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <p className="mt-6 text-sm text-indigo-200">
              No credit card required. Free plan available for small societies.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
