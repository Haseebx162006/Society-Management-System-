'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Loader2, Upload } from 'lucide-react';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import { useGetEventByIdQuery, useSubmitEventRegistrationMutation, EventFormField } from '@/lib/features/events/eventApiSlice';
import { useAppSelector } from '@/lib/hooks';
import { selectCurrentUser } from '@/lib/features/auth/authSlice';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Header from '@/components/Header';

export default function EventDetailPage() {
    const { eventId } = useParams();
    const router = useRouter();
    const user = useAppSelector(selectCurrentUser);
    const { data: event, isLoading } = useGetEventByIdQuery(eventId as string);
    const [submitRegistration, { isLoading: isSubmitting }] = useSubmitEventRegistrationMutation();

    const [showForm, setShowForm] = useState(false);
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [fileValues, setFileValues] = useState<Record<string, File>>({});

    const registrationForm = event?.registration_form && typeof event.registration_form === 'object'
        ? event.registration_form
        : null;

    const handleFieldChange = (label: string, value: any) => {
        setFormValues(prev => ({ ...prev, [label]: value }));
    };

    const handleFileChange = (label: string, file: File) => {
        setFileValues(prev => ({ ...prev, [label]: file }));
    };

    const handleRegister = async () => {
        if (!user) {
            router.push(`/login?returnUrl=${encodeURIComponent(`/events/${eventId}`)}`);
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
                await submitRegistration({ eventId: eventId as string, body: formData }).unwrap();
                toast.success('Registration submitted successfully!');
                setShowForm(false);
                setFormValues({});
                setFileValues({});
            } catch (err: any) {
                toast.error(err?.data?.message || 'Failed to register');
            }
        } else {
            // No form, direct registration
            const formData = new FormData();
            formData.append('responses', JSON.stringify([]));
            try {
                await submitRegistration({ eventId: eventId as string, body: formData }).unwrap();
                toast.success('Registration submitted successfully!');
            } catch (err: any) {
                toast.error(err?.data?.message || 'Failed to register');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-slate-800 mb-4">Event Not Found</h1>
                <Link href="/" className="text-blue-600 hover:underline">Go Home</Link>
            </div>
        );
    }

    const society = typeof event.society_id === 'object' ? event.society_id : null;
    const canRegister = ['PUBLISHED', 'ONGOING'].includes(event.status);
    const deadlinePassed = event.registration_deadline && new Date() > new Date(event.registration_deadline);

    const renderFormField = (field: EventFormField) => {
        const baseClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-800";

        switch (field.field_type) {
            case 'TEXT':
            case 'EMAIL':
            case 'PHONE':
                return (
                    <input
                        type={field.field_type === 'EMAIL' ? 'email' : field.field_type === 'PHONE' ? 'tel' : 'text'}
                        value={formValues[field.label] || ''}
                        onChange={(e) => handleFieldChange(field.label, e.target.value)}
                        className={baseClass}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    />
                );
            case 'NUMBER':
                return (
                    <input
                        type="number"
                        value={formValues[field.label] || ''}
                        onChange={(e) => handleFieldChange(field.label, e.target.value)}
                        className={baseClass}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    />
                );
            case 'DATE':
                return (
                    <input
                        type="date"
                        value={formValues[field.label] || ''}
                        onChange={(e) => handleFieldChange(field.label, e.target.value)}
                        className={baseClass}
                    />
                );
            case 'TEXTAREA':
                return (
                    <textarea
                        value={formValues[field.label] || ''}
                        onChange={(e) => handleFieldChange(field.label, e.target.value)}
                        className={`${baseClass} resize-none`}
                        rows={3}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    />
                );
            case 'DROPDOWN':
                return (
                    <select
                        value={formValues[field.label] || ''}
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
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formValues[field.label] || false}
                            onChange={(e) => handleFieldChange(field.label, e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        {field.placeholder || field.label}
                    </label>
                );
            case 'FILE':
                return (
                    <div>
                        <input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileChange(field.label, file);
                            }}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-medium file:cursor-pointer hover:file:bg-blue-100"
                        />
                        {fileValues[field.label] && (
                            <p className="text-xs text-slate-400 mt-1">{fileValues[field.label].name}</p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Banner */}
            {event.banner && (
                <div className="w-full h-64 md:h-80 relative">
                    <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 py-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {/* Event Header */}
                    <div className="mb-8">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                event.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                event.status === 'ONGOING' ? 'bg-blue-100 text-blue-700' :
                                event.status === 'COMPLETED' ? 'bg-purple-100 text-purple-700' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                                {event.status}
                            </span>
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                                {event.event_type}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{event.title}</h1>

                        {society && (
                            <p className="text-slate-500 mb-4">
                                By <span className="font-semibold text-blue-600">{society.name}</span>
                            </p>
                        )}

                        <div className="flex flex-wrap gap-6 text-sm text-slate-500">
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                {new Date(event.event_date).toLocaleDateString('en-US', {
                                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                                })}
                            </span>
                            {event.event_end_date && (
                                <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-purple-500" />
                                    to {new Date(event.event_end_date).toLocaleDateString('en-US', {
                                        month: 'long', day: 'numeric', year: 'numeric'
                                    })}
                                </span>
                            )}
                            <span className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-red-500" />
                                {event.venue}
                            </span>
                            {event.max_participants && (
                                <span className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-green-500" />
                                    Max {event.max_participants} participants
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="prose prose-slate max-w-none mb-8">
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                    </div>

                    {/* Content Sections */}
                    {event.content_sections && event.content_sections.length > 0 && (
                        <div className="space-y-6 mb-8">
                            {event.content_sections.map((section, idx) => (
                                <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <h3 className="text-xl font-bold text-slate-800 mb-3">{section.title}</h3>
                                    <p className="text-slate-600 whitespace-pre-wrap">{section.content}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            {event.tags.map((tag, idx) => (
                                <span key={idx} className="text-sm bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Registration Section */}
                    {canRegister && !deadlinePassed && (
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Register for This Event</h3>

                            {event.registration_deadline && (
                                <p className="text-sm text-slate-500 mb-4">
                                    Registration deadline: {new Date(event.registration_deadline).toLocaleDateString('en-US', {
                                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                                    })}
                                </p>
                            )}

                            {!showForm ? (
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            router.push(`/login?returnUrl=${encodeURIComponent(`/events/${eventId}`)}`);
                                            return;
                                        }
                                        if (registrationForm) {
                                            setShowForm(true);
                                        } else {
                                            handleRegister();
                                        }
                                    }}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg"
                                >
                                    Register Now
                                </button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4"
                                >
                                    {registrationForm && registrationForm.fields
                                        .sort((a: EventFormField, b: EventFormField) => a.order - b.order)
                                        .map((field: EventFormField, idx: number) => (
                                            <div key={idx}>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                                        </button>
                                        <button
                                            onClick={() => setShowForm(false)}
                                            className="px-6 py-3 bg-white text-slate-600 rounded-xl hover:bg-slate-100 transition-colors font-medium border border-slate-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {deadlinePassed && (
                        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 text-amber-700 font-medium">
                            Registration deadline has passed.
                        </div>
                    )}

                    {event.status === 'COMPLETED' && (
                        <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 text-purple-700 font-medium">
                            This event has been completed.
                        </div>
                    )}
                </motion.div>
            </div>

            <Footer />
        </div>
    );
}
