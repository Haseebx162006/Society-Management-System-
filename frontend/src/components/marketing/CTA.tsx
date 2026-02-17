"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden bg-indigo-600 px-6 py-16 md:px-20 md:py-24 text-center shadow-2xl">
          {/* Background decorations */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-indigo-600 to-blue-700 opacity-90" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50" />
          </div>

          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6"
            >
              Ready to modernize your society?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-10"
            >
              Join hundreds of student leaders who are saving time and boosting engagement with SocietySync.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                href="/register"
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
