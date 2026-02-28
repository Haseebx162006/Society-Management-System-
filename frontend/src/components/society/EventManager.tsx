'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaEye, FaEyeSlash, FaClipboardList, FaFileExcel, FaEnvelope } from 'react-icons/fa';
import { MdEvent } from 'react-icons/md';
import {
    useGetEventsBySocietyQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
    useGetEventFormsBySocietyQuery,
    useSendMailToParticipantsMutation,
    EventData,
    EventContentSection
} from '@/lib/features/events/eventApiSlice';
import EventRegistrationManager from './EventRegistrationManager';

interface EventManagerProps {
    societyId: string;
}

const EVENT_TYPES = [
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'SEMINAR', label: 'Seminar' },
    { value: 'COMPETITION', label: 'Competition' },
    { value: 'MEETUP', label: 'Meetup' },
    { value: 'CULTURAL', label: 'Cultural' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'OTHER', label: 'Other' },
];

const STATUS_OPTIONS = [
    { value: 'DRAFT', label: 'Draft', color: 'bg-slate-100 text-slate-600' },
    { value: 'PUBLISHED', label: 'Published', color: 'bg-green-100 text-green-700' },
    { value: 'ONGOING', label: 'Ongoing', color: 'bg-orange-100 text-orange-700' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-amber-100 text-amber-700' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
];

const EventManager: React.FC<EventManagerProps> = ({ societyId }) => {
    const { data: events, isLoading } = useGetEventsBySocietyQuery(societyId);
    const { data: eventForms } = useGetEventFormsBySocietyQuery(societyId);
    const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
    const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
    const [deleteEvent] = useDeleteEventMutation();
    const [sendMail, { isLoading: isSendingMail }] = useSendMailToParticipantsMutation();

    const [view, setView] = useState<'list' | 'create' | 'edit' | 'registrations'>('list');
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Mail modal state
    const [showMailModal, setShowMailModal] = useState(false);
    const [mailEventId, setMailEventId] = useState('');
    const [mailEventTitle, setMailEventTitle] = useState('');
    const [mailSubject, setMailSubject] = useState('');
    const [mailMessage, setMailMessage] = useState('');
    const [mailError, setMailError] = useState('');
    const [mailSuccess, setMailSuccess] = useState('');

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventEndDate, setEventEndDate] = useState('');
    const [venue, setVenue] = useState('');
    const [eventType, setEventType] = useState('OTHER');
    const [maxParticipants, setMaxParticipants] = useState('');
    const [registrationDeadline, setRegistrationDeadline] = useState('');
    const [registrationForm, setRegistrationForm] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [status, setStatus] = useState('DRAFT');
    const [tags, setTags] = useState('');
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [price, setPrice] = useState('0');
    const [contentSections, setContentSections] = useState<EventContentSection[]>([]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setEventDate('');
        setEventEndDate('');
        setVenue('');
        setEventType('OTHER');
        setMaxParticipants('');
        setRegistrationDeadline('');
        setRegistrationForm('');
        setIsPublic(true);
        setStatus('DRAFT');
        setTags('');
        setBannerFile(null);
        setPrice('0');
        setContentSections([]);
        setSelectedEvent(null);
        setError('');
        setSuccess('');
    };

    const startCreate = () => {
        resetForm();
        setView('create');
    };

    const startEdit = (event: EventData) => {
        setSelectedEvent(event);
        setTitle(event.title);
        setDescription(event.description);
        setEventDate(event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '');
        setEventEndDate(event.event_end_date ? new Date(event.event_end_date).toISOString().slice(0, 16) : '');
        setVenue(event.venue);
        setEventType(event.event_type);
        setMaxParticipants(event.max_participants ? String(event.max_participants) : '');
        setRegistrationDeadline(event.registration_deadline ? new Date(event.registration_deadline).toISOString().slice(0, 16) : '');
        setRegistrationForm(typeof event.registration_form === 'object' ? event.registration_form._id : event.registration_form || '');
        setIsPublic(event.is_public);
        setStatus(event.status);
        setTags(event.tags?.join(', ') || '');
        setContentSections(event.content_sections || []);
        setBannerFile(null);
        setPrice(event.price ? String(event.price) : '0');
        setError('');
        setSuccess('');
        setView('edit');
    };

    const viewRegistrations = (event: EventData) => {
        setSelectedEvent(event);
        setView('registrations');
    };

    const addContentSection = () => {
        setContentSections([...contentSections, { title: '', content: '' }]);
    };

    const removeContentSection = (index: number) => {
        setContentSections(contentSections.filter((_, i) => i !== index));
    };

    const updateContentSection = (index: number, field: 'title' | 'content', value: string) => {
        setContentSections(contentSections.map((s, i) => i === index ? { ...s, [field]: value } : s));
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');

        if (!title.trim() || !description.trim() || !eventDate || !venue.trim()) {
            setError('Title, description, event date, and venue are required');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('event_date', eventDate);
            if (eventEndDate) formData.append('event_end_date', eventEndDate);
            formData.append('venue', venue);
            formData.append('event_type', eventType);
            if (maxParticipants) formData.append('max_participants', maxParticipants);
            if (registrationDeadline) formData.append('registration_deadline', registrationDeadline);
            if (registrationForm) formData.append('registration_form', registrationForm);
            formData.append('is_public', String(isPublic));
            formData.append('status', status);
            formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)));
            formData.append('content_sections', JSON.stringify(contentSections.filter(s => s.title && s.content)));
            formData.append('price', price || '0');
            if (bannerFile) formData.append('banner', bannerFile);

            if (selectedEvent && view === 'edit') {
                await updateEvent({ societyId, eventId: selectedEvent._id, body: formData }).unwrap();
                setSuccess('Event updated successfully!');
            } else {
                await createEvent({ societyId, body: formData }).unwrap();
                setSuccess('Event created successfully!');
            }

            setTimeout(() => {
                resetForm();
                setView('list');
            }, 1500);
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            setError(error?.data?.message || 'Failed to save event');
        }
    };

    const handleDelete = async (eventId: string) => {
        if (!window.confirm('Are you sure you want to cancel this event?')) return;
        try {
            await deleteEvent({ societyId, eventId }).unwrap();
            setSuccess('Event cancelled successfully!');
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            setError(error?.data?.message || 'Failed to cancel event');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusObj = STATUS_OPTIONS.find(s => s.value === status);
        return statusObj ? (
            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${statusObj.color}`}>
                {statusObj.label}
            </span>
        ) : null;
    };

    const openMailModal = (event: EventData) => {
        setMailEventId(event._id);
        setMailEventTitle(event.title);
        setMailSubject(`Update: ${event.title}`);
        setMailMessage('');
        setMailError('');
        setMailSuccess('');
        setShowMailModal(true);
    };

    const handleSendMail = async () => {
        setMailError('');
        setMailSuccess('');
        if (!mailSubject.trim() || !mailMessage.trim()) {
            setMailError('Subject and message are required');
            return;
        }
        try {
            const result = await sendMail({
                societyId,
                eventId: mailEventId,
                body: { subject: mailSubject, message: mailMessage }
            }).unwrap();
            setMailSuccess(`Emails sent successfully! ${result.successCount} delivered${result.failCount > 0 ? `, ${result.failCount} failed` : ''}.`);
            setTimeout(() => setShowMailModal(false), 2500);
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            setMailError(error?.data?.message || 'Failed to send emails');
        }
    };
    const handleToggleVisibility = async (event: EventData) => {
        try {
            const formData = new FormData();
            formData.append('is_public', String(!event.is_public));
            
            await updateEvent({ 
                societyId, 
                eventId: event._id, 
                body: formData 
            }).unwrap();
            
            setSuccess(`Event is now ${!event.is_public ? 'Public' : 'Private'}`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            setError(error?.data?.message || 'Failed to update visibility');
        }
    };


    const getToken = (): string => {
        try {
            const authState = localStorage.getItem('authState');
            if (authState) return JSON.parse(authState).token || '';
        } catch { /* ignore */ }
        return '';
    };

    const handleExportExcel = async (eventId: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/society/${societyId}/events/${eventId}/export`,
                {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                }
            );
            if (!response.ok) throw new Error('Export failed');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `event_registrations.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            setError('Failed to export registrations');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-orange-500 animate-pulse text-lg">Loading events...</div>
            </div>
        );
    }

    // ─── Registrations View ─────────────────────────────────────────
    if (view === 'registrations' && selectedEvent) {
        return (
            <div>
                <button
                    onClick={() => { setView('list'); setSelectedEvent(null); }}
                    className="flex items-center gap-2 text-slate-500 hover:text-orange-600 mb-4 font-medium"
                >
                    ← Back to Events
                </button>
                <EventRegistrationManager
                    societyId={societyId}
                    eventId={selectedEvent._id}
                    eventTitle={selectedEvent.title}
                />
            </div>
        );
    }

    // ─── Create / Edit View ─────────────────────────────────────────
    if (view === 'create' || view === 'edit') {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {view === 'edit' ? 'Edit Event' : 'Create New Event'}
                    </h2>
                    <button
                        onClick={() => { resetForm(); setView('list'); }}
                        className="text-slate-400 hover:text-slate-600 text-lg"
                    >
                        ✕
                    </button>
                </div>

                {(error || success) && (
                    <div className={`p-4 rounded-xl border ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                        {error || success}
                    </div>
                )}

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                    {/* Basic Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800"
                                    placeholder="e.g., Annual Tech Hackathon 2026"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800 resize-none"
                                    placeholder="Describe your event in detail..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Type</label>
                                <select
                                    value={eventType}
                                    onChange={(e) => setEventType(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800 bg-white"
                                >
                                    {EVENT_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Venue *</label>
                                <input
                                    type="text"
                                    value={venue}
                                    onChange={(e) => setVenue(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800"
                                    placeholder="e.g., Main Auditorium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Date & Time</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={eventEndDate}
                                    onChange={(e) => setEventEndDate(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Registration Deadline</label>
                                <input
                                    type="datetime-local"
                                    value={registrationDeadline}
                                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Registration Settings */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Registration Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Max Participants</label>
                                <input
                                    type="number"
                                    value={maxParticipants}
                                    onChange={(e) => setMaxParticipants(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800"
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Registration Form</label>
                                <select
                                    value={registrationForm}
                                    onChange={(e) => setRegistrationForm(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800 bg-white"
                                >
                                    <option value="">No registration form</option>
                                    {eventForms?.filter(f => f.is_active).map(form => (
                                        <option key={form._id} value={form._id}>{form.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800 bg-white"
                                >
                                    {STATUS_OPTIONS.map(s => (
                                        <option key={s.value} value={s.label}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Registration Fee (PKR)</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800"
                                    placeholder="0 for free"
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-6 mt-4">
                            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer font-medium">
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                                />
                                Public Event
                            </label>
                        </div>
                    </div>

                    {/* Banner & Tags */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Media & Tags</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Event Banner</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:font-medium file:cursor-pointer"
                                />
                                {selectedEvent?.banner && !bannerFile && (
                                    <p className="text-xs text-slate-400 mt-1">Current banner set. Upload a new one to replace.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tags</label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800"
                                    placeholder="tech, hackathon, coding (comma-separated)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">Content Sections</h3>
                            <button
                                onClick={addContentSection}
                                className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium"
                            >
                                <FaPlus className="text-xs" /> Add Section
                            </button>
                        </div>
                        {contentSections.length === 0 ? (
                            <p className="text-slate-400 text-sm">Add custom content sections for event details, rules, schedule, etc.</p>
                        ) : (
                            <div className="space-y-3">
                                {contentSections.map((section, index) => (
                                    <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-semibold text-slate-400">Section #{index + 1}</span>
                                            <button
                                                onClick={() => removeContentSection(index)}
                                                className="p-1 text-slate-400 hover:text-red-600"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={section.title}
                                            onChange={(e) => updateContentSection(index, 'title', e.target.value)}
                                            placeholder="Section Title"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-800"
                                        />
                                        <textarea
                                            value={section.content}
                                            onChange={(e) => updateContentSection(index, 'content', e.target.value)}
                                            placeholder="Section content..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-800 resize-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button
                            onClick={handleSave}
                            disabled={isCreating || isUpdating}
                            className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-colors font-medium"
                        >
                            {isCreating || isUpdating ? 'Saving...' : view === 'edit' ? 'Update Event' : 'Create Event'}
                        </button>
                        <button
                            onClick={() => { resetForm(); setView('list'); }}
                            className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Event List View ────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Events</h2>
                    <p className="text-slate-500 mt-1">Create and manage your society events</p>
                </div>
                <button
                    onClick={startCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium"
                >
                    <FaPlus /> Create Event
                </button>
            </div>

            {(error || success) && (
                <div className={`p-4 rounded-xl border ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    {error || success}
                </div>
            )}

            {events && events.length > 0 ? (
                <div className="space-y-4">
                    {events.map((event) => (
                        <div key={event._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex">
                                {/* Banner */}
                                {event.banner && (
                                    <div className="w-48 h-auto shrink-0 relative">
                                        <Image
                                            src={event.banner}
                                            alt={event.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 p-5">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-slate-800">{event.title}</h3>
                                                {getStatusBadge(event.status)}
                                            </div>
                                            <p className="text-slate-500 text-sm line-clamp-2">{event.description}</p>

                                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                                                <span className="flex items-center gap-1.5">
                                                    <FaCalendarAlt className="text-orange-400" />
                                                    {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <FaMapMarkerAlt className="text-red-400" />
                                                    {event.venue}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <MdEvent className="text-amber-400" />
                                                    {EVENT_TYPES.find(t => t.value === event.event_type)?.label}
                                                </span>
                                                {event.max_participants && (
                                                    <span className="flex items-center gap-1.5">
                                                        <FaUsers className="text-green-400" />
                                                        Max {event.max_participants}
                                                    </span>
                                                )}
                                            </div>

                                            {event.tags && event.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {event.tags.map((tag, idx) => (
                                                        <span key={idx} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1 ml-4">
                                            <button
                                                onClick={() => viewRegistrations(event)}
                                                className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                title="View Registrations"
                                            >
                                                <FaClipboardList />
                                            </button>
                                            <button
                                                onClick={() => handleExportExcel(event._id)}
                                                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Export to Excel"
                                            >
                                                <FaFileExcel />
                                            </button>
                                            <button
                                                onClick={() => handleToggleVisibility(event)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    event.is_public 
                                                        ? 'text-green-500 hover:bg-green-50' 
                                                        : 'text-amber-500 hover:bg-amber-50'
                                                }`}
                                                title={event.is_public ? "Make Private" : "Make Public"}
                                            >
                                                {event.is_public ? <FaEye /> : <FaEyeSlash />}
                                            </button>
                                            <button
                                                onClick={() => openMailModal(event)}
                                                className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                title="Send Mail to Participants"
                                            >
                                                <FaEnvelope />
                                            </button>
                                            <button
                                                onClick={() => startEdit(event)}
                                                className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                title="Edit Event"
                                            >
                                                <FaEdit />
                                            </button>
                                            {event.status !== 'CANCELLED' && (
                                                <button
                                                    onClick={() => handleDelete(event._id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Cancel Event"
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <div className="text-5xl mb-4">🎉</div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No Events Yet</h3>
                    <p className="text-slate-400 mb-4">Create your first event to get started</p>
                    <button
                        onClick={startCreate}
                        className="px-5 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium"
                    >
                        Create Your First Event
                    </button>
                </div>
            )}

            <SendMailModal
                show={showMailModal}
                onClose={() => setShowMailModal(false)}
                eventTitle={mailEventTitle}
                subject={mailSubject}
                setSubject={setMailSubject}
                message={mailMessage}
                setMessage={setMailMessage}
                error={mailError}
                success={mailSuccess}
                isSending={isSendingMail}
                onSend={handleSendMail}
            />
        </div>
    );
};

// ─── Send Mail Modal (rendered outside main flow) ───────────────────────────
const SendMailModal = ({
    show,
    onClose,
    eventTitle,
    subject,
    setSubject,
    message,
    setMessage,
    error,
    success,
    isSending,
    onSend,
}: {
    show: boolean;
    onClose: () => void;
    eventTitle: string;
    subject: string;
    setSubject: (v: string) => void;
    message: string;
    setMessage: (v: string) => void;
    error: string;
    success: string;
    isSending: boolean;
    onSend: () => void;
}) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-linear-to-r from-orange-600 to-amber-600 px-6 py-5">
                    <h3 className="text-lg font-bold text-white">Send Mail to Participants</h3>
                    <p className="text-orange-100 text-sm mt-0.5 truncate">{eventTitle}</p>
                </div>
                <div className="p-6 space-y-4">
                    {(error || success) && (
                        <div className={`p-3 rounded-xl border text-sm ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                            {error || success}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800"
                            placeholder="Email subject line"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800 resize-none"
                            placeholder="Write your message to all approved participants..."
                        />
                    </div>
                    <p className="text-xs text-slate-400">
                        This email will be sent to all <strong>approved</strong> participants of this event.
                    </p>
                </div>
                <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
                    <button
                        onClick={onSend}
                        disabled={isSending}
                        className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
                    >
                        <FaEnvelope className="text-sm" />
                        {isSending ? 'Sending...' : 'Send Email'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isSending}
                        className="px-5 py-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-100 transition-colors font-medium border border-slate-200"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventManager;
