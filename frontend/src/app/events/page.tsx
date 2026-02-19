'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Loader2, X, Menu, Calendar, MapPin, Users, Clock, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/marketing/Footer';
import { useGetAllPublicEventsQuery, EventData } from '@/lib/features/events/eventApiSlice';
import Header from '@/components/Header';

const EVENT_TYPES = ['All', 'WORKSHOP', 'SEMINAR', 'COMPETITION', 'MEETUP', 'CULTURAL', 'SPORTS', 'OTHER'];

const EVENT_TYPE_LABELS: Record<string, string> = {
    WORKSHOP: 'Workshop',
    SEMINAR: 'Seminar',
    COMPETITION: 'Competition',
    MEETUP: 'Meetup',
    CULTURAL: 'Cultural',
    SPORTS: 'Sports',
    OTHER: 'Other',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
    WORKSHOP: 'bg-blue-100 text-blue-700',
    SEMINAR: 'bg-purple-100 text-purple-700',
    COMPETITION: 'bg-red-100 text-red-700',
    MEETUP: 'bg-green-100 text-green-700',
    CULTURAL: 'bg-amber-100 text-amber-700',
    SPORTS: 'bg-teal-100 text-teal-700',
    OTHER: 'bg-slate-100 text-slate-600',
};

const STATUS_COLORS: Record<string, string> = {
    PUBLISHED: 'bg-green-500',
    ONGOING: 'bg-blue-500',
};

const BANNER_GRADIENTS = [
    'from-indigo-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-violet-500 to-purple-500',
];

function getTimeStatus(event: EventData): { label: string; color: string } {
    const now = new Date();
    const eventDate = new Date(event.event_date);
    const endDate = event.event_end_date ? new Date(event.event_end_date) : null;
    const deadline = event.registration_deadline ? new Date(event.registration_deadline) : null;

    if (event.status === 'ONGOING') return { label: 'Happening Now', color: 'text-blue-600 bg-blue-50' };
    if (deadline && now > deadline) return { label: 'Registration Closed', color: 'text-red-600 bg-red-50' };

    const diff = eventDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return { label: 'Today', color: 'text-emerald-600 bg-emerald-50' };
    if (days === 1) return { label: 'Tomorrow', color: 'text-emerald-600 bg-emerald-50' };
    if (days <= 7) return { label: `In ${days} days`, color: 'text-amber-600 bg-amber-50' };
    return { label: `In ${days} days`, color: 'text-slate-600 bg-slate-50' };
}

export default function EventsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const { data, isLoading } = useGetAllPublicEventsQuery({
        search: searchQuery || undefined,
        type: selectedType !== 'All' ? selectedType : undefined,
        limit: 50,
    });

    const events = data?.events || [];

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            {/* Header */}
            <div className="bg-white pt-24 pb-6 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-3xl font-bold text-gray-900">Events</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Discover and register for upcoming events across all societies
                    </p>
                </div>
            </div>

            <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex items-start gap-8">
                {/* Sidebar Filters (Desktop) */}
                <aside className="hidden lg:block w-64 sticky top-28 space-y-8">
                    {/* Search */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Search</h3>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Find events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-10 pl-9 pr-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Event Type Filter */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Event Type</h3>
                        <div className="space-y-1">
                            {EVENT_TYPES.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`
                                        w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center
                                        ${selectedType === type
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                                    `}
                                >
                                    <span>{type === 'All' ? 'All Types' : EVENT_TYPE_LABELS[type]}</span>
                                    {selectedType === type && (
                                        <motion.div layoutId="activeEventDot" className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-indigo-50 rounded-xl p-4">
                        <p className="text-sm font-semibold text-indigo-700">{events.length} events found</p>
                        <p className="text-xs text-indigo-500 mt-0.5">
                            {events.filter(e => e.status === 'ONGOING').length} happening now
                        </p>
                    </div>
                </aside>

                {/* Mobile Filter Toggle */}
                <div className="lg:hidden w-full mb-6">
                    <button
                        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
                    >
                        <span className="flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Filters & Search
                        </span>
                        {mobileFiltersOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>

                    {mobileFiltersOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-2 bg-white border border-gray-200 rounded-lg p-4 space-y-6 overflow-hidden"
                        >
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Search</h4>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Find events..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Event Type</h4>
                                <div className="flex flex-wrap gap-2">
                                    {EVENT_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className={`
                                                px-3 py-1.5 rounded-full text-xs font-medium border
                                                ${selectedType === type
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'bg-white text-gray-600 border-gray-200'}
                                            `}
                                        >
                                            {type === 'All' ? 'All Types' : EVENT_TYPE_LABELS[type]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Results Grid */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 min-h-[400px]">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                            <p className="text-gray-500 font-medium">Loading events...</p>
                        </div>
                    ) : events.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {events.map((event, index) => (
                                    <EventCard key={event._id} event={event} index={index} />
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 min-h-[400px]">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Calendar className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No events found</h3>
                            <p className="text-gray-500 text-sm max-w-xs text-center mb-6">
                                No upcoming events match your filters right now.
                            </p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedType('All'); }}
                                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}

function EventCard({ event, index }: { event: EventData; index: number }) {
    const society = typeof event.society_id === 'object' ? event.society_id : null;
    const timeStatus = getTimeStatus(event);
    const gradient = BANNER_GRADIENTS[index % BANNER_GRADIENTS.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Link href={`/events/${event._id}`}>
                <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 h-full flex flex-col">
                    {/* Banner */}
                    <div className="relative h-44 overflow-hidden">
                        {event.banner ? (
                            <img
                                src={event.banner}
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                                <Calendar className="w-12 h-12 text-white/40" />
                            </div>
                        )}

                        {/* Status dot */}
                        <div className="absolute top-3 left-3">
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${timeStatus.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[event.status] || 'bg-gray-400'}`} />
                                {timeStatus.label}
                            </div>
                        </div>

                        {/* Event Type Badge */}
                        <div className="absolute top-3 right-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.OTHER}`}>
                                {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                        {/* Society Name */}
                        {society && (
                            <div className="flex items-center gap-2 mb-2">
                                {society.logo ? (
                                    <img src={society.logo} alt={society.name} className="w-5 h-5 rounded-full object-cover" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-indigo-600">{society.name.charAt(0)}</span>
                                    </div>
                                )}
                                <span className="text-xs font-medium text-gray-500 truncate">{society.name}</span>
                            </div>
                        )}

                        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {event.title}
                        </h3>

                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                            {event.description}
                        </p>

                        {/* Meta */}
                        <div className="space-y-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                                <span className="truncate">
                                    {new Date(event.event_date).toLocaleDateString('en-US', {
                                        weekday: 'short', month: 'short', day: 'numeric',
                                    })}
                                    {event.event_end_date && ` — ${new Date(event.event_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                <span className="truncate">{event.venue}</span>
                            </div>
                            {event.max_participants && (
                                <div className="flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                    <span>Max {event.max_participants} participants</span>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-50">
                                {event.tags.slice(0, 3).map((tag, idx) => (
                                    <span key={idx} className="text-[11px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                                {event.tags.length > 3 && (
                                    <span className="text-[11px] text-gray-400">+{event.tags.length - 3} more</span>
                                )}
                            </div>
                        )}

                        {/* CTA */}
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                                View Details
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
