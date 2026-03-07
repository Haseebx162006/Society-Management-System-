"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useGetAllPublicEventsQuery } from "@/lib/features/events/eventApiSlice";
import { Calendar, AlertCircle, CheckCircle2, ArrowRight, MapPin } from "lucide-react";

export default function SocietyHeadEventsPage() {
  const { data, isLoading, error } = useGetAllPublicEventsQuery({ limit: 100 });
  const events = data?.events || [];

  return (
    <div className="space-y-8 font-(--font-family-poppins)">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">System Events</h1>
        <p className="text-sm text-stone-500 mt-1">View all public events hosted by registered societies across campus.</p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <p className="font-bold">Failed to load events. Please try again later.</p>
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border text-stone-400 border-stone-200 border-dashed rounded-3xl p-12 text-center"
          >
            <CheckCircle2 className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="font-bold text-lg text-stone-900">No Events Found</p>
            <p className="text-sm mt-1">There are no upcoming or ongoing public events right now.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any, index: number) => {
               // Extract society name depending on whether society_id was populated as an object
               const sname = typeof event.society_id === 'object' && event.society_id?.name 
                 ? event.society_id.name 
                 : "Unknown Society";

               return (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden h-full"
                  >
                    {/* Event Banner */}
                    <div className="h-32 w-full bg-stone-100 flex items-center justify-center relative overflow-hidden">
                      {event.banner ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={event.banner} 
                          alt={event.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Calendar className="w-10 h-10 text-stone-300" />
                      )}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-stone-800 uppercase tracking-wider shadow-sm">
                        {event.event_type}
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="font-black text-lg text-stone-900 tracking-tight line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-xs font-semibold text-orange-600 mb-3">by {sname}</p>
                        
                        <div className="space-y-2 mb-4">
                           <div className="flex items-start gap-2 text-stone-500 text-xs font-medium">
                              <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                           </div>
                           <div className="flex items-start gap-2 text-stone-500 text-xs font-medium">
                              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{event.venue}</span>
                           </div>
                        </div>

                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
                          {event.description}
                        </p>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                             event.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600' :
                             event.status === 'ONGOING' ? 'bg-blue-50 text-blue-600' :
                             'bg-stone-100 text-stone-600'
                           }`}>
                             {event.status}
                           </span>
                        </div>
                        
                        <Link 
                          href={`/events/${event._id}`}
                          className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg"
                        >
                          View Details
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
               );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
