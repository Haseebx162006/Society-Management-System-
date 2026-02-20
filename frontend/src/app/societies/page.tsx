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
  [key: string]: unknown;
}

const GRADIENTS = [
  "from-blue-600 to-cyan-500",
  "from-purple-600 to-pink-500",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-green-600",
  "from-indigo-600 to-blue-700",
];

const CATEGORIES = ["All", "Technology", "Arts", "Engineering", "Sports", "Religious", "Social", "Others"];

export default function SocietiesPage() {
  const { data: societiesData, isLoading } = useGetAllSocietiesQuery({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredSocieties = useMemo(() => {
    if (!societiesData || !Array.isArray(societiesData)) return [];

    return societiesData
      .filter((s: SocietyData) => s.status === "ACTIVE")
      .map((s: SocietyData, index: number) => {
        const seed = s._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const members = (seed % 450) + 50;
        const events = (seed % 15) + 5;

        return {
          id: s._id,
          name: s.name,
          category: s.category || "General",
          description: s.description || "No description available.",
          stats: {
            members: `${members}+`,
            events: `${events}/yr`
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
        
        return matchesSearch && matchesCategory;
      });
  }, [societiesData, searchQuery, selectedCategory]);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header />


      <div className="bg-white pt-24 pb-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Societies Directory
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Explore {filteredSocieties.length} active communities
            </p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex items-start gap-8">
        

        <aside className="hidden lg:block w-64 sticky top-28 space-y-8">

            <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Search</h3>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Find societies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                    />
                </div>
            </div>


            <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Categories</h3>
                <div className="space-y-1">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`
                                w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center group
                                ${selectedCategory === cat 
                                    ? "bg-indigo-50 text-indigo-700" 
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
                            `}
                        >
                            <span>{cat}</span>
                            {selectedCategory === cat && (
                                <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </aside>


        <div className="lg:hidden w-full mb-6">
            <button 
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
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
                    className="mt-2 bg-white border border-gray-200 rounded-lg p-4 space-y-6 overflow-hidden"
                >
                     <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Search</h4>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Find societies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Categories</h4>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`
                                        px-3 py-1.5 rounded-full text-xs font-medium border
                                        ${selectedCategory === cat 
                                            ? "bg-indigo-600 text-white border-indigo-600" 
                                            : "bg-white text-gray-600 border-gray-200"}
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


        <div className="flex-1">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 min-h-[400px]">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Loading societies...</p>
                </div>
            ) : filteredSocieties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSocieties.map((society) => (
                        <div key={society.id} className="h-full">
                           <SocietyCard {...society} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 min-h-[400px]">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No societies found</h3>
                    <p className="text-gray-500 text-sm max-w-xs text-center mb-6">
                        We couldn&apos;t find anything matching your search.
                    </p>
                    <button 
                        onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
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
