"use client";

import { useState } from "react";
import { useGetSocietyRequestsQuery, useUpdateSocietyRequestStatusMutation } from "@/lib/features/societies/societyApiSlice";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Clock } from "lucide-react";
import toast from "react-hot-toast";

import { Search } from "lucide-react";

export default function ManageRenewalsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allRequests = [], isLoading, error } = useGetSocietyRequestsQuery(undefined);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateSocietyRequestStatusMutation();

  const handleStatusUpdate = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    let rejectionReason = "No reason provided.";
    if (newStatus === "REJECTED") {
      const reason = window.prompt("Please provide a reason for rejecting this renewal:");
      if (reason === null) return; // User cancelled
      rejectionReason = reason;
    }

    try {
      await updateStatus({
        id,
        status: newStatus,
        rejection_reason: newStatus === "REJECTED" ? rejectionReason : undefined
      }).unwrap();
      
      toast.success(`Renewal successfully ${newStatus.toLowerCase()}`);
      setExpandedId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to ${newStatus.toLowerCase()} renewal`);
    }
  };

  const filteredRequests = allRequests.filter((r: any) => 
    r.request_type === "RENEWAL" && 
    r.society_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    console.error("Fetch renewals error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
        <AlertCircle className="w-6 h-6" />
        <p className="font-bold">Failed to load renewals. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-(--font-family-poppins)">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Manage Renewals</h1>
          <p className="text-sm text-stone-500 mt-1">Review and manage society renewal applications.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search society by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-hidden transition-all bg-white"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-20 px-6 border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50">
            <CheckCircle2 className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-stone-900">All Caught Up!</h3>
            <p className="text-stone-500 text-sm mt-1">There are no renewal requests right now.</p>
          </div>
        ) : (
          filteredRequests.map((req: any) => (
            <div key={req._id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md">
              
              {/* Card Header (Always Visible) */}
              <div 
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-stone-50 transition-colors"
                onClick={() => setExpandedId(expandedId === req._id ? null : req._id)}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-stone-900">{req.society_name}</h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-stone-500 flex items-center gap-2">
                    Submitted by <strong className="text-stone-800">{req.user_id?.name || "Unknown Faculty"}</strong>
                  </p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Date Submitted</p>
                    <p className="text-sm font-semibold text-stone-700 flex items-center justify-end gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(req.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-stone-500">
                    {expandedId === req._id ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                  </div>
                </div>
              </div>

              {/* Expansion Details */}
              {expandedId === req._id && (
                <div className="border-t border-stone-100 p-0 sm:p-6 bg-stone-50/50">
                  <div className="bg-white m-4 sm:m-0 p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-10">
                    
                    {/* Header */}
                    <div>
                      <h4 className="text-xl font-black text-stone-900">{req.society_name}</h4>
                      <p className="text-sm text-stone-500 mt-1">
                        Society Renewal Application
                      </p>
                    </div>

                    {/* ===================== RENEWAL FORM DATA ===================== */}
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="space-y-4">
                           <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">President</h5>
                           <div className="space-y-1 text-sm bg-stone-50 p-4 rounded-xl border border-stone-100">
                              <p className="font-bold text-stone-900">{req.form_data?.exec_council?.president?.name}</p>
                              <p className="text-stone-500">{req.form_data?.exec_council?.president?.reg_no}</p>
                           </div>
                         </div>
                         <div className="space-y-4">
                           <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Gen. Secretary</h5>
                           <div className="space-y-1 text-sm bg-stone-50 p-4 rounded-xl border border-stone-100">
                              <p className="font-bold text-stone-900">{req.form_data?.exec_council?.gen_sec?.name}</p>
                              <p className="text-stone-500">{req.form_data?.exec_council?.gen_sec?.reg_no}</p>
                           </div>
                         </div>
                         <div className="space-y-4">
                           <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Treasurer</h5>
                           <div className="space-y-1 text-sm bg-stone-50 p-4 rounded-xl border border-stone-100">
                              <p className="font-bold text-stone-900">{req.form_data?.exec_council?.treasurer?.name}</p>
                              <p className="text-stone-500">{req.form_data?.exec_council?.treasurer?.reg_no}</p>
                           </div>
                         </div>
                      </div>

                      {req.form_data?.exec_council_elect?.filter((m: any) => m.name).length > 0 && (
                        <div className="space-y-4">
                          <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Executive Council - Elect (Min 15)</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                             {req.form_data.exec_council_elect.filter((m: any) => m.name).map((b: any, i: number) => (
                               <div key={i} className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-sm">
                                  <p className="font-bold text-stone-900">{b.name}</p>
                                  <p className="text-stone-500 text-xs mt-0.5">{b.reg_no}</p>
                               </div>
                             ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-6">
                         <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Calendar of Events</h5>
                         <div>
                           <p className="text-sm font-bold text-stone-800 mb-2">Strategy & Management</p>
                           <p className="text-sm text-stone-600 bg-stone-50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-stone-100">{req.form_data?.calendar_events?.description}</p>
                         </div>

                         {req.form_data?.calendar_events?.events?.length > 0 && (
                           <div>
                             <p className="text-sm font-bold text-stone-800 mb-3">Proposed Events</p>
                             <ul className="space-y-2">
                               {req.form_data.calendar_events.events.filter((e: string) => e?.trim()).map((ev: string, i: number) => (
                                 <li key={i} className="flex gap-3 text-sm items-start">
                                   <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 font-bold text-xs">{i+1}</span>
                                   <span className="text-stone-700 pt-0.5">{ev}</span>
                                 </li>
                               ))}
                             </ul>
                           </div>
                         )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-stone-100">
                         <div className="space-y-1">
                           <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Faculty Advisor</p>
                           <p className="text-sm font-semibold text-stone-900">{req.form_data?.faculty_advisor || "Not provided"}</p>
                         </div>
                         <div className="space-y-1">
                           <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Email Address</p>
                           <p className="text-sm font-semibold text-stone-900">{req.form_data?.email || "Not provided"}</p>
                         </div>
                         <div className="space-y-1">
                           <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Website</p>
                           <p className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer">{req.form_data?.website || "None"}</p>
                         </div>
                      </div>

                      <div className="space-y-2 pt-6 border-t border-stone-100">
                           <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Functions of Society</p>
                           <p className="text-sm text-stone-600 bg-stone-50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-stone-100">{req.form_data?.functions}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {req.status === 'PENDING' ? (
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6 p-4 sm:p-6 sm:pt-0">
                      <button 
                        onClick={() => handleStatusUpdate(req._id, "REJECTED")}
                        disabled={isUpdating}
                        className="w-full sm:w-auto px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors text-sm border border-red-100 disabled:opacity-50"
                      >
                        {isUpdating && expandedId === req._id ? "Rejecting..." : "Reject Renewal"}
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(req._id, "APPROVED")}
                        disabled={isUpdating}
                        className="w-full sm:w-auto px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-md transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {isUpdating && expandedId === req._id ? "Approving..." : "Approve Renewal"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end mt-6 p-4 sm:p-6 sm:pt-0">
                      <div className={`px-6 py-3 rounded-xl font-bold text-sm border ${
                        req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        Renewal {req.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
