"use client";

import Header from "@/components/Header";
import Footer from "@/components/marketing/Footer";
import { motion } from "framer-motion";
import { Search, PenTool, CheckCircle, CreditCard, LayoutDashboard, CalendarDays, UserPlusIcon } from "lucide-react";
import Link from "next/link";

const steps = [
    {
        title: "Create an Account",
        description: "Sign up and build your personal profile to gain access to the dynamic COMSATS Society System ecosystem.",
        icon: UserPlusIcon,
    },
    {
        title: "Discover Societies & Events",
        description: "Explore the comprehensive directory to find societies aligned with your interests or browse upcoming campus events.",
        icon: Search,
    },
    {
        title: "Submit a Join Request",
        description: "Found the perfect society? Hit 'Join' and fill out their specialized recruitment form right from the platform.",
        icon: PenTool,
    },
    {
        title: "Complete Registration Fees",
        description: "For societies with entry fees, follow the transparent payment instructions on the form to secure your spot.",
        icon: CreditCard,
    },
    {
        title: "Track Application Status",
        description: "Monitor your join requests directly from your personal dashboard. Get real-time updates as leaders review your application.",
        icon: LayoutDashboard,
    },
    {
        title: "Get Approved & Assigned",
        description: "Once approved by the society President, you'll be officially onboarded and assigned to your requested team or committee.",
        icon: CheckCircle,
    },
    {
        title: "Participate & Engage",
        description: "As an official member, RSVP to exclusive society events, collaborate with your team, and enrich your campus experience.",
        icon: CalendarDays,
    }
];

export default function StartAsUserPage() {
    return (
        <main className="min-h-screen bg-[#fffdfa] flex flex-col font-sans">
            <Header />

            <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 lg:px-10 pt-32 pb-24">
                <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <span className="inline-block py-1.5 px-3 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold tracking-wider mb-6">
                        FOR STUDENTS AND MEMBERS
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-stone-900 mb-6 leading-tight tracking-tight">
                        Join the <span className="text-orange-600 bg-orange-50 px-2 rounded-lg">Community</span>
                    </h1>
                    <p className="text-lg text-stone-500 leading-relaxed font-medium">
                        Your campus experience, amplified. Follow this guide to discover, join, and
                        engage with the most vibrant societies at COMSATS.
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical Line for Desktop Timeline */}
                    <div className="hidden md:block absolute left-[50%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-200 via-stone-200 to-transparent -translate-x-1/2 rounded-full" />

                    <div className="space-y-12 md:space-y-0">
                        {steps.map((step, index) => {
                            const isEven = index % 2 === 0;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    className={`relative flex flex-col md:flex-row items-center justify-between group ${
                                        isEven ? "md:flex-row-reverse" : ""
                                    }`}
                                >
                                    
                                    <div className="w-full md:w-5/12 hidden md:block" />

                                    
                                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-white border-2 border-stone-200 shadow-sm z-10 items-center justify-center text-orange-600 group-hover:border-orange-500 group-hover:bg-orange-50 transition-all duration-300">
                                        <step.icon className="w-6 h-6" />
                                    </div>

                                    
                                    <div className="w-full md:w-5/12 bg-white p-8 rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/40 relative z-20 group-hover:-translate-y-1 transition-transform duration-300">
                                        <div className="md:hidden w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
                                            <step.icon className="w-6 h-6" />
                                        </div>
                                        <div className="text-orange-600 font-bold tracking-widest text-sm mb-3 opacity-90">
                                            STEP 0{index + 1}
                                        </div>
                                        <h3 className="text-2xl font-bold text-stone-900 mb-4">{step.title}</h3>
                                        <p className="text-stone-500 leading-relaxed">{step.description}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-32 text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-stone-900 mb-6">Start Your Journey</h2>
                    <p className="text-stone-500 mb-10">Whether you are looking to learn new skills or make new friends, it all starts here.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/societies"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Browse Societies
                        </Link>
                        <Link
                            href="/events"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-stone-700 bg-white border border-stone-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Explore Events
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
