"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/marketing/Footer";
import { Palette, Download, Share2, Sparkles, Image as ImageIcon, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BrandPage() {

    const colors = [
        { name: "Core Orange", hex: "#EA580C", usage: "Primary actions and branding" },
        { name: "Deep Stone", hex: "#1C1917", usage: "Typography and dark backgrounds" },
        { name: "Off White", hex: "#FFFDFA", usage: "Main background and surfaces" }
    ];

    return (
        <div className="min-h-screen bg-[#fffdfa] text-stone-900">
            <Header />

            <section className="relative pt-32 pb-24 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-24"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest mb-8">
                            <Palette size={14} />
                            Design System
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-stone-900 mb-8 tracking-tighter leading-tight">
                            Brand <span className="text-orange-600 italic">Identity</span>.
                        </h1>
                        <p className="text-xl text-stone-500 max-w-3xl mx-auto leading-relaxed font-medium">
                            Authorized visual assets and guidelines for the COMSOC institutional brand.
                        </p>
                    </motion.div>

                    <div className="mb-32">
                        <div className="bg-white rounded-[4rem] border border-stone-100 p-12 md:p-20 shadow-2xl shadow-stone-200/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-5">
                                <Sparkles size={120} />
                            </div>
                            
                            <div className="grid lg:grid-cols-12 gap-16 items-center">
                                <div className="lg:col-span-7">
                                    <div className="relative h-48 w-full max-w-lg mb-12">
                                        <Image
                                            src="/logo.png"
                                            alt="COMSOC Master Logo"
                                            fill
                                            className="object-contain object-left"
                                        />
                                    </div>
                                    <h2 className="text-4xl font-black text-stone-900 mb-6 tracking-tight uppercase">Master Brand Identifier</h2>
                                    <p className="text-lg text-stone-500 leading-relaxed mb-10 font-medium">
                                        The COMSOC logo represents our commitment to modern society management. 
                                        It should never be distorted, recolored, or placed on low-contrast backgrounds.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <button className="flex items-center gap-2 px-8 py-4 rounded-full bg-stone-900 text-white font-bold hover:bg-orange-600 transition-all shadow-xl shadow-stone-900/10">
                                            <Download size={18} />
                                            Download Kit
                                        </button>
                                        <button className="flex items-center gap-2 px-8 py-4 rounded-full border border-stone-200 text-stone-600 font-bold hover:border-orange-500 hover:text-orange-600 transition-all">
                                            <Share2 size={18} />
                                            Guidelines
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="lg:col-span-5 space-y-4">
                                    <div className="p-8 rounded-3xl bg-stone-50 border border-stone-100">
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Min Clearspace</p>
                                        <div className="h-2 w-full bg-orange-200 rounded-full opacity-30 mb-2" />
                                        <p className="text-sm font-bold text-stone-900">20px padding required</p>
                                    </div>
                                    <div className="p-8 rounded-3xl bg-stone-50 border border-stone-100">
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Min Resize</p>
                                        <p className="text-sm font-bold text-stone-900">Should never go below 24px height</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-32">
                        {colors.map((color, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/30"
                            >
                                <div 
                                    className="w-full h-32 rounded-2xl mb-6 shadow-inner"
                                    style={{ backgroundColor: color.hex }}
                                />
                                <h3 className="text-xl font-bold text-stone-900 mb-2">{color.name}</h3>
                                <p className="text-xs font-bold text-orange-600 mb-4 tracking-widest">{color.hex}</p>
                                <p className="text-sm text-stone-400 font-medium">{color.usage}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="border-t border-stone-100 pt-32 text-center">
                        <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mx-auto mb-10">
                            <ImageIcon size={32} />
                        </div>
                        <h3 className="text-3xl font-black text-stone-900 mb-6 tracking-tight">Need custom assets?</h3>
                        <p className="text-stone-500 max-w-xl mx-auto mb-12 text-lg font-medium">
                            If you require specific society-branded logos or custom media formats, 
                            please coordinate with the digital communications office.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-3 text-orange-600 font-black uppercase tracking-widest hover:underline"
                        >
                            Contact Brand Team
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
