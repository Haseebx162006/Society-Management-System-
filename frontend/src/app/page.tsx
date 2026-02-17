
import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import Integrations from "@/components/marketing/Integrations";
import Features from "@/components/marketing/Features";
import AdvancedFeatures from "@/components/marketing/AdvancedFeatures";
import Testimonials from "@/components/marketing/Testimonials";
import CTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Integrations />
      <Features />
      <AdvancedFeatures />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
