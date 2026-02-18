"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const advancedFeatures = [
  {
    title: "Find Your Community",
    description: "Discover active societies at COMSATS Lahore based on your interests. From tech clubs to arts & culture, find the perfect place to grow.",
    benefits: ["Browse by category", "View society portfolios", "Direct messaging with executives"],
    image: "/assets/student-discovery.png", 
    placeholderColor: "bg-orange-50"
  },
  {
    title: "Event Management Simplified",
    description: "Create, promote, and track events with ease. From ticketing to check-ins, handle the entire lifecycle in one place.",
    benefits: ["Customizable RSVP forms", "QR code check-in", "Automated email reminders"],
    image: "/assets/event-dashboard.png",
    placeholderColor: "bg-blue-50"
  },
  {
    title: "Financial Transparency",
    description: "Keep track of every penny. Manage budgets, track expenses, and generate transparent financial reports for your members.",
    benefits: ["Real-time budget tracking", "Expense approval workflows", "Automated financial reports"],
    image: "/assets/finance-dashboard.png",
    placeholderColor: "bg-indigo-50"
  },
  {
    title: "Team Collaboration",
    description: "Empower your committee with role-based access. Assign tasks, share files, and communicate effectively within the platform.",
    benefits: ["Granular permissions", "Task management board", "Shared document repository"],
    image: "/assets/team-dashboard.png",
    placeholderColor: "bg-purple-50"
  }
];

export default function AdvancedFeatures() {
  return (
    <section id="advanced-features" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-32">
        {advancedFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16`}
          >
            {/* Text Content */}
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold uppercase tracking-wide">
                Feature Spotlight
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {feature.title}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                {feature.description}
              </p>
              
              <ul className="space-y-4">
                {feature.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Link 
                  href="/features" 
                  className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors group"
                >
                  Learn more about {feature.title.split(' ')[0]}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Image/Mockup */}
            <div className="flex-1 w-full">
              <div className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-gray-100 ${feature.placeholderColor}`}>
                {/* Abstract UI representation since we don't have real screenshots yet */}
                <div className="absolute inset-4 bg-white rounded-xl shadow-inner overflow-hidden flex flex-col">
                    <div className="h-12 border-b border-gray-100 flex items-center px-4 gap-4 bg-gray-50/50">
                        <div className="w-24 h-4 bg-gray-200 rounded-md" />
                        <div className="flex-1" />
                        <div className="w-8 h-8 rounded-full bg-gray-200" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col gap-4">
                        <div className="w-1/3 h-8 bg-gray-100 rounded-md mb-4" />
                        <div className="flex gap-4 h-32">
                            <div className="flex-1 bg-gray-50 rounded-lg border border-gray-100" />
                            <div className="flex-1 bg-gray-50 rounded-lg border border-gray-100" />
                            <div className="flex-1 bg-gray-50 rounded-lg border border-gray-100" />
                        </div>
                         <div className="flex-1 bg-gray-50 rounded-lg border border-gray-100 mt-2" />
                    </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
