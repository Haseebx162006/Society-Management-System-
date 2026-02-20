"use client";

import { motion } from "framer-motion";
import { 
  Zap, 
  ShieldCheck, 
  Globe, 
  Search,
  UserPlus,
  Calendar
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Discover Communities",
    description: "Browse all active societies at COMSATS Lahore. Filter by category, interest, or department to find your tribe."
  },
  {
    icon: UserPlus,
    title: "One-Click Registration",
    description: "Join societies instantly. Fill your profile once and apply to multiple societies without repetitive forms."
  },
  {
    icon: Calendar,
    title: "Campus Event Calendar",
    description: "Never miss out. See all upcoming seminars, workshops, and competitions happening on campus in one view."
  },
  {
    icon: Zap,
    title: "Digital Management",
    description: "For executives: streamline member data, attendance tracking, and recruitment in a unified dashboard."
  },
  {
    icon: ShieldCheck,
    title: "Verified Profiles",
    description: "Official society badges and verified student profiles ensure a trusted and secure community environment."
  },
  {
    icon: Globe,
    title: "Society Portfolio",
    description: "Showcase your society's achievements, photo galleries, and past events to attract new members."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl mb-4">
            Bridging the gap between
            <span className="text-orange-600"> students and societies</span>
          </h2>
          <p className="text-lg text-stone-600">
            A complete ecosystem for campus life. Whether you&apos;re looking to lead or looking to join, COMSOC has you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-stone-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
