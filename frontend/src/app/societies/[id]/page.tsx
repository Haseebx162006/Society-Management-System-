"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
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
    Share2,
    Link as LinkIcon,
    QrCode,
    X,
    Download
} from "lucide-react";
import Footer from "@/components/marketing/Footer";
import { useGetSocietyByIdQuery } from "@/lib/features/societies/societyApiSlice";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import Link from "next/link";
import { toast } from "react-hot-toast";
import SocietyViewModal from "@/components/society/SocietyViewModal";
import Header from "@/components/Header";
import SocietyEventsSection from "@/components/society/SocietyEventsSection";

import Loading from "@/app/loading";

export default function SocietyDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const user = useAppSelector(selectCurrentUser);
    const { data: societyData, isLoading } = useGetSocietyByIdQuery(id as string);
    const society = societyData?.society;
    const membersData = societyData?.members || [];

    const [registerLoading, setRegisterLoading] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);

    const currentUserMember = user ? membersData.find((m: any) => {
        const memberUserId = m.user_id?._id || m.user_id;
        const currentUserId = user.id || user._id;
        return memberUserId === currentUserId;
    }) : null;
    
    const isMember = !!currentUserMember;

    const handleRegisterClick = async () => {
        if (!user) {
            router.push(`/login?returnUrl=${encodeURIComponent(`/societies/${id}/register`)}`);
            return;
        }

        setRegisterLoading(true);

        try {
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/join-forms/${id}`,
                { headers: { Authorization: `Bearer ${(() => { try { const s = localStorage.getItem("authState"); return s ? JSON.parse(s).token || "" : ""; } catch { return ""; } })()}`} }
            );

            router.push(`/societies/${id}/register`);
        } catch {
            toast.error("Could not load registration forms.");
        } finally {
            setRegisterLoading(false);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (!society) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-stone-900 mb-4">Society not found</h1>
                <Link href="/societies" className="text-orange-600 hover:text-orange-800 font-medium">
                    Back to Directory
                </Link>
            </div>
        );
    }

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(currentUrl);
            toast.success("Link copied to clipboard!");
        }
    };

    const handleDownloadQr = async () => {
        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(currentUrl)}`;
            const response = await fetch(qrUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `${society.name.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
            toast.success("QR Code downloaded!");
        } catch (error) {
            toast.error("Failed to download QR Code");
        }
    };

    return (
        <main className="min-h-screen bg-white font-sans">
            <Header />


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
                    <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/60 to-transparent" />
                </div>

                <div className="container mx-auto px-6 relative z-10 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest bg-orange-600 text-white shadow-lg shadow-orange-600/20">
                                {society.category || "General"}
                            </span>
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopyLink}
                                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 transition-all flex items-center justify-center"
                                    title="Copy Link"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setIsQrModalOpen(true)}
                                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 transition-all flex items-center justify-center"
                                    title="Show QR Code"
                                >
                                    <QrCode className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h1 className="font-display font-semibold text-5xl md:text-7xl text-white mb-6 leading-tight tracking-tight">
                            {society.name}
                        </h1>

                        <p className="font-body text-xl text-stone-200 max-w-2xl mb-8 leading-relaxed font-light">
                            {society.description}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            {isMember ? (
                                <button
                                    onClick={() => setIsViewModalOpen(true)}
                                    className="px-8 py-4 bg-white text-stone-900 font-bold rounded-xl hover:bg-stone-100 transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-orange-500/20 flex items-center gap-2"
                                >
                                    <Users className="w-5 h-5" />
                                    View Society
                                </button>
                            ) : (
                                (() => {
                                    const now = new Date();
                                    const startDate = society.registration_start_date ? new Date(society.registration_start_date) : null;
                                    const endDate = society.registration_end_date ? new Date(society.registration_end_date) : null;
                                    
                                    const isNotStarted = startDate && now < startDate;
                                    const isEnded = endDate && now > endDate;
                                    const isOpen = !isNotStarted && !isEnded;

                                    if (isNotStarted) {
                                         return (
                                            <button
                                                disabled
                                                className="px-8 py-4 bg-white/50 text-white font-bold rounded-xl cursor-not-allowed flex items-center gap-2"
                                            >
                                                <span>Registration Opens: {startDate.toLocaleDateString()}</span>
                                            </button>
                                         )
                                    }

                                     if (isEnded) {
                                        return (
                                           <button
                                               disabled
                                               className="px-8 py-4 bg-stone-500/50 text-white font-bold rounded-xl cursor-not-allowed flex items-center gap-2"
                                           >
                                               <span>Registration Closed</span>
                                           </button>
                                        )
                                   }

                                    return (
                                        <button
                                            onClick={handleRegisterClick}
                                            disabled={registerLoading}
                                            className="px-8 py-4 bg-white text-stone-900 font-bold rounded-xl hover:bg-stone-100 transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-orange-500/20 flex items-center gap-2 disabled:opacity-60"
                                        >
                                            {registerLoading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <span>Register Now</span>
                                                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-sm">
                                                        {society.registration_fee > 0
                                                            ? `PKR ${society.registration_fee}`
                                                            : "Free"}
                                                    </span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    );
                                })()
                            )}
                            <Link href={`/events`} className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                                View Events
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

{/* 
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
                                    <p className="text-xl font-bold text-gray-900">{members}</p>
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
            </section> */}


            <section className="container mx-auto px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    <div className="lg:col-span-2 space-y-12">
                        <div className="prose prose-lg prose-orange max-w-none">
                            <h2 className="font-display text-3xl font-bold text-stone-900 mb-6 flex items-center gap-3">
                                About Us
                                <div className="h-1 w-20 bg-orange-500 rounded-full" />
                            </h2>
                            <p className="font-body text-stone-600 leading-relaxed text-lg">
                                {society.description}
                            </p>


                            {society.content_sections?.length > 0 &&
                                society.content_sections.map((section: any, index: number) => (
                                    <div key={index} className="mt-8">
                                        <h3 className="font-display text-2xl font-bold text-stone-900 mb-4">
                                            {section.title}
                                        </h3>
                                        <p className="font-body text-stone-600 leading-relaxed text-lg whitespace-pre-line">
                                            {section.content}
                                        </p>
                                    </div>
                                ))}


                            {society.custom_fields?.length > 0 && (
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {society.custom_fields.map((field: any, index: number) => (
                                        <div
                                            key={index}
                                            className="bg-stone-50 p-4 rounded-xl border border-stone-100"
                                        >
                                            <p className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-1">
                                                {field.label}
                                            </p>
                                            <p className="text-stone-900 font-medium">
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


                        <div className="bg-stone-50/50 backdrop-blur-sm rounded-2xl p-8 border border-stone-200/50 shadow-sm">
                            <h3 className="font-display text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                                <span className="bg-orange-500 w-2 h-6 rounded-full inline-block"></span>
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
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <span className="text-stone-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>


                        <SocietyEventsSection societyId={society._id} isMember={isMember} />


                        {society.faqs && society.faqs.length > 0 && (
                            <div>
                                <h3 className="font-display text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                                    <span className="bg-orange-500 w-2 h-6 rounded-full inline-block"></span>
                                    Frequently Asked Questions
                                </h3>
                                <div className="space-y-4">
                                    {society.faqs.map((faq: any, index: number) => (
                                        <div
                                            key={index}
                                            className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
                                        >
                                            <h4 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-orange-600 transition-colors">
                                                {faq.question}
                                            </h4>
                                            <p className="text-stone-600">{faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>


                    <div className="space-y-8">

                        {!isMember && (
                            <div className="bg-linear-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                                <h3 className="font-display text-xl font-bold mb-2 relative z-10">Join This Society</h3>
                                <p className="text-orange-100 text-sm mb-6 relative z-10">
                                    Become a member and unlock access to events, teams, and a vibrant community.
                                </p>
                                
                                {society.registration_start_date && society.registration_end_date && (
                                    <div className="mb-6 text-sm text-orange-100 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 relative z-10">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-orange-100">Registration Opens:</span>
                                            <span className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded-md text-xs">{new Date(society.registration_start_date).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-orange-100">Registration Closes:</span>
                                            <span className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded-md text-xs">{new Date(society.registration_end_date).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="relative z-10">
                                {(() => {
                                    const now = new Date();
                                    const startDate = society.registration_start_date ? new Date(society.registration_start_date) : null;
                                    const endDate = society.registration_end_date ? new Date(society.registration_end_date) : null;
                                    
                                    const isNotStarted = startDate && now < startDate;
                                    const isEnded = endDate && now > endDate;

                                    if (isNotStarted) {
                                         return (
                                            <button
                                                disabled
                                                className="w-full py-3 bg-white/20 text-white font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                <span>Opens: {startDate.toLocaleDateString()}</span>
                                            </button>
                                         )
                                    }

                                    if (isEnded) {
                                        return (
                                           <button
                                               disabled
                                               className="w-full py-3 bg-white/20 text-white font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                                           >
                                               <span>Registration Closed</span>
                                           </button>
                                        )
                                   }

                                    return (
                                        <button
                                            onClick={handleRegisterClick}
                                            disabled={registerLoading}
                                            className="w-full py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg"
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
                                    );
                                })()}
                                </div>

                                {society.registration_fee > 0 && (
                                    <p className="text-center text-orange-100 text-xs mt-3 relative z-10 font-medium">
                                        Registration fee: PKR {society.registration_fee}
                                    </p>
                                )}
                            </div>
                        )}
                        
                        {isMember && (
                             <div className="bg-linear-to-br from-stone-800 to-stone-900 rounded-2xl p-6 text-white shadow-xl shadow-stone-900/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
                                <h3 className="font-display text-xl font-bold mb-2 relative z-10 text-orange-400">Welcome Back!</h3>
                                <p className="text-stone-300 text-sm mb-6 relative z-10">
                                    You are a member of this society. View your team and colleagues.
                                </p>
                                <button
                                    onClick={() => setIsViewModalOpen(true)}
                                    className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/20 transition-all font-bold flex items-center justify-center gap-2 relative z-10"
                                >
                                    <Users className="w-4 h-4" />
                                    View Society
                                </button>
                            </div>
                        )}


                        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm border-t-4 border-t-orange-500">
                            <h3 className="font-display text-xl font-bold text-stone-900 mb-6">Our Teams</h3>
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
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors group cursor-pointer border border-transparent hover:border-stone-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold shadow-inner">
                                                {group.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-stone-900">{group.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                        {society.contact_info && (society.contact_info.email || society.contact_info.phone || society.contact_info.website || (society.contact_info.social_links && (society.contact_info.social_links.facebook || society.contact_info.social_links.instagram || society.contact_info.social_links.twitter || society.contact_info.social_links.linkedin))) && (
                            <div className="bg-stone-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                                <h3 className="font-display text-xl font-bold mb-6 text-orange-400 relative z-10">Contact Info</h3>
                                <ul className="space-y-4 relative z-10">
                                    {society.contact_info?.email && (
                                        <li className="flex items-center gap-4">
                                            <Mail className="w-5 h-5 text-orange-400 shrink-0" />
                                            <a
                                                href={`mailto:${society.contact_info.email}`}
                                                className="text-stone-300 text-sm hover:text-white transition-colors break-all"
                                            >
                                                {society.contact_info.email}
                                            </a>
                                        </li>
                                    )}
                                    {society.contact_info?.phone && (
                                        <li className="flex items-center gap-4">
                                            <div className="w-5 h-5 flex items-center justify-center text-orange-400 shrink-0">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                                </svg>
                                            </div>
                                            <span className="text-stone-300 text-sm">
                                                {society.contact_info.phone}
                                            </span>
                                        </li>
                                    )}
                                    {society.contact_info?.website && (
                                        <li className="flex items-center gap-4">
                                            <Globe className="w-5 h-5 text-orange-400 shrink-0" />
                                            <a
                                                href={society.contact_info.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-stone-300 text-sm hover:text-white transition-colors break-all"
                                            >
                                                Visit Website
                                            </a>
                                        </li>
                                    )}
                                    {society.contact_info?.social_links && (society.contact_info.social_links.facebook || society.contact_info.social_links.instagram || society.contact_info.social_links.twitter || society.contact_info.social_links.linkedin) && (
                                        <li className="flex items-center gap-3 pt-4 border-t border-stone-800 mt-4">
                                            {society.contact_info.social_links.facebook && (
                                                <a href={society.contact_info.social_links.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-stone-800 rounded-full text-stone-400 hover:text-white hover:bg-[#1877F2] transition-colors">
                                                    <Facebook className="w-4 h-4" />
                                                </a>
                                            )}
                                            {society.contact_info.social_links.instagram && (
                                                <a href={society.contact_info.social_links.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-stone-800 rounded-full text-stone-400 hover:text-white hover:bg-pink-600 transition-colors">
                                                    <Instagram className="w-4 h-4" />
                                                </a>
                                            )}
                                            {society.contact_info.social_links.twitter && (
                                                <a href={society.contact_info.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-stone-800 rounded-full text-stone-400 hover:text-white hover:bg-[#1DA1F2] transition-colors">
                                                    <Twitter className="w-4 h-4" />
                                                </a>
                                            )}
                                            {society.contact_info.social_links.linkedin && (
                                                <a href={society.contact_info.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-stone-800 rounded-full text-stone-400 hover:text-white hover:bg-[#0A66C2] transition-colors">
                                                    <Linkedin className="w-4 h-4" />
                                                </a>
                                            )}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
            
            <SocietyViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                society={society}
                members={membersData}
                currentUserMember={currentUserMember}
            />

            {/* QR Code Modal */}
            {isQrModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full relative"
                    >
                        <button 
                            onClick={() => setIsQrModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="text-center mb-6 mt-2">
                            <h3 className="font-display text-2xl font-bold text-stone-900">Scan to Share</h3>
                            <p className="text-stone-500 text-sm mt-1">Share this society with others!</p>
                        </div>
                        <div className="flex justify-center p-4 bg-stone-50 rounded-xl border border-stone-100">
                             <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(currentUrl)}`} 
                                alt="Society QR Code"
                                className="w-full max-w-[200px] h-auto rounded-lg shadow-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <button
                                onClick={handleDownloadQr}
                                className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className="w-full py-3 bg-stone-100 text-stone-900 font-bold rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <LinkIcon className="w-4 h-4" />
                                Copy Link
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </main>
    );
}
