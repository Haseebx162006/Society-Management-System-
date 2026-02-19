import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
    FaCalendarAlt, 
    FaMapMarkerAlt, 
    FaUsers, 
    FaArrowRight, 
    FaLock,
    FaGlobe
} from 'react-icons/fa';
import { MdEvent } from 'react-icons/md';
import { Loader2 } from 'lucide-react';
import { 
    useGetEventsBySocietyQuery, 
    useGetPublicEventsBySocietyQuery
} from '@/lib/features/events/eventApiSlice';

interface SocietyEventsSectionProps {
    societyId: string;
    isMember: boolean;
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

const SocietyEventsSection: React.FC<SocietyEventsSectionProps> = ({ societyId, isMember }) => {
    const router = useRouter();

    const { data: memberEvents, isLoading: memberLoading } = useGetEventsBySocietyQuery(societyId, {
        skip: !isMember
    });

    const { data: publicEvents, isLoading: publicLoading } = useGetPublicEventsBySocietyQuery(societyId, {
        skip: isMember
    });

    const events = isMember ? memberEvents : publicEvents;
    const isLoading = isMember ? memberLoading : publicLoading;

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-500 font-medium">No upcoming events scheduled at the moment.</p>
            </div>
        );
    }

    const handleRegister = (eventId: string) => {
        router.push(`/events/${eventId}`);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                Upcoming Events
                <div className="h-1 w-20 bg-indigo-600 rounded-full" />
            </h3>
            
            <div className="grid gap-6">
                {events.map((event) => (
                    <div 
                        key={event._id} 
                        className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
                    >
                        <div className="flex flex-col md:flex-row">
                            {/* Banner Image */}
                            <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                                {event.banner ? (
                                    <Image 
                                        src={event.banner} 
                                        alt={event.title} 
                                        fill
                                        className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <MdEvent className="text-white text-4xl opacity-50" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm flex items-center gap-1 ${
                                        event.is_public ? 'bg-green-500' : 'bg-amber-500'
                                    }`}>
                                        {event.is_public ? <FaGlobe /> : <FaLock />}
                                        {event.is_public ? 'Public' : 'Members Only'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {event.title}
                                        </h4>
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg uppercase tracking-wide">
                                            {EVENT_TYPES.find(t => t.value === event.event_type)?.label || event.event_type}
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                                    
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className="text-indigo-400" />
                                            <span>
                                                {new Date(event.event_date).toLocaleDateString('en-US', { 
                                                    month: 'short', day: 'numeric', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-red-400" />
                                            <span>{event.venue}</span>
                                        </div>
                                        {event.max_participants && (
                                            <div className="flex items-center gap-2">
                                                <FaUsers className="text-green-400" />
                                                <span>Limit: {event.max_participants}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <div className="flex gap-2">
                                        {event.tags.map((tag, i) => (
                                            <span key={i} className="text-xs text-gray-400">#{tag}</span>
                                        ))}
                                    </div>
                                    
                                    {/* Action Button */}
                                    {event.status === 'PUBLISHED' || event.status === 'ONGOING' ? (
                                        <button 
                                            onClick={() => handleRegister(event._id)}
                                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                                        >
                                            View Details <FaArrowRight />
                                        </button>
                                    ) : (
                                        <button disabled className="px-5 py-2 bg-gray-100 text-gray-400 text-sm font-bold rounded-xl cursor-not-allowed">
                                            {event.status === 'COMPLETED' ? 'Ended' : 'Closed'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SocietyEventsSection;
