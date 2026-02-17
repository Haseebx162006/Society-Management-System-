import Link from "next/link";
import { ArrowRight, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface SocietyCardProps {
  id: string;
  name: string;
  description: string;
  category?: string;
  stats?: {
    members: string;
    events: string;
  };
  image?: string;
  color?: string; // Gradient class
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2070";

export default function SocietyCard({
  id,
  name,
  description,
  category = "General",
  stats = { members: "50+", events: "5/yr" },
  image = DEFAULT_IMAGE,
  color = "from-indigo-600 to-blue-700",
}: SocietyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* Image Header */}
      <div className="relative h-48 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-gray-900/60 to-transparent" />
        
        <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wider bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                {category}
            </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {name}
        </h3>
        <p className="text-gray-600 text-base mb-6 line-clamp-2 grow">
          {description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
             <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>{stats.members}</span>
             </div>
             <div className="w-px h-4 bg-gray-300" />
             <div className="flex items-center gap-1.5">
                 <Calendar className="w-4 h-4 text-indigo-500" />
                 <span>{stats.events}</span>
             </div>
        </div>

        {/* Action */}
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

       {/* Decorative gradient line at bottom */}
       <div className={`h-1 w-full bg-linear-to-r ${color}`} />
    </motion.div>
  );
}
