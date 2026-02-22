"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/marketing/Footer";
import { Scale, Book, Users, HeartHandshake, Sparkles, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function LegalPage() {
    const protocols = [
        {
            icon: Scale,
            title: "Global Terms of Engagement",
            description: "The governing framework for all users within the portal. This outlines your rights, responsibilities, and the institutional standards we uphold.",
            articles: ["Acceptable Use Policy", "User Autonomy", "Platform Liability", "Dispute Resolution"]
        },
        {
            icon: Users,
            title: "Society Code of Conduct",
            description: "Specific protocols for society executives and members. We mandate transparency, inclusivity, and ethical leadership across all campus units.",
            articles: ["Leadership Ethics", "Anti-Harassment", "Financial Transparency", "Member Representation"]
        },
        {
            icon: Book,
            title: "Intellectual Property",
            description: "How we handle brand assets, society content, and user-generated media. COMSOC respects the creative ownership of every student.",
            articles: ["Asset Protection", "License Attribution", "Content Ownership", "Trademark Usage"]
        },
        {
            icon: HeartHandshake,
            title: "Institutional Consent",
            description: "Our legal relationship with campus administration. We operate as an authorized management unit under university guidelines.",
            articles: ["Faculty Liaison", "Audit Cooperation", "Operational Mandate", "Policy Alignment"]
        }
    ];

    return (
        <div className="min-h-screen bg-[#fffdfa] text-stone-900">
            <Header />

            <section className="relative pt-32 pb-24 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] bg-stone-200/30 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-24"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest mb-8">
                            <Scale className="w-3.5 h-3.5" />
                            Official Framework
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-stone-900 mb-8 tracking-tighter leading-[0.9]">
                            Legal <br />
                            <span className="text-orange-600 italic">Protocols</span>.
                        </h1>
                        <p className="text-xl text-stone-500 max-w-2xl leading-relaxed font-medium">
                            The regulatory architecture governing interaction, engagement, and 
                            governance within the COMSOC ecosystem.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {protocols.map((protocol, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative p-1 bg-gradient-to-br from-stone-100 to-transparent rounded-[3rem] hover:from-orange-200 transition-colors duration-500"
                            >
                                <div className="bg-white p-10 md:p-12 rounded-[2.8rem] h-full flex flex-col">
                                    <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center text-orange-600 mb-10 shadow-lg shadow-orange-500/5">
                                        <protocol.icon size={32} strokeWidth={1.5} />
                                    </div>
                                    <h2 className="text-3xl font-black text-stone-900 mb-6 tracking-tight uppercase">
                                        {protocol.title}
                                    </h2>
                                    <p className="text-stone-500 text-lg leading-relaxed mb-10 font-medium">
                                        {protocol.description}
                                    </p>
                                    <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                                        {protocol.articles.map((article, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm font-bold text-stone-400 cursor-pointer hover:text-orange-600 transition-colors group">
                                                <div className="w-2 h-2 rounded-full bg-stone-200 group-hover:bg-orange-500" />
                                                {article}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-32 p-12 md:p-16 rounded-[4rem] border-2 border-dashed border-stone-200 flex flex-col md:flex-row items-center justify-between gap-12"
                    >
                        <div className="max-w-xl text-center md:text-left">
                            <h3 className="text-3xl font-black text-stone-900 mb-4 tracking-tight">Need a consultation?</h3>
                            <p className="text-stone-500 text-lg font-medium">
                                If you require explicit clarification on any institutional policy or 
                                legal protocol, our liaison team is available for review.
                            </p>
                        </div>
                        <Link 
                            href="/contact"
                            className="shrink-0 flex items-center gap-4 px-12 py-6 rounded-full bg-stone-900 text-white font-black uppercase tracking-widest hover:bg-orange-600 transition-all duration-500 shadow-2xl shadow-stone-900/10 group"
                        >
                            Request Liaison
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
