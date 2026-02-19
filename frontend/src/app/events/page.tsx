"use client";

import { useState } from 'react';
import Header from "@/components/Header";
import { useGetAllPublicEventsQuery, EventData } from "@/lib/features/events/eventApiSlice";
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch, FaFilter, FaArrowRight, FaUsers } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

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

    const { data, isLoading } = useGetAllPublicEventsQuery({
        search: searchTerm,
        type: selectedType === 'ALL' ? undefined : selectedType,
        page,
        limit: 12
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-[family-name:var(--font-family-poppins)]">
            <Header />

            <main className="flex-grow pt-28 pb-12 px-6">
                <div className="max-w-[1400px] mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Discover Events
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Explore workshops, seminars, and competitions happening around you.
                            </p>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-12 pl-11 pr-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                            />
                        </div>
                        <div className="relative md:w-64">
                            <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full h-12 pl-11 pr-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none appearance-none"
                            >
                                {EVENT_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Events Grid */}
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                        </div>
                    ) : !data?.events || data.events.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
                                📅
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
                            <p className="text-gray-500">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.events.map((event: EventData) => (
                                <Link 
                                    href={`/events/${event._id}`} 
                                    key={event._id}
                                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                                >
                                    <div className="h-48 relative overflow-hidden bg-gray-100">
                                        {event.banner ? (
                                            <Image
                                                src={event.banner}
                                                alt={event.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                <span className="text-4xl">📅</span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-bold rounded-lg uppercase tracking-wide shadow-sm">
                                                {event.event_type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col">
                                                <span className="text-indigo-600 font-bold text-sm mb-1">
                                                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                    {event.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
                                            {event.description}
                                        </p>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <FaMapMarkerAlt className="text-gray-400" />
                                                <span className="truncate">{event.venue}</span>
                                            </div>
                                            {typeof event.society_id === 'object' && (
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <FaUsers className="text-gray-400" />
                                                    <span className="truncate">By {event.society_id.name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900">
                                                View Details
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                <FaArrowRight className="text-xs" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    
                    {/* Pagination - Simplified for MVP */}
                    {data?.pagination && data.pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-8 gap-2">
                             <button 
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                             >
                                Previous
                             </button>
                             <span className="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-lg">
                                Page {page} of {data.pagination.totalPages}
                             </span>
                             <button
                                disabled={page === data.pagination.totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                             >
                                Next
                             </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
