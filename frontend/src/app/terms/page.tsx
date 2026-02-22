"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/marketing/Footer";
import { Gavel, Users, Info, AlertCircle, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
    const sections = [
        {
            icon: Info,
            title: "Platform Mandate",
            content: "COMSOC is the official society management portal for COMSATS University Lahore. By accessing this platform, you agree to abide by institutional guidelines and university-wide digital policies.",
            details: ["Authorized Campus Usage", "Academic Integrity Standards", "Resource Allocation Rules"]
        },
        {
            icon: Users,
            title: "User Conduct",
            description: "Membership in any society via COMSOC requires a commitment to professional conduct. Harassment, unauthorized data scraping, or malicious interference with society operations is strictly prohibited.",
            details: ["Anti-Harassment Protocols", "Professional Representation", "Ethical Leadership"]
        },
        {
            icon: ShieldCheck,
            title: "Data Accountability",
            description: "Users are responsible for the accuracy of their profile information and the security of their credentials. Society executives are additionally accountable for the management of member data.",
            details: ["Credential Security", "Data Accuracy", "Executive Responsibility"]
        },
        {
            icon: AlertCircle,
            title: "Liability & Termination",
            description: "The platform reserves the right to suspend accounts that violate the Code of Conduct. Institutional liability is limited to the provision of management services.",
            details: ["Suspension Protocols", "Liability Limitation", "Service Continuity"]
        }
    ];

    return (
        <div className="min-h-screen bg-[#fffdfa] text-stone-900">
            <Header />

            <section className="relative pt-32 pb-24 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-[-5%] right-[-10%] w-[45%] h-[45%] bg-orange-500/5 rounded-full blur-[140px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] bg-stone-200/50 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-24"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-[10px] font-bold uppercase tracking-widest mb-8">
                            <Gavel className="w-3.5 h-3.5" />
                            Terms of Service
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-stone-900 mb-8 tracking-tighter leading-tight">
                            Governing <span className="text-orange-600 italic">Rules</span>.
                        </h1>
                        <p className="text-xl text-stone-500 max-w-3xl mx-auto leading-relaxed font-medium">
                            Establishing the legal and ethical boundaries for engagement within the 
                            COMSOC digital environment.
                        </p>
                    </motion.div>

                    <div className="space-y-12">
                        {sections.map((section, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white p-10 md:p-14 rounded-[3.5rem] border border-stone-100 shadow-xl shadow-stone-200/40 hover:border-orange-200 transition-all duration-500"
                            >
                                <div className="flex flex-col md:flex-row gap-12">
                                    <div className="shrink-0">
                                        <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-lg shadow-orange-500/5">
                                            <section.icon size={36} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-black text-stone-900 mb-6 tracking-tight uppercase">
                                            {section.title}
                                        </h2>
                                        <p className="text-stone-500 leading-relaxed mb-10 text-lg font-medium">
                                            {section.content || section.description}
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            {section.details.map((detail, i) => (
                                                <div key={i} className="px-5 py-2.5 rounded-2xl bg-stone-50 text-xs font-bold text-stone-400 uppercase tracking-widest border border-stone-100 group-hover:bg-white group-hover:border-orange-100 group-hover:text-orange-600 transition-all">
                                                    {detail}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-32 p-16 rounded-[4rem] bg-stone-900 text-white text-center relative overflow-hidden"
                    >
                        <div className="absolute bottom-0 left-0 p-12 opacity-5">
                            <Sparkles size={160} />
                        </div>
                        <h3 className="text-4xl font-black mb-6 tracking-tight">Acceptance of Terms</h3>
                        <p className="text-stone-400 max-w-2xl mx-auto mb-12 text-lg">
                            By clicking <b>Join Now</b> or registering for any society through COMSOC, 
                            you explicitly acknowledge and accept these governing rules.
                        </p>
                        <Link 
                            href="/contact"
                            className="inline-flex items-center gap-4 px-12 py-6 rounded-full bg-orange-600 text-white font-black uppercase tracking-widest hover:bg-white hover:text-stone-900 transition-all duration-500 shadow-2xl shadow-orange-600/20"
                        >
                            Request Clarification
                            <ArrowRight size={22} />
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
