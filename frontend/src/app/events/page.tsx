"use client";

import { useState } from 'react';
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useGetAllPublicEventsQuery, EventData } from "@/lib/features/events/eventApiSlice";
import { FaMapMarkerAlt, FaSearch, FaFilter, FaArrowRight, FaUsers } from 'react-icons/fa';
import { Search, Filter, Loader2, X, Menu, DoorOpen, DoorClosed } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from "@/components/marketing/Footer";

const EVENT_TYPES = [
    { value: 'ALL', label: 'All Types' },
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'SEMINAR', label: 'Seminar' },
    { value: 'COMPETITION', label: 'Competition' },
    { value: 'MEETUP', label: 'Meetup' },
    { value: 'CULTURAL', label: 'Cultural' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'OTHER', label: 'Other' },
];

export default function EventsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');
    const [page, setPage] = useState(1);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const { data, isLoading } = useGetAllPublicEventsQuery({
        search: searchTerm,
        type: selectedType === 'ALL' ? undefined : selectedType,
        page,
        limit: 12
    });

    return (
        <div className="min-h-screen bg-[#fffdfa] flex flex-col font-[family-name:var(--font-family-poppins)]">
            <Header />

            <div className="bg-stone-50 pt-24 pb-6 border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-3xl font-bold text-stone-900">
                        Events Discovery
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">
                        Explore {data?.events?.length || 0} upcoming activities
                    </p>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col lg:flex-row items-start gap-8">
                <aside className="hidden lg:block w-64 sticky top-28 space-y-8">
                    <div>
                        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">Search</h3>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-orange-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Find events..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 pl-9 pr-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 placeholder-stone-500 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">Event Types</h3>
                        <div className="space-y-1">
                            {EVENT_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setSelectedType(type.value)}
                                    className={`
                                        w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center group
                                        ${selectedType === type.value 
                                            ? "bg-orange-50 text-orange-700" 
                                            : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"}
                                    `}
                                >
                                    <span>{type.label}</span>
                                    {selectedType === type.value && (
                                        <motion.div layoutId="activeTypeDot" className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                <div className="lg:hidden w-full mb-6 relative z-20">
                    <button 
                        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-700"
                    >
                        <span className="flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Filters
                        </span>
                        {mobileFiltersOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                    
                    {mobileFiltersOpen && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="mt-2 bg-white border border-stone-200 rounded-lg p-4 space-y-6 overflow-hidden absolute w-full shadow-lg"
                        >
                             <div>
                                <h4 className="text-xs font-bold text-stone-500 uppercase mb-2">Search</h4>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                    <input
                                        type="text"
                                        placeholder="Find events..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-10 pl-9 pr-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>
                             <div>
                                <h4 className="text-xs font-bold text-stone-500 uppercase mb-2">Event Types</h4>
                                <div className="flex flex-wrap gap-2">
                                    {EVENT_TYPES.map((type) => (
                                        <button
                                            key={type.value}
                                            onClick={() => setSelectedType(type.value)}
                                            className={`
                                                px-3 py-1.5 rounded-full text-xs font-medium border
                                                ${selectedType === type.value 
                                                    ? "bg-orange-600 text-white border-orange-600" 
                                                    : "bg-white text-stone-600 border-stone-200"}
                                            `}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="flex-1 w-full">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-stone-100 min-h-[400px]">
                            <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
                            <p className="text-stone-500 font-medium">Loading events...</p>
                        </div>
                    ) : !data?.events || data.events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-stone-100 min-h-[400px]">
                            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-stone-300" />
                            </div>
                            <h3 className="text-lg font-bold text-stone-900 mb-2">No events found</h3>
                            <p className="text-stone-500 text-sm max-w-xs text-center">
                                We couldn't find anything matching your search.
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {data.events.map((event: EventData) => (
                                <Link 
                                    href={`/events/${event._id}`} 
                                    key={event._id}
                                    className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                                >
                                    <div className="h-48 relative overflow-hidden bg-stone-100">
                                        {event.banner ? (
                                            <Image
                                                src={event.banner}
                                                alt={event.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                                                <span className="text-4xl">📅</span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-stone-900 text-xs font-bold rounded-lg uppercase tracking-wide shadow-sm">
                                                {event.event_type}
                                            </span>
                                            {(() => {
                                                const now = new Date();
                                                const startDate = event.registration_start_date ? new Date(event.registration_start_date) : null;
                                                const endDate = event.registration_deadline ? new Date(event.registration_deadline) : null;
                                                
                                                const isNotStarted = startDate && now < startDate;
                                                const isEnded = endDate && now > endDate;
                                                const isOpen = !isNotStarted && !isEnded;

                                                if (isOpen) {
                                                    return (
                                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold rounded-lg uppercase tracking-wide shadow-sm">
                                                            <DoorOpen className="w-3.5 h-3.5" />
                                                            Open
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/90 backdrop-blur-md text-white text-xs font-bold rounded-lg uppercase tracking-wide shadow-sm">
                                                        <DoorClosed className="w-3.5 h-3.5" />
                                                        Closed
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col">
                                                <span className="text-orange-600 font-bold text-sm mb-1">
                                                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <h3 className="text-xl font-bold text-stone-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                                    {event.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <p className="text-stone-500 text-sm line-clamp-2 mb-4 flex-grow">
                                            {event.description}
                                        </p>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-stone-500">
                                                <FaMapMarkerAlt className="text-stone-400" />
                                                <span className="truncate">{event.venue}</span>
                                            </div>
                                            {typeof event.society_id === 'object' && (
                                                <div className="flex items-center gap-2 text-sm text-stone-500">
                                                    <FaUsers className="text-stone-400" />
                                                    <span className="truncate">By {event.society_id.name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                                            <span className="text-sm font-medium text-stone-900">
                                                View Details
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                                <FaArrowRight className="text-xs" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {data?.pagination && data.pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-8 gap-2">
                             <button 
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 border border-stone-200 rounded-lg text-sm font-medium text-stone-600 disabled:opacity-50 hover:bg-stone-50 transition-colors"
                             >
                                Previous
                             </button>
                             <span className="px-4 py-2 bg-orange-50 text-orange-600 font-medium rounded-lg text-sm flex items-center">
                                Page {page} of {data.pagination.totalPages}
                             </span>
                             <button
                                disabled={page === data.pagination.totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 border border-stone-200 rounded-lg text-sm font-medium text-stone-600 disabled:opacity-50 hover:bg-stone-50 transition-colors"
                             >
                                Next
                             </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
