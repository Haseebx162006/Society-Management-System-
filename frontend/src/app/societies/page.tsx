"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Loader2, X, Menu } from "lucide-react";
import Footer from "@/components/marketing/Footer";
import SocietyCard from "@/components/society/SocietyCard";
import { useGetAllSocietiesQuery } from "@/lib/features/societies/societyApiSlice";
import Header from "@/components/Header";

interface SocietyData {
  _id: string;
  name: string;
  description: string;
  category?: string;
  status: string;
  logo?: string;
  membersCount?: number;
  registration_start_date?: string;
  registration_end_date?: string;
  [key: string]: unknown;
}

const GRADIENTS = [
  "from-orange-500 to-amber-500",
  "from-stone-600 to-stone-400",
  "from-orange-600 to-red-500",
  "from-amber-600 to-yellow-500",
  "from-stone-700 to-stone-500",
];

const CATEGORIES = ["All", "Technology", "Arts", "Engineering", "Sports", "Religious", "Social", "Others"];
const STATUS_OPTIONS = ["All", "Open", "Closed"];

export default function SocietiesPage() {
  const { data: societiesData, isLoading } = useGetAllSocietiesQuery({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredSocieties = useMemo(() => {
    if (!societiesData || !Array.isArray(societiesData)) return [];

    const now = new Date();

    return societiesData
      .filter((s: SocietyData) => s.status === "ACTIVE")
      .map((s: SocietyData, index: number) => {
        return {
          id: s._id,
          name: s.name,
          category: s.category || "General",
          description: s.description || "No description available.",
          stats: {
            members: `${s.membersCount || 0}`
          },
          image: s.logo,
          color: GRADIENTS[index % GRADIENTS.length],
          registration_start_date: s.registration_start_date as string | undefined,
          registration_end_date: s.registration_end_date as string | undefined,
        };
      })
      .filter((s) => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              s.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
        
        let matchesStatus = true;
        if (selectedStatus !== "All") {
             const startDate = s.registration_start_date ? new Date(s.registration_start_date) : null;
             const endDate = s.registration_end_date ? new Date(s.registration_end_date) : null;
             
             const isNotStarted = startDate && now < startDate;
             const isEnded = endDate && now > endDate;
             const isOpen = !isNotStarted && !isEnded && startDate && endDate; // Treat as Open if within dates. If no dates, you can decide logic. Let's say if no dates it's Closed or Open? Let's assume open if no dates exist or it's up to society. Actually standard is: if it has active dates its open.
             const isActuallyOpen = startDate && endDate ? (!isNotStarted && !isEnded) : false;

             if (selectedStatus === "Open") {
                 matchesStatus = isActuallyOpen;
             } else if (selectedStatus === "Closed") {
                 matchesStatus = !isActuallyOpen;
             }
        }

        return matchesSearch && matchesCategory && matchesStatus;
      });
  }, [societiesData, searchQuery, selectedCategory, selectedStatus]);

  return (
    <main className="min-h-screen bg-[#fffdfa] flex flex-col">
      <Header />


      <div className="bg-stone-50 pt-24 pb-6 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-3xl font-bold text-stone-900">
              Societies Directory
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Explore {filteredSocieties.length} active communities
            </p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col lg:flex-row items-start gap-8">
        

        <aside className="hidden lg:block w-64 sticky top-28 space-y-8">

            <div>
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">Search</h3>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-orange-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Find societies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 placeholder-stone-500 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
                    />
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">Registration</h3>
                <div className="space-y-1">
                    {STATUS_OPTIONS.map((status) => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`
                                w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center group
                                ${selectedStatus === status 
                                    ? "bg-orange-50 text-orange-700" 
                                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"}
                            `}
                        >
                            <span>{status}</span>
                            {selectedStatus === status && (
                                <motion.div layoutId="activeStatusDot" className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                            )}
                        </button>
                    ))}
                </div>
            </div>


            <div>
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">Categories</h3>
                <div className="space-y-1">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`
                                w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center group
                                ${selectedCategory === cat 
                                    ? "bg-orange-50 text-orange-700" 
                                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"}
                            `}
                        >
                            <span>{cat}</span>
                            {selectedCategory === cat && (
                                <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-orange-600" />
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
                                placeholder="Find societies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-10 pl-9 pr-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                            />
                        </div>
                    </div>
                     <div>
                        <h4 className="text-xs font-bold text-stone-500 uppercase mb-2">Registration Status</h4>
                        <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setSelectedStatus(status)}
                                    className={`
                                        px-3 py-1.5 rounded-full text-xs font-medium border
                                        ${selectedStatus === status 
                                            ? "bg-orange-600 text-white border-orange-600" 
                                            : "bg-white text-stone-600 border-stone-200"}
                                    `}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-stone-500 uppercase mb-2">Categories</h4>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`
                                        px-3 py-1.5 rounded-full text-xs font-medium border
                                        ${selectedCategory === cat 
                                            ? "bg-orange-600 text-white border-orange-600" 
                                            : "bg-white text-stone-600 border-stone-200"}
                                    `}
                                >
                                    {cat}
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
                    <p className="text-stone-500 font-medium">Loading societies...</p>
                </div>
            ) : filteredSocieties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSocieties.map((society) => (
                        <div key={society.id} className="h-full w-full">
                           <SocietyCard {...society} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-stone-100 min-h-[400px]">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-stone-300" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 mb-2">No societies found</h3>
                    <p className="text-stone-500 text-sm max-w-xs text-center mb-6">
                        We couldn&apos;t find anything matching your search.
                    </p>
                    <button 
                        onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setSelectedStatus("All"); }}
                        className="text-sm font-semibold text-orange-600 hover:text-orange-700"
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
