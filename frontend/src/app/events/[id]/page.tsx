"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Header from "@/components/Header";
import { 
    useGetEventByIdQuery, 
    useSubmitEventRegistrationMutation, 
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
import { Loader2, DoorOpen, DoorClosed } from 'lucide-react';
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({});
    const [fileValues, setFileValues] = useState<Record<string, File>>({});

    const registrationForm = event?.registration_form && typeof event.registration_form === 'object'
        ? event.registration_form
        : null;

    const handleFieldChange = (label: string, value: string | number | boolean) => {
        setFormValues(prev => ({ ...prev, [label]: value }));
    };

    const handleFileChange = (label: string, file: File) => {
        setFileValues(prev => ({ ...prev, [label]: file }));
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Event link copied to clipboard!');
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
        const baseClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 transition-all";

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
                    <label className="flex items-center gap-3 text-gray-700 cursor-pointer p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={!!formValues[field.label]}
                            onChange={(e) => handleFieldChange(field.label, e.target.checked)}
                            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
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
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-600 file:font-bold file:cursor-pointer hover:file:bg-indigo-100 transition-all"
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                <Header />
                <div className="grow flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                <Header />
                <div className="grow flex flex-col items-center justify-center text-center px-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
                    <p className="text-gray-500 mb-6">The event you are looking for does not exist or has been removed.</p>
                    <button 
                        onClick={() => router.push('/events')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
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
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />

            {/* Hero Section / Banner */}
            <div className="relative h-[400px] w-full mt-20">
                {event.banner ? (
                    <Image
                        src={event.banner}
                        alt={event.title}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center">
                        <span className="text-6xl">📅</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
                    <div className="max-w-[1400px] mx-auto relative z-10">
                        <button 
                            onClick={() => router.back()}
                            className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-md"
                        >
                            <FaArrowLeft /> Back
                        </button>
                        
                        <div className="flex flex-wrap gap-3 mb-4">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-sm font-semibold">
                                {event.event_type}
                            </span>
                            {event.is_public ? (
                                <span className="px-3 py-1 bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-300 rounded-full text-sm font-semibold">
                                    Public
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-300 rounded-full text-sm font-semibold">
                                    Members Only
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
                            {event.title}
                        </h1>

                        <div className="flex flex-wrap gap-6 text-white/90 font-medium">
                            <div className="flex items-center gap-2">
                                <FaCalendarAlt className="text-indigo-300" />
                                <span>
                                    {new Date(event.event_date).toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        month: 'long', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaClock className="text-teal-300" />
                                <span>
                                    {new Date(event.event_date).toLocaleTimeString('en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaMapMarkerAlt className="text-red-300" />
                                <span>{event.venue}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="grow py-12 px-6">
                <div className="max-w-[1400px] mx-auto grid md:grid-cols-3 gap-8">
                    {/* Left Column: Content */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Description */}
                        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Event</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {event.description}
                            </p>
                        </section>

                        {/* Content Sections */}
                        {event.content_sections && event.content_sections.map((section, idx) => (
                            <section key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h3>
                                <div className="text-gray-600 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: section.content }} />
                            </section>
                        ))}
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-6">
                        {/* Registration Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 sticky top-28 transition-all">
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Organized by</p>
                                <Link href={`/societies/${(event.society_id as any)?._id}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors group">
                                    {(event.society_id as any)?.logo ? (
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200 shadow-sm group-hover:border-indigo-200 transition-colors">
                                            <Image 
                                                src={(event.society_id as any).logo} 
                                                alt={(event.society_id as any).name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg group-hover:bg-indigo-200 transition-colors">
                                            {(event.society_id as any)?.name?.charAt(0) || 'S'}
                                        </div>
                                    )}
                                     <div>
                                        <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {typeof event.society_id === 'object' ? (event.society_id as any).name : 'Society'}
                                        </h4>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 group-hover:text-indigo-500 transition-colors">
                                            View Society Profile <FaArrowRight className="text-[10px]" />
                                        </p>
                                     </div>
                                </Link>
                            </div>

                            {/* Registration Status Badges & Times */}
                            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                                <div className="flex items-center gap-2">
                                    {isOpen ? (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-lg uppercase tracking-wide">
                                            <DoorOpen className="w-3.5 h-3.5" />
                                            Registration Open
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-600 text-xs font-bold rounded-lg uppercase tracking-wide">
                                            <DoorClosed className="w-3.5 h-3.5" />
                                            Registration Closed
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1.5 text-sm">
                                    {startDate && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Opens:</span>
                                            <span className="font-medium text-gray-900">
                                                {startDate.toLocaleDateString()} {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )}
                                    {endDate && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Closes:</span>
                                            <span className="font-medium text-gray-900">
                                                {endDate.toLocaleDateString()} {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {canRegister ? (
                                <>
                                    {!showForm ? (
                                            <button
                                                onClick={() => {
                                                    if (!user) {
                                                        router.push(`/login?returnUrl=${encodeURIComponent(`/events/${id}`)}`);
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
                                                disabled={isPrivateAndNotMember && !!user}
                                                className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group ${
                                                    isPrivateAndNotMember && user
                                                        ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                                                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5'
                                                }`}
                                            >
                                                {isPrivateAndNotMember && user ? (
                                                    <>
                                                        <FaUsers /> Members Only
                                                    </>
                                                ) : (
                                                    <>
                                                        Register Now 
                                                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                    ) : (
                                        <AnimatePresence>
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-4 overflow-hidden"
                                            >
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">Registration Form</h3>
                                                {registrationForm && registrationForm.fields
                                                    .sort((a: EventFormField, b: EventFormField) => a.order - b.order)
                                                    .map((field: EventFormField, idx: number) => (
                                                        <div key={idx}>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                                {field.label}
                                                                {field.is_required && <span className="text-red-500 ml-1">*</span>}
                                                            </label>
                                                            {renderFormField(field)}
                                                        </div>
                                                    ))}

                                                <div className="flex gap-3 pt-4">
                                                    <button
                                                        onClick={handleRegister}
                                                        disabled={isSubmitting}
                                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors font-bold shadow-md"
                                                    >
                                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                                    </button>
                                                    <button
                                                        onClick={() => setShowForm(false)}
                                                        className="px-4 py-3 bg-white text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium border border-gray-200"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    )}
                                </>
                            ) : (
                                <button disabled className="w-full py-4 bg-gray-100 text-gray-400 font-bold rounded-xl cursor-not-allowed border border-gray-200">
                                    Registration Closed
                                </button>
                            )}
                            
                            {event.max_participants && (
                                <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1 font-medium">
                                    <FaUsers className="text-indigo-400" /> Limited to {event.max_participants} participants
                                </p>
                            )}
                        </div>

                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaTag className="text-indigo-500" /> Tags
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {event.tags.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg border border-gray-100">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                         
                        <div className="text-center">
                            <button 
                                onClick={handleShare}
                                className="text-indigo-600 font-bold text-sm flex items-center justify-center gap-2 hover:underline transition-all w-full py-2 hover:bg-indigo-50 rounded-lg"
                            >
                                <FaShareAlt /> Share Event
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
