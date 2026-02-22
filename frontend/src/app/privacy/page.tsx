"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/marketing/Footer";
import { ShieldCheck, Lock, Eye, FileText, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    const sections = [
        {
            icon: Eye,
            title: "Data Collection",
            content: "We collect information that you provide directly to us, such as when you create an account, register for an event, or communicate with a society. This may include your name, email address, phone number, and campus affiliations.",
            bullets: ["Personal Identity Data", "Academic Affiliation Info", "Communication Logs", "Activity Metadata"]
        },
        {
            icon: Lock,
            title: "Data Usage",
            content: "Your data is used specifically to enhance your experience within the COMSOC ecosystem. We process information to facilitate society memberships, event registrations, and personalized campus updates.",
            bullets: ["Service Customization", "Security Verification", "Operational Analytics", "Automated Notifications"]
        },
        {
            icon: ShieldCheck,
            title: "Security Protocols",
            content: "We implement institutional-grade security measures to protect your personal information. Our systems use encrypted data transmission and secure server environments to prevent unauthorized access.",
            bullets: ["End-to-End Encryption", "Multi-Factor Authentication", "Regular Security Audits", "Encapsulated Data Storage"]
        },
        {
            icon: FileText,
            title: "Your Rights",
            content: "As a member of our community, you maintain full control over your data. You have the right to access, rectify, or request the erasure of your personal information at any time through your profile settings.",
            bullets: ["Right to Access", "Right to Rectification", "Data Portability", "Account Termination"]
        }
    ];

    return (
        <div className="min-h-screen bg-[#fffdfa] text-stone-900">
            <Header />

            <section className="relative pt-32 pb-24 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-amber-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-20"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold uppercase tracking-widest mb-8">
                            <Sparkles className="w-3.5 h-3.5" />
                            Institutional Policy
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-stone-900 mb-8 tracking-tighter leading-tight">
                            Privacy <span className="text-orange-600 italic">Protocols</span>.
                        </h1>
                        <p className="text-lg text-stone-500 max-w-2xl mx-auto leading-relaxed font-medium">
                            Our commitment to your digital sovereignty and data integrity within the 
                            COMSOC ecosystem. Last updated: February 2026.
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
                                className="group bg-white p-8 md:p-12 rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/40 hover:border-orange-200 transition-all duration-500"
                            >
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="shrink-0">
                                        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                                            <section.icon size={32} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-stone-900 mb-4 tracking-tight uppercase">
                                            {section.title}
                                        </h2>
                                        <p className="text-stone-500 leading-relaxed mb-8 text-lg">
                                            {section.content}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {section.bullets.map((bullet, i) => (
                                                <div key={i} className="flex items-center gap-3 text-sm font-semibold text-stone-400 group-hover:text-stone-600 transition-colors">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-200 group-hover:bg-orange-500" />
                                                    {bullet}
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
                        className="mt-20 pt-12 border-t border-stone-100 text-center"
                    >
                        <p className="text-stone-400 font-bold text-sm tracking-wide uppercase mb-8">
                            Require further clarification?
                        </p>
                        <Link 
                            href="/contact"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-stone-900 text-white font-bold hover:bg-orange-600 transition-all duration-300 shadow-xl shadow-stone-900/10"
                        >
                            Connect with Legal Dept
                            <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
