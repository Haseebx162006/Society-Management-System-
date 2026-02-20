import Link from "next/link";
import { ArrowRight, Users, DoorOpen, DoorClosed } from "lucide-react";
import { motion } from "framer-motion";

interface SocietyCardProps {
  id: string;
  name: string;
  description: string;
  category?: string;
  stats?: {
    members: string;
  };
  image?: string;
  color?: string;
  registration_start_date?: string;
  registration_end_date?: string;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2070";

export default function SocietyCard({
  id,
  name,
  description,
  category = "General",
  stats = { members: "0" },
  image = DEFAULT_IMAGE,
  color = "from-indigo-600 to-blue-700",
  registration_start_date,
  registration_end_date,
}: SocietyCardProps) {
  const now = new Date();
  const startDate = registration_start_date ? new Date(registration_start_date) : null;
  const endDate = registration_end_date ? new Date(registration_end_date) : null;
  
  const isNotStarted = startDate && now < startDate;
  const isEnded = endDate && now > endDate;
  const isOpen = !isNotStarted && !isEnded && (startDate || endDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-gray-900/60 to-transparent" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wider bg-white/20 backdrop-blur-md rounded-full border border-white/30 w-fit">
                {category}
            </span>
            {isOpen && (
                <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-100 uppercase tracking-wider bg-emerald-500/80 backdrop-blur-md rounded-full w-fit">
                    <DoorOpen className="w-3 h-3" />
                    Open
                </span>
            )}
            {!isOpen && (startDate || endDate) && (
                <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-rose-100 uppercase tracking-wider bg-rose-500/80 backdrop-blur-md rounded-full w-fit">
                    <DoorClosed className="w-3 h-3" />
                    Closed
                </span>
            )}
        </div>
      </div>

      <div className="p-6 flex flex-col grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {name}
        </h3>
        <p className="text-gray-600 text-base mb-6 line-clamp-2 grow">
          {description}
        </p>

        <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
             <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>{stats.members} Member{stats.members !== "1" ? "s" : ""}</span>
             </div>
        </div>

        <Link
          href={`/societies/${id}`}
          className={`mt-auto w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300
            bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:border-indigo-200 group-hover:text-indigo-600
          `}
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

       <div className={`h-1 w-full bg-linear-to-r ${color}`} />
    </motion.div>
  );
}
