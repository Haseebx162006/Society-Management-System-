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
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <div className="text-center py-12 bg-stone-50 rounded-3xl border border-stone-200">
                <p className="text-stone-500 font-medium font-body">No upcoming events scheduled at the moment.</p>
            </div>
        );
    }

    const handleRegister = (eventId: string) => {
        router.push(`/events/${eventId}`);
    };

    return (
        <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold text-stone-900 mb-6 flex items-center gap-3">
                <span className="bg-orange-500 w-2 h-6 rounded-full inline-block"></span>
                Upcoming Events
            </h3>
            
            <div className="grid gap-6">
                {events.map((event) => (
                    <div 
                        key={event._id} 
                        className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 group"
                    >
                        <div className="flex flex-col md:flex-row">
                            {/* Banner Image */}
                            <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden bg-stone-100">
                                {event.banner ? (
                                    <Image 
                                        src={event.banner} 
                                        alt={event.title} 
                                        fill
                                        className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-linear-to-br from-orange-400 to-stone-700 flex items-center justify-center">
                                        <MdEvent className="text-white text-4xl opacity-30" />
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
                                        <h4 className="font-display text-xl font-bold text-stone-900 group-hover:text-orange-600 transition-colors">
                                            {event.title}
                                        </h4>
                                        <span className="px-3 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-stone-200">
                                            {EVENT_TYPES.find(t => t.value === event.event_type)?.label || event.event_type}
                                        </span>
                                    </div>
                                    
                                    <p className="font-body text-stone-600 mb-4 line-clamp-2 text-sm">{event.description}</p>
                                    
                                    <div className="flex flex-wrap gap-4 text-xs font-medium text-stone-500 mb-4">
                                        <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                                            <FaCalendarAlt className="text-orange-500" />
                                            <span>
                                                {new Date(event.event_date).toLocaleDateString('en-US', { 
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                                            <FaMapMarkerAlt className="text-orange-500" />
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
                                
                                <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center">
                                    <div className="flex flex-wrap gap-2">
                                        {event.tags.map((tag, i) => (
                                            <span key={i} className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">#{tag}</span>
                                        ))}
                                    </div>
                                    
                                    {/* Action Button */}
                                    {event.status === 'PUBLISHED' || event.status === 'ONGOING' ? (
                                        <button 
                                            onClick={() => handleRegister(event._id)}
                                            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-600/20 flex items-center gap-2 group"
                                        >
                                            View Details <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    ) : (
                                        <button disabled className="px-5 py-2 bg-stone-100 text-stone-400 text-xs font-bold rounded-xl cursor-not-allowed border border-stone-200">
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
