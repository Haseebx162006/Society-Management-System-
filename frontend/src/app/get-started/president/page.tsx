"use client";

import Header from "@/components/Header";
import Footer from "@/components/marketing/Footer";
import { motion } from "framer-motion";
import { Building2, PlusCircle, Users, CreditCard, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const steps = [
    {
        title: "Create an Account",
        description: "Sign up and build your personal profile to gain access to the dynamic COMSATS Society System ecosystem.",
        icon: UserPlusIcon,
    },
    {
        title: "Submit a Society Request",
        description: "Navigate to the 'Request society registration' section in your profile and submit a formal request. Add your society's name and purpose.",
        icon: Building2,
    },
    {
        title: "Await Institutional Approval",
        description: "Your request is securely forwarded to the administration. Once vetted and approved, your society is officially initialized.",
        icon: CheckCircle2,
    },
    {
        title: "Configure Your Digital Headquarters",
        description: "Use the 'Society Form' to create detailed society profile, add logos, descriptions, custom forms, FAQs, and your team hierarchy.",
        icon: PlusCircle,
    },
    {
        title: "Set Registration Fees (Optional)",
        description: "If your society has an entry fee, establish transparent payment instructions and banking details for prospective members.",
        icon: CreditCard,
    },
    {
        title: "Launch & Invite Members",
        description: "Your society is now live on the public directory! Share your custom join link and watch your member base multiply.",
        icon: Send,
    }
];

function UserPlusIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" x2="19" y1="8" y2="14" />
            <line x1="22" x2="16" y1="11" y2="11" />
        </svg>
    )
}

export default function StartAsPresidentPage() {
    return (
        <main className="min-h-screen bg-[#fffdfa] flex flex-col font-sans">
            <Header />

            <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 lg:px-10 pt-32 pb-24">
                <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <span className="inline-block py-1.5 px-3 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold tracking-wider mb-6">
                        FOR LEADERS AND VISIONARIES
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-stone-900 mb-6 leading-tight tracking-tight">
                        Launch Your <span className="text-orange-600 bg-orange-50 px-2 rounded-lg">Society</span>
                    </h1>
                    <p className="text-lg text-stone-500 leading-relaxed font-medium">
                        Become a catalyst for change. Follow this comprehensive guide to establishing,
                        customizing, and leading your own society within the COMSATS network.
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
                    <h2 className="text-3xl font-bold text-stone-900 mb-6">Ready to Lead?</h2>
                    <p className="text-stone-500 mb-10">Join a network of student leaders making a profound impact on campus life.</p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        Create Your Account Now
                    </Link>
                </div>
            </div>

            <Footer />
        </main>
    );
}
