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

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffdfa] font-(--font-family-poppins) selection:bg-orange-600 selection:text-white">
      <Header />
      <Hero />
      <div className="relative">
          <Integrations />
          <Features />
          <SocietyShowcase />
          <AdvancedFeatures />
          <EventShowcase />
          <Testimonials />
          <CTA />
      </div>
      <Footer />
    </main>
  );
}
