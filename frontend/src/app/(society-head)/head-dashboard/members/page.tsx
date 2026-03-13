"use client";

import { useState, useMemo } from "react";
import { useGetAllPlatformMembersQuery } from "@/lib/features/societies/societyApiSlice";
import { Search, AlertCircle, CheckCircle2, User as UserIcon, Building2, Filter, Mail, Phone, FileText, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as xlsx from "xlsx";

export default function SocietyHeadMembersPage() {
  const { data: members = [], isLoading, error } = useGetAllPlatformMembersQuery(undefined);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSociety, setSelectedSociety] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Derive unique societies for the filter dropdown
  const uniqueSocieties = useMemo(() => {
    const socs = new Set<string>();
    members.forEach((m: any) => {
      if (m.society_id?.name) {
        socs.add(m.society_id.name);
      }
    });
    return ["All", ...Array.from(socs)].sort();
  }, [members]);

  // Apply filters
  const filteredMembers = useMemo(() => {
    return members.filter((m: any) => {
      // Society filter
      const mSociety = m.society_id?.name || "Unknown Society";
      if (selectedSociety !== "All" && mSociety !== selectedSociety) {
        return false;
      }

      // Search query (Name, Email, Phone)
      const q = searchQuery.toLowerCase();
      if (q) {
        const name = (m.user_id?.name || "").toLowerCase();
        const email = (m.user_id?.email || "").toLowerCase();
        const phone = (m.user_id?.phone || "").toLowerCase();
        
        if (!name.includes(q) && !email.includes(q) && !phone.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [members, searchQuery, selectedSociety]);


  // Calculate pagination
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const currentMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- EXPORTS ---

  const generationTimestamp = new Date().toLocaleString();

  const downloadPDF = () => {
    const doc = new jsPDF();

    const img = new window.Image();
    img.src = "/logo.png";

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Comsats University Islamabad, Lahore", 200, 15, { align: "right" });

    try {
      doc.addImage(img, "PNG", 14, 10, 25, 25);
    } catch (e) {
      console.error("Logo failed to load", e);
    }

    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text("Society Members Directory", 14, 45);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${generationTimestamp}`, 14, 53);
    
    const tableData = filteredMembers.map((m: any, i: number) => [
      i + 1,
      m.user_id?.name || m.name || "Unknown",
      m.society_id?.name || "Unknown Society",
      m.role || "MEMBER",
      m.user_id?.email || "N/A",
      m.user_id?.phone || "N/A",
    ]);

    autoTable(doc, {
      startY: 61,
      head: [["#", "Name", "Society", "Role", "Email", "Phone"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [249, 115, 22] }, // orange-500
    });

    doc.save("Society_Members_Directory.pdf");
  };

  const downloadExcel = () => {
    const rowData = filteredMembers.map((m: any) => ({
      Name: m.user_id?.name || m.name || "Unknown",
      Society: m.society_id?.name || "Unknown Society",
      Role: m.role || "MEMBER",
      Email: m.user_id?.email || "N/A",
      Phone: m.user_id?.phone || "N/A",
    }));

    const worksheet = xlsx.utils.json_to_sheet(rowData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Members");

    // Auto-size columns roughly
    const wscols = [
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 35 },
      { wch: 15 },
    ];
    worksheet["!cols"] = wscols;

    xlsx.writeFile(workbook, "Society_Members_Directory.xlsx");
  };

  return (
    <div className="space-y-8 font-(--font-family-poppins)">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Members Directory</h1>
          <p className="text-sm text-stone-500 mt-1">Search, filter, and export active members across all societies in the campus.</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col xl:flex-row gap-3 w-full md:w-auto items-end">
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-2 xl:mb-0 xl:mr-4">
             <button 
                onClick={downloadPDF}
                disabled={filteredMembers.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Export PDF</span>
             </button>
             <button 
                onClick={downloadExcel}
                disabled={filteredMembers.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Export Excel</span>
             </button>
          </div>

          {/* Society Filter */}
          <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
             <select
               value={selectedSociety}
               onChange={(e) => {
                 setSelectedSociety(e.target.value);
                 setCurrentPage(1);
               }}
               className="w-full sm:w-48 pl-9 pr-8 py-2.5 appearance-none border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-stone-300 outline-hidden transition-all bg-white font-semibold text-stone-700 cursor-pointer"
             >
               {uniqueSocieties.map(soc => (
                 <option key={soc} value={soc}>{soc}</option>
               ))}
             </select>
             {/* Custom Chevron for Select */}
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 xl:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-hidden hover:border-stone-300 transition-all bg-white shadow-xs"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <p className="font-bold">Failed to load platform members. Please try again later.</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white border text-stone-400 border-stone-200 border-dashed rounded-3xl p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="font-bold text-lg text-stone-900">No Members Found</p>
            <p className="text-sm mt-1">Adjust your search or filter to see results.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentMembers.map((member: any, index: number) => {
                 const name = member.user_id?.name || member.name || "Unknown";
               const email = member.user_id?.email || "No Email";
               const phone = member.user_id?.phone || "No Phone";
               const societyName = member.society_id?.name || "Unknown Society";
               const role = member.role;

               return (
                  <div
                    key={member._id}
                    className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 hover:shadow-md hover:border-stone-300 transition-all group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200">
                        <UserIcon className="w-6 h-6 text-stone-400 group-hover:text-orange-500 transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-stone-900 truncate" title={name}>{name}</h3>
                        <div className="inline-flex mt-1 px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 text-[10px] font-bold tracking-widest uppercase">
                          {role}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-4 border-t border-stone-100">
                      <div className="flex items-center gap-2.5 text-xs text-stone-600">
                        <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate font-medium">{societyName}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-stone-600">
                        <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{email}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-stone-600">
                        <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{phone}</span>
                      </div>
                    </div>
                  </div>
               );
            })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-stone-200 pt-6 px-4">
                <span className="text-sm text-stone-500 font-medium">
                  Showing <span className="text-stone-900 font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-stone-900 font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)}</span> of <span className="text-stone-900 font-bold">{filteredMembers.length}</span> members
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-stone-600"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                     {Array.from({ length: totalPages }).map((_, i) => (
                       <button
                         key={i}
                         onClick={() => setCurrentPage(i + 1)}
                         className={`w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-colors ${
                           currentPage === i + 1 
                             ? "bg-orange-600 text-white shadow-md shadow-orange-500/20" 
                             : "text-stone-600 hover:bg-stone-100"
                         }`}
                       >
                         {i + 1}
                       </button>
                     ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-stone-600"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
