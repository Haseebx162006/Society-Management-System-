"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/marketing/Footer";
import Image from "next/image";
import { Rocket, Target, Shield, Users, ArrowRight, Zap, Globe, Sparkles } from "lucide-react";

const stats = [
    { label: "Active Societies", value: "50+" },
    { label: "Community Members", value: "5,000+" },
    { label: "Events Hosted", value: "200+" },
    { label: "Campus Reach", value: "100%" },
];

const founders = [
    {
        name: "Hussain Jamal",
        role: "Lead Architect",
        image: "/logos/acm.jpg",
        bio: "Driving the technological evolution of campus communities through innovation and strategy."
    },
    {
        name: "Haseeb Ahmed",
        role: "Operational Excellence",
        image: "/logos/mlsa.jpg",
        bio: "Crafting seamless operational workflows for modern society management."
    }
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#fffdfa] text-stone-900 overflow-hidden">
            <Header />

            <section className="relative pt-15 pb-20 lg:pt-34 lg:pb-34">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none overflow-hidden">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/20 rounded-full blur-[120px]" 
                    />
                    <motion.div 
                        animate={{ 
                            scale: [1.2, 1, 1.2],
                            rotate: [90, 0, 90],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/20 rounded-full blur-[120px]" 
                    />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold uppercase tracking-widest mb-8">
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            Next Gen Platform
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-stone-900 mb-8 tracking-tighter leading-none">
                            Architecting the <br />
                            <span className="text-orange-600 italic">Future</span> of Campus.
                        </h1>
                        <p className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed mb-12">
                            We bridge the gap between imagination and execution, providing COMSATS 
                            with the ultimate ecosystem for societal growth and student leadership.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-stone-200/60 backdrop-blur-sm bg-white/30 rounded-3xl">
                        {stats.map((stat, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="flex flex-col items-center"
                            >
                                <span className="text-4xl md:text-5xl font-black text-orange-600 mb-2">{stat.value}</span>
                                <span className="text-sm font-bold text-stone-500 uppercase tracking-widest">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-stone-900 text-white relative">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                                Our Mission: <br />
                                Empowering Every <span className="text-orange-500">Aspiration</span>.
                            </h2>
                            <p className="text-stone-400 text-lg leading-relaxed">
                                Beyond just a management tool, our platform is a catalyst for personal and 
                                professional evolution. We empower students to lead, creators to build, 
                                and communities to thrive in an era of digital excellence.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-stone-800/50 border border-stone-700/50 hover:border-orange-500/50 transition-colors group">
                                    <Zap className="w-10 h-10 text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
                                    <h4 className="font-bold text-xl mb-2">High Velocity</h4>
                                    <p className="text-sm text-stone-500">Streamlined operations for maximum societal impact.</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-stone-800/50 border border-stone-700/50 hover:border-orange-500/50 transition-colors group">
                                    <Globe className="w-10 h-10 text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
                                    <h4 className="font-bold text-xl mb-2">Unified Reach</h4>
                                    <p className="text-sm text-stone-500">One portal to connect the entire campus ecosystem.</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative aspect-square lg:aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/10 border border-stone-800"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-stone-900/40 mix-blend-overlay z-10" />
                            <Image 
                                src="/logos/building.png" 
                                alt="Innovation Hub" 
                                fill 
                                className="object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-32 bg-white relative">
                <div className="max-w-7xl mx-auto px-6 text-center mb-20">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black text-stone-900 mb-6"
                    >
                        The <span className="text-orange-600 italic">Founders</span>
                    </motion.h2>
                    <p className="text-stone-500 max-w-2xl mx-auto">
                        A duo of visionaries dedicated to redefining the student experience at COMSATS.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12">
                    {founders.map((founder, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-stone-50 rounded-3xl p-8 border border-stone-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-100/50 transition-all group"
                        >
                            <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-8 scale-95 group-hover:scale-100 transition-transform duration-500">
                                <Image 
                                    src={founder.image} 
                                    alt={founder.name} 
                                    fill 
                                    className="object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                                />
                                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-stone-900/80 to-transparent z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                    <span className="text-white text-xs font-bold uppercase tracking-widest leading-none">Architect of Excellence</span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-stone-900 mb-1">{founder.name}</h3>
                            <p className="text-orange-600 font-bold text-sm uppercase tracking-widest mb-4">{founder.role}</p>
                            <p className="text-stone-500 leading-relaxed italic">&ldquo;{founder.bio}&rdquo;</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="py-24 bg-stone-50">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="p-8 md:p-16 rounded-[3rem] bg-orange-600 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 rotate-12 opacity-10 scale-150 group-hover:rotate-45 transition-transform duration-700">
                            <Rocket className="w-64 h-64" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-8 relative z-10 leading-tight"> Ready to Lead <br /> the Next Century? </h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                            <Link 
                                href="/societies" 
                                className="px-8 py-4 bg-white text-orange-600 rounded-full font-black flex items-center justify-center gap-2 hover:bg-stone-100 transition-colors shadow-xl"
                            >
                                Explore Societies <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link 
                                href="/register-society" 
                                className="px-8 py-4 bg-orange-700 text-white rounded-full font-black border border-orange-500/50 flex items-center justify-center gap-2 hover:bg-orange-800 transition-colors shadow-xl"
                            >
                                Register Yours
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

import Link from "next/link";
