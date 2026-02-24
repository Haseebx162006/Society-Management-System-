"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/marketing/Footer";
import { Shield, Lock, Server, Bell, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SecurityPage() {
    const pillars = [
        {
            icon: Shield,
            title: "Infrastructure Resilience",
            description: "Our core systems are hosted on high-availability cloud infrastructure with multi-zone redundancy. We ensure 99.9% uptime for society management services.",
            features: ["Cloud-Native Architecture", "Automated Failover", "DDoS Mitigation", "Load Balancing"]
        },
        {
            icon: Lock,
            title: "Data Sovereignty",
            description: "Every byte of member data is encrypted at rest using AES-256 and in transit via TLS 1.3. We maintain strict isolation between society datasets.",
            features: ["At-Rest Encryption", "In-Transit Security", "Isolated Tenancy", "Key Management"]
        },
        {
            icon: Server,
            title: "Access Governance",
            description: "We implement granular Role-Based Access Control (RBAC) to ensure that only authorized society executives and admins can access sensitive data.",
            features: ["Strict RBAC", "Audit Logging", "Session Monitoring", "Least Privilege Access"]
        },
        {
            icon: Bell,
            title: "Incident Response",
            description: "Our dedicated security team monitors system health 24/7. In the event of a security anomaly, our automated response protocols trigger immediately.",
            features: ["Real-time Monitoring", "Threat Detection", "Rapid Response Team", "Post-Incident Analysis"]
        }
    ];

    return (
        <div className="min-h-screen bg-[#fffdfa] text-stone-900">
            <Header />

            <section className="relative pt-32 pb-24 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-[-5%] left-[-10%] w-[40%] h-[40%] bg-stone-200/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-orange-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-24"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-100 text-[10px] font-bold uppercase tracking-widest mb-8">
                            <Shield className="w-3.5 h-3.5" />
                            Security Standard
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-stone-900 mb-8 tracking-tighter leading-tight">
                            Fortified <span className="text-orange-600 italic">Core</span>.
                        </h1>
                        <p className="text-xl text-stone-500 max-w-3xl mx-auto leading-relaxed font-medium">
                            The technological framework protecting every interaction, transaction, and 
                            identity within the COMSOC ecosystem.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {pillars.map((pillar, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white p-10 rounded-[3rem] border border-stone-100 shadow-2xl shadow-stone-200/30 hover:shadow-orange-500/5 hover:border-orange-200 transition-all duration-500"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-stone-900 flex items-center justify-center text-white mb-8 group-hover:bg-orange-600 transition-colors duration-300">
                                    <pillar.icon size={28} strokeWidth={1.5} />
                                </div>
                                <h2 className="text-2xl font-bold text-stone-900 mb-4 tracking-tight uppercase">
                                    {pillar.title}
                                </h2>
                                <p className="text-stone-500 leading-relaxed mb-8 font-medium">
                                    {pillar.description}
                                </p>
                                <div className="space-y-3">
                                    {pillar.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 text-xs font-bold text-stone-400 uppercase tracking-widest">
                                            <CheckCircle2 size={14} className="text-orange-500" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-32 p-12 rounded-[3.5rem] bg-stone-900 text-white relative overflow-hidden text-center"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-10">
                            <Sparkles size={120} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">Security Inquiry?</h3>
                            <p className="text-stone-400 max-w-xl mx-auto mb-10 text-lg">
                                If you discover a potential vulnerability, we invite you to participate 
                                in our coordinated disclosure program.
                            </p>
                            <Link 
                                href="/contact"
                                className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-orange-600 text-white font-black uppercase tracking-widest hover:bg-white hover:text-stone-900 transition-all duration-500 shadow-2xl shadow-orange-600/20"
                            >
                                Submit Report
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
