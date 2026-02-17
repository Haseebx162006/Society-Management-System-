"use client";

import { motion } from "framer-motion";
import { 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  Globe, 
  BarChart, 
  Users 
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built on modern infrastructure to ensure your society dashboard loads in milliseconds, not seconds."
  },
  {
    icon: ShieldCheck,
    title: "Bank-Grade Security",
    description: "Enterprise-level encryption and role-based access control to keep your member data safe and private."
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Fully responsive design that works perfectly on any device, so you can manage your society on the go."
  },
  {
    icon: Globe,
    title: "Custom Domain",
    description: "Host your society's portal on your own domain to maintain professional branding and trust."
  },
  {
    icon: BarChart,
    title: "Advanced Analytics",
    description: "Gain deep insights into member engagement, event attendance, and financial health with real-time charts."
  },
  {
    icon: Users,
    title: "Member Management",
    description: "Effortlessly track active members, alumni, and new recruits with our powerful CRM tools."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
            Everything you need to run a 
            <span className="text-indigo-600"> modern society</span>
          </h2>
          <p className="text-lg text-gray-600">
            Ditch the spreadsheets. Our platform provides a comprehensive suite of tools designed specifically for student organizations.
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
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
