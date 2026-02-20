"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    Link as LinkIcon,
    QrCode,
    X,
    Download,
    Calendar,
    ChevronDown,
    Info,
    Phone,
    Briefcase
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

function FaqItem({ faq }: { faq: any }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-stone-200 rounded-2xl bg-white overflow-hidden transition-all duration-300 shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-stone-50 transition-colors"
            >
                <span className="font-bold text-stone-900 text-left pr-4">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-6 pb-5 pt-2 text-stone-600 bg-white leading-relaxed">
                            {faq.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

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

    if (isLoading) return <Loading />;

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

    const now = new Date();
    const startDate = society.registration_start_date ? new Date(society.registration_start_date) : null;
    const endDate = society.registration_end_date ? new Date(society.registration_end_date) : null;
    const isNotStarted = startDate && now < startDate;
    const isEnded = endDate && now > endDate;

    return (
        <main className="min-h-screen bg-stone-50 font-sans">
            <Header />

            {/* Cover Area */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden bg-stone-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-stone-800 to-stone-900 opacity-90"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay opacity-20"></div>
            </div>

            {/* Main Content Container */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-10 pb-24">
                
                {/* Society Header Card */}
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col md:flex-row gap-8 items-center md:items-start mb-10">
                    {/* Logo (overlap) */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white shadow-lg border-4 border-white overflow-hidden shrink-0 flex items-center justify-center -mt-16 md:-mt-20 z-20">
                         <img
                            src={society.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(society.name)}&background=random`}
                            alt={society.name}
                            className="w-full h-full object-cover md:object-contain"
                        />
                    </div>

                    {/* Title & Actions */}
                    <div className="flex-1 w-full text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-700">
                                        {society.category || "General"}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-sm font-medium text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                                        <Users className="w-4 h-4" />
                                        {membersData.length} Members
                                    </span>
                                </div>
                                <h1 className="font-display font-bold text-3xl md:text-5xl text-stone-900 mb-2 leading-tight">
                                    {society.name}
                                </h1>
                            </div>
                            
                            {/* Share Buttons */}
                            <div className="flex items-center justify-center gap-2 mt-2 md:mt-0 shadow-sm border border-stone-100 rounded-2xl p-1 bg-white">
                                <button
                                    onClick={handleCopyLink}
                                    className="p-3 rounded-xl bg-white hover:bg-stone-50 text-stone-600 transition-colors"
                                    title="Copy Link"
                                >
                                    <LinkIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsQrModalOpen(true)}
                                    className="p-3 rounded-xl bg-white hover:bg-stone-50 text-stone-600 transition-colors"
                                    title="Show QR Code"
                                >
                                    <QrCode className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        <p className="font-body text-lg text-stone-600 leading-relaxed max-w-4xl mx-auto md:mx-0">
                            {society.description}
                        </p>
                    </div>
                </div>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Custom Content Sections */}
                        {society.content_sections?.length > 0 && (
                            <div className="prose prose-lg prose-orange max-w-none">
                                {society.content_sections.map((section: any, index: number) => (
                                    <div key={index} className="mb-10 last:mb-0">
                                        <h3 className="font-display text-2xl font-bold text-stone-900 mb-4 flex items-center gap-3">
                                            {section.title}
                                            <div className="h-1 w-12 bg-orange-500 rounded-full" />
                                        </h3>
                                        <p className="font-body text-stone-600 leading-relaxed text-lg whitespace-pre-line">
                                            {section.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Custom Fields (Additional Info) */}
                        {society.custom_fields?.length > 0 && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200">
                                <h3 className="font-display text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                                     <span className="bg-orange-500 w-2 h-6 rounded-full inline-block"></span>
                                     Additional Specs
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {society.custom_fields.map((field: any, index: number) => (
                                        <div key={index} className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                                            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                                                {field.label}
                                            </p>
                                            <p className="text-stone-900 font-medium text-lg">
                                                {field.type === "date"
                                                    ? "Date Field"
                                                    : field.type === "select"
                                                        ? `Options: ${field.options?.join(", ")}`
                                                        : "Text Input"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Why Join Us */}
                        <div className="bg-orange-50 rounded-3xl p-8 border border-orange-100">
                            <h3 className="font-display text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                                <span className="bg-orange-500 w-2 h-6 rounded-full inline-block"></span>
                                Why Join Us?
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {(society.why_join_us?.length > 0
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
                                    <div key={i} className="flex items-start gap-3 bg-white/60 p-3 rounded-xl border border-orange-500/10">
                                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                                        </div>
                                        <span className="text-stone-800 font-medium text-[15px]">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Events */}
                        <SocietyEventsSection societyId={society._id} isMember={isMember} />

                        {/* FAQs */}
                        {society.faqs && society.faqs.length > 0 && (
                            <div>
                                <h3 className="font-display text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                                    <span className="bg-orange-500 w-2 h-6 rounded-full inline-block"></span>
                                    Frequently Asked Questions
                                </h3>
                                <div className="space-y-3">
                                    {society.faqs.map((faq: any, index: number) => (
                                        <FaqItem key={index} faq={faq} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Registration / Status Sticky Box */}
                        <div className="sticky top-24 space-y-6">
                            
                            {/* CTA Card */}
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-stone-200/50 border border-stone-100 relative overflow-hidden">
                                {isMember ? (
                                    // Already a Member
                                    <div className="relative z-10 text-center py-2">
                                        <div className="w-16 h-16 bg-stone-100 rounded-full mx-auto flex items-center justify-center mb-4">
                                            <Users className="w-8 h-8 text-stone-400" />
                                        </div>
                                        <h3 className="font-display text-2xl font-bold text-stone-900 mb-2">Welcome Back!</h3>
                                        <p className="text-stone-500 mb-6 font-medium text-sm">You are a confirmed member of this society.</p>
                                        <button 
                                            onClick={() => setIsViewModalOpen(true)} 
                                            className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
                                        >
                                           View Society Dashboard
                                        </button>
                                    </div>
                                ) : (
                                    // Not a Member
                                    <div className="relative z-10">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                        <h3 className="font-display text-lg font-bold text-stone-500 mb-2 uppercase tracking-widest">Membership</h3>
                                        <div className="flex items-end gap-2 mb-6">
                                            <span className="text-4xl font-black text-stone-900">
                                                {society.registration_fee > 0 ? `PKR ${society.registration_fee}` : "Free"}
                                            </span>
                                            {society.registration_fee > 0 && <span className="mb-1 text-stone-400 font-bold">/ yr</span>}
                                        </div>
                                        
                                        {/* Dates */}
                                        {society.registration_start_date && (
                                            <div className="mb-6 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                                                <div className="flex items-center gap-3 text-[13px] md:text-sm">
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-stone-500 shadow-sm shrink-0">
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-stone-500 font-medium">Registration Opens</p>
                                                        <p className="font-bold text-stone-900">{new Date(society.registration_start_date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                {society.registration_end_date && (
                                                    <div className="flex items-center gap-3 text-[13px] md:text-sm pt-4 mt-4 border-t border-stone-200">
                                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-stone-500 shadow-sm shrink-0">
                                                            <Clock className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-stone-500 font-medium">Registration Closes</p>
                                                            <p className="font-bold text-stone-900">{new Date(society.registration_end_date).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="mt-2">
                                            {isNotStarted ? (
                                                <button disabled className="w-full py-4 bg-stone-100 text-stone-400 font-bold rounded-2xl cursor-not-allowed flex items-center justify-center gap-2 border border-stone-200">
                                                    Opens {startDate?.toLocaleDateString()}
                                                </button>
                                            ) : isEnded ? (
                                                <button disabled className="w-full py-4 bg-stone-100 text-stone-400 font-bold rounded-2xl cursor-not-allowed flex items-center justify-center gap-2 border border-stone-200">
                                                    Registration Closed
                                                </button>
                                            ) : (
                                                <button onClick={handleRegisterClick} disabled={registerLoading} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 disabled:opacity-70">
                                                    {registerLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Apply Now <ArrowRight className="w-5 h-5" /></>}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Teams Card */}
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-200">
                                <h3 className="font-display text-lg font-bold text-stone-900 mb-5 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-orange-500"/>
                                    Our Teams
                                </h3>
                                <div className="space-y-3">
                                    {(society.groups?.length > 0
                                        ? society.groups
                                        : [
                                            { name: "Executive Council" },
                                            { name: "Events Team" },
                                            { name: "Marketing & PR" },
                                            { name: "Technical Wing" },
                                        ]
                                    ).map((group: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-100">
                                            <div className="w-10 h-10 rounded-xl bg-white text-orange-600 font-bold flex flex-col items-center justify-center shadow-sm shrink-0">
                                                {group.name[0]}
                                            </div>
                                            <p className="font-semibold text-stone-800 text-sm">{group.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Contact Info Card */}
                            {(society.contact_info?.email || society.contact_info?.phone || society.contact_info?.website || (society.contact_info?.social_links && Object.values(society.contact_info.social_links).some(v => v))) && (
                                <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 md:p-8 shadow-xl border border-stone-800 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                    <h3 className="font-display text-lg font-bold text-white mb-5 flex items-center gap-2 relative z-10">
                                        <Info className="w-5 h-5 text-orange-400" />
                                        Contact Details
                                    </h3>
                                    <ul className="space-y-4 relative z-10">
                                        {society.contact_info?.email && (
                                            <li className="flex items-center gap-3 text-sm">
                                                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-orange-400 shrink-0">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <a href={`mailto:${society.contact_info.email}`} className="text-stone-300 font-medium hover:text-white transition-colors break-all">
                                                    {society.contact_info.email}
                                                </a>
                                            </li>
                                        )}
                                        {society.contact_info?.phone && (
                                            <li className="flex items-center gap-3 text-sm">
                                                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-orange-400 shrink-0">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <span className="text-stone-300 font-medium">
                                                    {society.contact_info.phone}
                                                </span>
                                            </li>
                                        )}
                                        {society.contact_info?.website && (
                                            <li className="flex items-center gap-3 text-sm">
                                                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-orange-400 shrink-0">
                                                    <Globe className="w-4 h-4" />
                                                </div>
                                                <a href={society.contact_info.website} target="_blank" rel="noopener noreferrer" className="text-stone-300 font-medium hover:text-white transition-colors break-all">
                                                    Visit Website
                                                </a>
                                            </li>
                                        )}
                                    </ul>

                                    {/* Socials */}
                                    {society.contact_info?.social_links && Object.values(society.contact_info.social_links).some(v => v) && (
                                        <div className="flex gap-2 mt-6 pt-6 border-t border-stone-800 relative z-10">
                                            {society.contact_info.social_links.facebook && (
                                                <a href={society.contact_info.social_links.facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-stone-800 rounded-full text-stone-400 hover:text-white hover:bg-[#1877F2] transition-colors">
                                                    <Facebook className="w-4 h-4" />
                                                </a>
                                            )}
                                            {society.contact_info.social_links.instagram && (
                                                <a href={society.contact_info.social_links.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-stone-800 rounded-full text-stone-400 hover:text-white hover:bg-pink-600 transition-colors">
                                                    <Instagram className="w-4 h-4" />
                                                </a>
                                            )}
                                            {society.contact_info.social_links.twitter && (
                                                <a href={society.contact_info.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-stone-800 rounded-full text-stone-400 hover:text-white hover:bg-[#1DA1F2] transition-colors">
                                                    <Twitter className="w-4 h-4" />
                                                </a>
                                            )}
                                            {society.contact_info.social_links.linkedin && (
                                                <a href={society.contact_info.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-stone-800 rounded-full text-stone-400 hover:text-white hover:bg-[#0A66C2] transition-colors">
                                                    <Linkedin className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                        </div>
                    </div>
                </div>
            </div>

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
                        className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full relative"
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
                        <div className="flex justify-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                             <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(currentUrl)}`} 
                                alt="Society QR Code"
                                className="w-full max-w-[200px] h-auto rounded-xl shadow-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-8">
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
