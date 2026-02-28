"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Header from "@/components/Header";
import { 
    useGetEventByIdQuery, 
    useSubmitEventRegistrationMutation, 
    useGetMyRegistrationQuery,
    EventFormField 
} from "@/lib/features/events/eventApiSlice";
import { useGetSocietyByIdQuery } from "@/lib/features/societies/societyApiSlice";
import { 
    FaCalendarAlt, 
    FaMapMarkerAlt, 
    FaArrowLeft, 
    FaUsers, 
    FaClock,
    FaArrowRight,
    FaTag,
    FaShareAlt

} from 'react-icons/fa';
import Image from 'next/image';
import { Loader2, DoorOpen, DoorClosed, Link as LinkIcon, QrCode, X, Download, Maximize2, ShieldCheck } from 'lucide-react';
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/marketing/Footer';
import Loading from '@/app/loading';

export default function EventDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const user = useAppSelector(selectCurrentUser);

    const { data: event, isLoading, error } = useGetEventByIdQuery(id as string);
    // Fetch society details to check membership for private events
    const { data: societyData, isLoading: isSocietyLoading } = useGetSocietyByIdQuery(
        event?.society_id && typeof event.society_id === 'object' ? (event.society_id as { _id: string })._id : event?.society_id,
        { skip: !event || !user } 
    );
    
    const [submitRegistration, { isLoading: isSubmitting }] = useSubmitEventRegistrationMutation();

    const [showForm, setShowForm] = useState(false);
    const [showRegistrationDetails, setShowRegistrationDetails] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({});
    const [fileValues, setFileValues] = useState<Record<string, File>>({});

    const { data: myRegistration, isLoading: isRegLoading } = useGetMyRegistrationQuery(id as string, { skip: !user });

    const registrationForm = event?.registration_form && typeof event.registration_form === 'object'
        ? event.registration_form
        : null;

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleFieldChange = (label: string, value: string | number | boolean) => {
        setFormValues(prev => ({ ...prev, [label]: value }));
    };

    const handleFileChange = (label: string, file: File) => {
        setFileValues(prev => ({ ...prev, [label]: file }));
    };

    const handleShare = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Event link copied to clipboard!');
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
            a.download = `${event?.title?.replace(/\s+/g, '-').toLowerCase() || 'event'}-qr-code.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
            toast.success("QR Code downloaded!");
        } catch (error) {
            toast.error("Failed to download QR Code");
        }
    };

    const handleRegister = async () => {
        if (!user) {
             router.push(`/login?returnUrl=${encodeURIComponent(`/events/${id}`)}`);
            return;
        }

        if (registrationForm) {
            // Validate required fields
            for (const field of registrationForm.fields) {
                if (field.is_required) {
                    if (field.field_type === 'FILE') {
                        if (!fileValues[field.label]) {
                            toast.error(`${field.label} is required`);
                            return;
                        }
                    } else if (!formValues[field.label] && formValues[field.label] !== 0) {
                        toast.error(`${field.label} is required`);
                        return;
                    }
                }
            }

            const formData = new FormData();
            formData.append('form_id', registrationForm._id);

            // Build responses (excluding FILE types which go separately)
            const responses = registrationForm.fields
                .filter(f => f.field_type !== 'FILE')
                .map(f => ({
                    field_label: f.label,
                    field_type: f.field_type,
                    value: formValues[f.label] || ''
                }));

            formData.append('responses', JSON.stringify(responses));

            // Append files
            Object.entries(fileValues).forEach(([label, file]) => {
                formData.append(label, file);
            });

            try {
                await submitRegistration({ eventId: id as string, body: formData }).unwrap();
                toast.success('Registration submitted successfully!');
                setShowForm(false);
                setFormValues({});
                setFileValues({});
            } catch (err: unknown) {
                const error = err as { data?: { message?: string } };
                toast.error(error?.data?.message || 'Failed to register');
            }
        } else {
            // No form, direct registration
            const formData = new FormData();
            formData.append('responses', JSON.stringify([]));
            try {
                await submitRegistration({ eventId: id as string, body: formData }).unwrap();
                toast.success('Registration submitted successfully!');
            } catch (err: unknown) {
                const error = err as { data?: { message?: string } };
                toast.error(error?.data?.message || 'Failed to register');
            }
        }
    };

    // Helper to render form fields
    const renderFormField = (field: EventFormField) => {
        const baseClass = "w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-stone-900 transition-all bg-white";

        const getValue = () => {
            const val = formValues[field.label];
            if (typeof val === 'boolean') return '';
            return val || '';
        };

        switch (field.field_type) {
            case 'TEXT':
            case 'EMAIL':
            case 'PHONE':
                return (
                    <input
                        type={field.field_type === 'EMAIL' ? 'email' : field.field_type === 'PHONE' ? 'tel' : 'text'}
                        value={getValue() as string}
                        onChange={(e) => handleFieldChange(field.label, e.target.value)}
                        className={baseClass}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    />
                );
            case 'NUMBER':
                return (
                    <input
                        type="number"
                        value={formValues[field.label] !== undefined && typeof formValues[field.label] !== 'boolean' ? formValues[field.label] as number : ''}
                        onChange={(e) => handleFieldChange(field.label, e.target.value)}
                        className={baseClass}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    />
                );
            case 'DATE':
                return (
                    <input
                        type="date"
                        value={getValue() as string}
                        onChange={(e) => handleFieldChange(field.label, e.target.value)}
                        className={baseClass}
                    />
                );
            case 'TEXTAREA':
                return (
                    <textarea
                        value={getValue() as string}
                        onChange={(e) => handleFieldChange(field.label, e.target.value)}
                        className={`${baseClass} resize-none`}
                        rows={3}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    />
                );
            case 'DROPDOWN':
                return (
                    <select
                        value={getValue() as string}
                        onChange={(e) => handleFieldChange(field.label, e.target.value)}
                        className={`${baseClass} bg-white`}
                    >
                        <option value="">Select {field.label}</option>
                        {field.options?.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            case 'CHECKBOX':
                return (
                    <label className="flex items-center gap-3 text-stone-700 cursor-pointer p-3 border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors bg-white">
                        <input
                            type="checkbox"
                            checked={!!formValues[field.label]}
                            onChange={(e) => handleFieldChange(field.label, e.target.checked)}
                            className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500 border-stone-300"
                        />
                        <span className="font-medium">{field.placeholder || field.label}</span>
                    </label>
                );
            case 'FILE':
                return (
                    <div className="relative">
                        <input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileChange(field.label, file);
                            }}
                            className="w-full text-sm text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-orange-50 file:text-orange-600 file:font-bold file:cursor-pointer hover:file:bg-orange-100 transition-all"
                        />
                        {fileValues[field.label] && (
                            <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
                                ✓ Uploaded: {fileValues[field.label].name}
                            </p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    if (isLoading) return <Loading />;

    if (error || !event) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
                <Header />
                <div className="grow flex flex-col items-center justify-center text-center px-4">
                    <h2 className="text-2xl font-bold text-stone-900 mb-2">Event Not Found</h2>
                    <p className="text-stone-500 mb-6">The event you are looking for does not exist or has been removed.</p>
                    <button 
                        onClick={() => router.push('/events')}
                        className="px-6 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition"
                    >
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    const now = new Date();
    const startDate = event.registration_start_date ? new Date(event.registration_start_date) : null;
    const endDate = event.registration_deadline ? new Date(event.registration_deadline) : null;
    
    const isNotStarted = startDate && now < startDate;
    const isEnded = endDate && now > endDate;
    const isOpen = !isNotStarted && !isEnded;

    const canRegister = ['PUBLISHED', 'ONGOING'].includes(event.status) && isOpen;

    // Check membership
    const isMember = user && societyData?.members?.some(
        (m: any) => (typeof m.user_id === 'object' ? m.user_id._id : m.user_id) === (user._id || user.id)
    );

    const isPrivateAndNotMember = !event.is_public && !isMember;

    return (
        <div className="min-h-screen bg-stone-50 font-sans">
            <Header />

             {/* Cover Area */}
             <div className="relative h-64 md:h-80 w-full overflow-hidden bg-stone-900 flex items-center justify-center -mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-stone-800 to-stone-900 opacity-90 z-10"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay opacity-20 z-10"></div>
            </div>

            {/* Main Content Container */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-20 pb-24">
                
                {/* Event Header Card */}
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-stone-200/50 border border-stone-100 mb-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                    
                    {/* Banner Thumbnail (overlap) */}
                    {event.banner && (
                        <div 
                            onClick={() => setIsBannerModalOpen(true)}
                            className="w-full md:w-64 aspect-video md:aspect-auto md:h-40 rounded-2xl bg-stone-100 shadow-lg border-4 border-white overflow-hidden shrink-0 cursor-pointer -mt-16 md:-mt-20 z-30 group relative"
                        >
                            <img
                                src={event.banner}
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                            </div>
                        </div>
                    )}

                    <div className="flex-1 w-full text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                            <div className="flex-1">
                            <button 
                                onClick={() => router.back()}
                                className="mb-6 flex items-center gap-2 text-stone-500 hover:text-orange-600 transition-colors text-sm font-medium w-fit border border-stone-200 hover:border-orange-200 bg-stone-50 px-4 py-1.5 rounded-full"
                            >
                                <FaArrowLeft /> Back to Directory
                            </button>
                            
                            <div className="flex flex-wrap gap-3 mb-4">
                                <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {event.event_type}
                                </span>
                                {event.is_public ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider border border-green-200">
                                        Public Event
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
                                        Members Only
                                    </span>
                                )}
                            </div>

                            <h1 className="font-display font-bold text-3xl md:text-5xl text-stone-900 mb-4 leading-tight">
                                {event.title}
                            </h1>

                            <div className="flex flex-wrap gap-4 text-stone-600 font-medium">
                                <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-xl text-sm border border-stone-100">
                                    <FaCalendarAlt className="text-orange-500" />
                                    <span>
                                        {new Date(event.event_date).toLocaleDateString('en-US', { 
                                            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-xl text-sm border border-stone-100">
                                    <FaClock className="text-stone-500" />
                                    <span>
                                        {new Date(event.event_date).toLocaleTimeString('en-US', { 
                                            hour: '2-digit', minute: '2-digit' 
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-xl text-sm border border-stone-100">
                                    <FaMapMarkerAlt className="text-orange-500" />
                                    <span>{event.venue}</span>
                                </div>
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border font-bold ${
                                    event.price > 0 
                                        ? 'bg-orange-600 text-white border-orange-600' 
                                        : 'bg-green-100 text-green-700 border-green-200'
                                }`}>
                                    <span className="uppercase tracking-wider">
                                        {event.price > 0 ? `PKR ${event.price}` : 'Free Entry'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Share & Actions */}
                        <div className="flex items-center gap-2 shadow-sm border border-stone-100 rounded-2xl p-1 bg-stone-50 h-fit shrink-0 mt-2 md:mt-0">
                             <button
                                onClick={handleShare}
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
            </div>
        </div>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Description */}
                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200">
                            <h3 className="font-display text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                                <span className="bg-orange-500 w-2 h-6 rounded-full inline-block"></span>
                                About the Event
                            </h3>
                            <p className="font-body text-stone-600 text-lg leading-relaxed whitespace-pre-wrap">
                                {event.description}
                            </p>
                        </section>

                        {/* Content Sections */}
                        {event.content_sections && event.content_sections.map((section: any, idx: number) => (
                             <section key={idx} className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200">
                                <h3 className="font-display text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                                    <span className="bg-orange-500 w-2 h-6 rounded-full inline-block"></span>
                                    {section.title}
                                </h3>
                                <div className="prose prose-orange max-w-none text-stone-600 leading-relaxed font-body text-lg whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: section.content }} />
                            </section>
                        ))}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        <div className="sticky top-24 space-y-6">
                            
                            {/* Organizer Card */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Organized By</p>
                                <Link href={`/societies/${(event.society_id as any)?._id}`} className="flex items-center gap-4 hover:bg-stone-50 p-3 rounded-2xl transition-colors group border border-transparent hover:border-stone-100 -mx-3">
                                    {(event.society_id as any)?.logo ? (
                                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-stone-200 shadow-sm group-hover:border-orange-200 transition-colors shrink-0">
                                            <Image 
                                                src={(event.society_id as any).logo} 
                                                alt={(event.society_id as any).name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl group-hover:bg-orange-200 transition-colors shrink-0">
                                            {(event.society_id as any)?.name?.charAt(0) || 'S'}
                                        </div>
                                    )}
                                     <div>
                                        <h4 className="font-bold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                                            {typeof event.society_id === 'object' ? (event.society_id as any).name : 'Society'}
                                        </h4>
                                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-1 font-medium hover:text-orange-500">
                                            View Society <FaArrowRight className="text-[10px]" />
                                        </p>
                                     </div>
                                </Link>
                            </div>

                            {/* Registration CTA Card */}
                            <div className="bg-stone-900 rounded-3xl p-6 shadow-xl border border-stone-800 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                
                                <h3 className="font-display text-lg font-bold text-white mb-5 relative z-10 flex items-center justify-between">
                                    Registration
                                    {isOpen ? (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                            <DoorOpen className="w-3 h-3" /> Open
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                            <DoorClosed className="w-3 h-3" /> Closed
                                        </span>
                                    )}
                                </h3>

                                <div className="space-y-4 mb-6 relative z-10 text-sm border-b border-stone-800 pb-6">
                                    {startDate && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-stone-400">Opens</span>
                                            <span className="font-medium text-stone-200">
                                                {startDate.toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    {endDate && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-stone-400">Closes</span>
                                            <span className="font-medium text-stone-200">
                                                {endDate.toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="relative z-10">
                                    {canRegister ? (
                                        <>
                                            <AnimatePresence>
                                                {showForm && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="space-y-4 overflow-hidden mb-6 bg-stone-50 rounded-2xl p-4 border border-stone-200 text-stone-900"
                                                    >
                                                        <h3 className="font-bold mb-2">Registration Form</h3>
                                                        {registrationForm && registrationForm.fields
                                                            .sort((a: EventFormField, b: EventFormField) => a.order - b.order)
                                                            .map((field: EventFormField, idx: number) => (
                                                                <div key={idx}>
                                                                    <label className="block text-xs font-bold text-stone-600 mb-1.5 uppercase tracking-wide">
                                                                        {field.label}
                                                                        {field.is_required && <span className="text-red-500 ml-1">*</span>}
                                                                    </label>
                                                                    {renderFormField(field)}
                                                                </div>
                                                            ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            
                                            {showForm ? (
                                                <>
                                                    {/* Payment Information Section */}
                                                    {event.price > 0 && event.payment_info && (
                                                        <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                                            <div className="flex items-center gap-2 mb-3 text-orange-800">
                                                                <FaUsers className="w-4 h-4" />
                                                                <h4 className="font-bold text-sm">Payment Instructions</h4>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-orange-600/70">Account Number:</span>
                                                                    <span className="font-mono font-bold text-orange-900">{event.payment_info.acc_num}</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-orange-600/70">Holder Name:</span>
                                                                    <span className="font-bold text-orange-900">{event.payment_info.acc_holder_name}</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-orange-600/70">Destination:</span>
                                                                    <span className="font-bold text-orange-900">{event.payment_info.acc_destination}</span>
                                                                </div>
                                                            </div>
                                                            <p className="mt-3 text-[10px] text-orange-600 leading-relaxed italic">
                                                                Please send the registration fee of PKR {event.price} to the above account and keep the screenshot/receipt for verification.
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={handleRegister}
                                                            disabled={isRegLoading}
                                                            className="flex-1 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-bold shadow-lg shadow-orange-600/20 disabled:opacity-50"
                                                        >
                                                            {isRegLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Registration'}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowForm(false)}
                                                            className="px-4 py-3 bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-colors font-medium border border-stone-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                    <button
                                                        onClick={() => {
                                                            if (!user) {
                                                                router.push(`/login?returnUrl=${encodeURIComponent(`/events/${id}`)}`);
                                                                return;
                                                            }
                                                            if (myRegistration) {
                                                                setShowRegistrationDetails(true);
                                                                return;
                                                            }
                                                            if (isPrivateAndNotMember) {
                                                                toast.error("This event is for society members only.");
                                                                return;
                                                            }
                                                            if (registrationForm) {
                                                                setShowForm(true);
                                                            } else {
                                                                handleRegister();
                                                            }
                                                        }}
                                                        disabled={(isPrivateAndNotMember && !!user) || isRegLoading}
                                                        className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group ${
                                                            (isPrivateAndNotMember && user)
                                                                ? 'bg-stone-800 cursor-not-allowed text-stone-500 border border-stone-700' 
                                                                : myRegistration 
                                                                    ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20 shadow-xl'
                                                                    : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20 shadow-xl'
                                                        }`}
                                                    >
                                                        {isRegLoading ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (isPrivateAndNotMember && user) ? (
                                                            <>
                                                                <FaUsers /> Members Only
                                                            </>
                                                        ) : myRegistration ? (
                                                            <>
                                                                <ShieldCheck className="w-5 h-5" />
                                                                You are Registered
                                                            </>
                                                        ) : (
                                                            <>
                                                                {event.price > 0 ? `Register Now - PKR ${event.price}` : 'Register Now (Free)'}
                                                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                                            </>
                                                        )}
                                                    </button>
                                            )}
                                        </>
                                    ) : (
                                        <button disabled className="w-full py-4 bg-stone-800 text-stone-500 font-bold rounded-xl cursor-not-allowed border border-stone-700 text-sm">
                                            Registration is Currently Closed
                                        </button>
                                    )}

                                    {/* Registered Status Button */}
                                    {user && myRegistration && (
                                        <div className="mt-4 pt-4 border-t border-stone-800">
                                            <button
                                                onClick={() => setShowRegistrationDetails(true)}
                                                className="w-full py-3 bg-orange-600/10 hover:bg-orange-600/20 text-orange-500 border border-orange-500/30 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                                            >
                                                <FaUsers />
                                                View Your Registration
                                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    )}

                                    {event.max_participants && (
                                        <p className="text-center text-xs text-stone-400 mt-4 flex items-center justify-center gap-1.5 font-medium">
                                            <FaUsers className="text-stone-500" /> max {event.max_participants} participants
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Tags */}
                            {event.tags && event.tags.length > 0 && (
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
                                    <h4 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                                        <FaTag className="text-stone-400" /> Tags
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {event.tags.map((tag: string, i: number) => (
                                            <span key={i} className="px-3 py-1.5 bg-stone-50 text-stone-600 text-xs font-semibold rounded-lg border border-stone-100 uppercase tracking-wide">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
            
            <Footer />

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
                            <p className="text-stone-500 text-sm mt-1">Share this event with others!</p>
                        </div>
                        <div className="flex justify-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                             <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(currentUrl)}`} 
                                alt="Event QR Code"
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
                                onClick={handleShare}
                                className="w-full py-3 bg-stone-100 text-stone-900 font-bold rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <LinkIcon className="w-4 h-4" />
                                Copy Link
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Banner Modal */}
            {isBannerModalOpen && event.banner && (
                 <div 
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/90 backdrop-blur-md" 
                    onClick={() => setIsBannerModalOpen(false)}
                >
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsBannerModalOpen(false); }}
                        className="absolute top-6 right-6 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={event.banner}
                            alt={event.title}
                            fill
                            className="object-contain"
                            priority
                        />
                    </motion.div>
                </div>
            )}

            {/* Registration Details Modal */}
            {showRegistrationDetails && myRegistration && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-8 shadow-2xl max-w-2xl w-full relative max-h-[90vh] overflow-y-auto"
                    >
                        <button 
                            onClick={() => setShowRegistrationDetails(false)}
                            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="mb-8">
                            <h3 className="font-display text-2xl font-bold text-stone-900">Your Registration</h3>
                            <p className="text-stone-500 text-sm mt-1">Here is what you submitted for this event.</p>
                        </div>

                        {event.payment_info && event.price > 0 && (
                             <div className="mb-8 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                                <h4 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                                    <FaUsers className="w-4 h-4" />
                                    Payment Instructions
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-orange-600/70 text-xs">Amount Due</p>
                                        <p className="font-bold text-lg text-orange-900">PKR {event.price}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-orange-600/70 text-xs">Destination</p>
                                        <p className="font-bold text-orange-900">{event.payment_info.acc_destination}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-orange-600/70 text-xs">Account Number</p>
                                        <p className="font-mono font-bold text-orange-900 tracking-wider">{event.payment_info.acc_num}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-orange-600/70 text-xs">Account Holder</p>
                                        <p className="font-bold text-orange-900">{event.payment_info.acc_holder_name}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-orange-200">
                                    <p className="text-xs text-orange-700 leading-relaxed font-medium">
                                        Your registration is received. Please transfer the amount and keep the receipt. Our team will verify it shortly.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                             <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Status</p>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        myRegistration.status === 'APPROVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                                        myRegistration.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                        'bg-amber-100 text-amber-700 border border-amber-200'
                                    }`}>
                                        {myRegistration.status}
                                    </span>
                                </div>
                                {myRegistration.rejection_reason && (
                                    <p className="text-sm text-rose-600 mt-2 font-medium">Reason: {myRegistration.rejection_reason}</p>
                                )}
                            </div>
                            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Date Submitted</p>
                                <p className="text-stone-800 font-bold">
                                    {new Date(myRegistration.created_at).toLocaleDateString(undefined, {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-stone-900 border-b border-stone-100 pb-2">Form Data</h4>
                            {myRegistration.responses.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {myRegistration.responses.map((resp, i) => (
                                        <div key={i} className="flex flex-col gap-1 border-b border-stone-50 pb-3 last:border-0">
                                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">{resp.field_label}</span>
                                            {resp.field_type === 'FILE' ? (
                                                <a 
                                                    href={resp.value as string} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-orange-600 font-medium flex items-center gap-2 hover:underline"
                                                >
                                                    <Download className="w-4 h-4" /> View Submitted File
                                                </a>
                                            ) : (
                                                <span className="text-stone-800 font-medium">{String(resp.value)}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-stone-500 italic">No additional form data provided.</p>
                            )}
                        </div>

                        <div className="mt-10">
                            <button
                                onClick={() => setShowRegistrationDetails(false)}
                                className="w-full py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-colors shadow-lg"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
