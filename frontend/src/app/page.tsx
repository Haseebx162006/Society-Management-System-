'use client'
import Hero from "@/components/marketing/Hero";
import Integrations from "@/components/marketing/Integrations";
import Features from "@/components/marketing/Features";
import SocietyShowcase from "@/components/marketing/SocietyShowcase";
import EventShowcase from "@/components/marketing/EventShowcase";
import AdvancedFeatures from "@/components/marketing/AdvancedFeatures";
import Testimonials from "@/components/marketing/Testimonials";
import CTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";
import Header from "@/components/Header";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffdfa] font-(--font-family-poppins) selection:bg-orange-600 selection:text-white">
      <Header />
      <Hero />
      <div className="relative">
          <Integrations />
          <Features />
          <div className="py-5 relative overflow-hidden">
              <div className="max-w-7xl mx-auto px-6 text-center">
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                  >
                      <h2 className="text-5xl md:text-7xl font-black text-stone-900 mb-8 tracking-tighter">
                          Student <span className="text-orange-600 italic">Societies</span>.
                      </h2>                      
                  </motion.div>
              </div>
            </div>
          <SocietyShowcase />
          <AdvancedFeatures />
              <div className="py-5 relative overflow-hidden">
              <div className="max-w-7xl mx-auto px-6 text-center">
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                  >
                      <h2 className="text-5xl md:text-7xl font-black text-stone-900 mb-8 tracking-tighter">
                          Upcoming <span className="text-orange-600 italic">Events</span>.
                      </h2>                      
                  </motion.div>
              </div>
            </div>
          <EventShowcase />
          <Testimonials />
          <CTA />
      </div>
      <Footer />
    </main>
  );
}
