"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Users,
    Calendar,
    MapPin,
    Mail,
    Globe,
    ArrowRight,
    CheckCircle2,
    Clock,
    Instagram,
    Facebook,
    Linkedin,
    Twitter,
    Loader2,
} from "lucide-react";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { useGetSocietyByIdQuery } from "@/lib/features/societies/societyApiSlice";
import { useGetJoinFormsBySocietyQuery } from "@/lib/features/join/joinApiSlice";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function SocietyDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const user = useAppSelector(selectCurrentUser);
    const { data: societyData, isLoading } = useGetSocietyByIdQuery(id as string);
    const society = societyData?.society;

    // We only fetch join forms if user exists (president-level auth).
    // For the Register Now button, we use a lazy approach: try to fetch and handle gracefully.
    const [registerLoading, setRegisterLoading] = useState(false);

    const handleRegisterClick = async () => {
        if (!user) {
            router.push(`/login?returnUrl=${encodeURIComponent(`/societies/${id}`)}`);
            return;
        }

        setRegisterLoading(true);

        try {
            // Fetch active forms for this society by calling the API directly
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/join-forms/${id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } }
            );

            // We need a different approach: societies can have forms listed publicly.
            // The backend has a route GET /society/:id/join-forms for president.
            // For users, we need to find the active form. Let's use a simpler approach:
            // navigate to a dedicated page that lists available forms for the society.
            router.push(`/societies/${id}/register`);
        } catch {
            toast.error("Could not load registration forms.");
        } finally {
            setRegisterLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!society) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Society not found</h1>
                <Link href="/societies" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    Back to Directory
                </Link>
            </div>
        );
    }

    // Deterministic mock data generation (consistent with other pages)
    const seed = society._id
        .split("")
        .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const members = (seed % 450) + 50;
    const events = (seed % 15) + 5;
    const established = 2010 + (seed % 14);

    return (
        <main className="min-h-screen bg-white font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[500px] flex items-end pb-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${society.logo ||
                                "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2070"
                                })`,
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
                </div>

                <div className="container mx-auto px-6 relative z-10 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                                {society.category || "General"}
                            </span>
                            <span className="flex items-center gap-2 text-gray-300 text-sm font-medium bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                <Clock className="w-4 h-4" />
                                Est. {established}
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                            {society.name}
                        </h1>

                        <p className="text-xl text-gray-200 max-w-2xl mb-8 leading-relaxed font-light">
                            {society.description}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={handleRegisterClick}
                                disabled={registerLoading}
                                className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-2xl flex items-center gap-2 disabled:opacity-60"
                            >
                                {registerLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Register Now</span>
                                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-sm">
                                            {society.registration_fee > 0
                                                ? `PKR ${society.registration_fee}`
                                                : "Free"}
                                        </span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                            <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                                View Events
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="border-b border-gray-100 sticky top-20 z-40 shadow-sm backdrop-blur-md bg-white/90">
                <div className="container mx-auto px-6 py-6">
                    <div className="flex flex-wrap items-center justify-between gap-8">
                        <div className="flex gap-8 md:gap-16">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">
                                        Members
                                    </p>
                                    <p className="text-xl font-bold text-gray-900">{members}+</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">
                                        Events
                                    </p>
                                    <p className="text-xl font-bold text-gray-900">{events}/Year</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            {[Instagram, Twitter, Linkedin, Facebook, Globe].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <section className="container mx-auto px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: About and Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="prose prose-lg prose-indigo max-w-none">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                About Us
                                <div className="h-1 w-20 bg-indigo-600 rounded-full" />
                            </h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                {society.description}
                            </p>

                            {/* Dynamic Content Sections */}
                            {society.content_sections?.length > 0 &&
                                society.content_sections.map((section: any, index: number) => (
                                    <div key={index} className="mt-8">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                            {section.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                                            {section.content}
                                        </p>
                                    </div>
                                ))}

                            {/* Custom Fields as Info */}
                            {society.custom_fields?.length > 0 && (
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {society.custom_fields.map((field: any, index: number) => (
                                        <div
                                            key={index}
                                            className="bg-gray-50 p-4 rounded-xl border border-gray-100"
                                        >
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                                {field.label}
                                            </p>
                                            <p className="text-gray-900 font-medium">
                                                {field.type === "date"
                                                    ? "Date Field"
                                                    : field.type === "select"
                                                        ? `Options: ${field.options?.join(", ")}`
                                                        : "Text Input"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Highlights/Benefits */}
                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">
                                Why Join Us?
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {(society.why_join_us && society.why_join_us.length > 0
                                    ? society.why_join_us
                                    : [
                                        "Exclusive Workshops & Seminars",
                                        "Networking Opportunities",
                                        "Leadership Development",
                                        "Hands-on Projects",
                                        "Certificate of Participation",
                                        "Annual Tech/Cultural Fest",
                                    ]
                                ).map((item: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FAQs Section */}
                        {society.faqs && society.faqs.length > 0 && (
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                    Frequently Asked Questions
                                </h3>
                                <div className="space-y-4">
                                    {society.faqs.map((faq: any, index: number) => (
                                        <div
                                            key={index}
                                            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <h4 className="text-lg font-bold text-gray-900 mb-2">
                                                {faq.question}
                                            </h4>
                                            <p className="text-gray-600">{faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-8">
                        {/* Register CTA Card */}
                        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                            <h3 className="text-lg font-bold mb-2">Join This Society</h3>
                            <p className="text-indigo-100 text-sm mb-6">
                                Become a member and unlock access to events, teams, and a vibrant community.
                            </p>
                            <button
                                onClick={handleRegisterClick}
                                disabled={registerLoading}
                                className="w-full py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {registerLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Apply Now
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                            {society.registration_fee > 0 && (
                                <p className="text-center text-indigo-200 text-xs mt-2">
                                    Registration fee: PKR {society.registration_fee}
                                </p>
                            )}
                        </div>

                        {/* Teams Widget */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Our Teams</h3>
                            <div className="space-y-4">
                                {(society.groups && society.groups.length > 0
                                    ? society.groups
                                    : [
                                        { name: "Executive Council" },
                                        { name: "Events Team" },
                                        { name: "Marketing & PR" },
                                        { name: "Technical Wing" },
                                    ]
                                ).map((group: any, i: number) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold">
                                                {group.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{group.name}</p>
                                                <p className="text-xs text-gray-500">View Members</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Widget */}
                        <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl">
                            <h3 className="text-lg font-bold mb-6">Contact Info</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-4">
                                    <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />
                                    <span className="text-gray-300 text-sm">
                                        Student Service Center, COMSATS University Lahore Campus
                                    </span>
                                </li>
                                <li className="flex items-center gap-4">
                                    <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
                                    <a
                                        href={`mailto:${society.contact_info?.email ||
                                            `contact@${society.name.toLowerCase().replace(/\s/g, "")}.com`
                                            }`}
                                        className="text-gray-300 text-sm hover:text-white transition-colors break-all"
                                    >
                                        {society.contact_info?.email ||
                                            `contact@${society.name.toLowerCase().replace(/\s/g, "")}.com`}
                                    </a>
                                </li>
                                {society.contact_info?.phone && (
                                    <li className="flex items-center gap-4">
                                        <div className="w-5 h-5 flex items-center justify-center text-indigo-400 shrink-0">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-300 text-sm">
                                            {society.contact_info.phone}
                                        </span>
                                    </li>
                                )}
                                {society.contact_info?.website && (
                                    <li className="flex items-center gap-4">
                                        <Globe className="w-5 h-5 text-indigo-400 shrink-0" />
                                        <a
                                            href={society.contact_info.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-300 text-sm hover:text-white transition-colors break-all"
                                        >
                                            Visit Website
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
