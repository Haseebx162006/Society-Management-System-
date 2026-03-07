"use client";

import { useState } from "react";
import { useGetSocietyRequestsQuery, useUpdateSocietyRequestStatusMutation, useLazyCompareSocietyRequestQuery } from "@/lib/features/societies/societyApiSlice";
import { FileText, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Clock, BarChart3, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import ComparisonReport from "@/components/society/ComparisonReport";
import { motion, AnimatePresence } from "framer-motion";

import { Search } from "lucide-react";

function RejectModal({ onClose, onConfirm, isLoading }: { onClose: () => void; onConfirm: (reason: string) => void; isLoading: boolean }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 border border-red-100 mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h2 className="text-2xl font-black text-stone-900 text-center tracking-tight mb-2">Reject Request</h2>
        <p className="text-sm text-stone-500 text-center mb-6 leading-relaxed">
          Please provide a reason for rejecting this request. This reason will be visible to the society faculty advisor.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter rejection reason..."
          className="w-full p-4 mb-6 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm min-h-[100px]"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isLoading || !reason.trim()}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? "Rejecting..." : "Confirm Rejection"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ManageRequestsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [comparisonRequestId, setComparisonRequestId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { data: allRequests = [], isLoading, error } = useGetSocietyRequestsQuery(undefined);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateSocietyRequestStatusMutation();
  const [triggerCompare, { data: comparisonData, isFetching: isComparing, error: comparisonError }] = useLazyCompareSocietyRequestQuery();

  const handleStatusUpdate = async (id: string, newStatus: "APPROVED" | "REJECTED", reason?: string) => {
    try {
      await updateStatus({
        id,
        status: newStatus,
        rejection_reason: newStatus === "REJECTED" ? reason : undefined
      }).unwrap();
      
      toast.success(`Request successfully ${newStatus.toLowerCase()}`);
      // Collapse after action
      setExpandedId(null);
      setRejectingId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to ${newStatus.toLowerCase()} request`);
    }
  };

  const handleCompare = async (requestId: string) => {
    setComparisonRequestId(requestId);
    try {
      await triggerCompare(requestId).unwrap();
    } catch {
      // Error is handled by the ComparisonReport component via comparisonError
    }
  };

  const filteredRequests = allRequests.filter((r: any) => 
    r.request_type === "REGISTER" && 
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
    console.error("Fetch pending requests error:", error);
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
        <AlertCircle className="w-6 h-6" />
        <p className="font-bold">Failed to load pending requests. Please try again later.</p>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {rejectingId && (
          <RejectModal
            onClose={() => setRejectingId(null)}
            onConfirm={(reason) => handleStatusUpdate(rejectingId, "REJECTED", reason)}
            isLoading={isUpdating}
          />
        )}
      </AnimatePresence>

      <div className="space-y-8 font-(--font-family-poppins)">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Manage Registrations</h1>
          <p className="text-sm text-stone-500 mt-1">Review and manage new society registration applications.</p>
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
            <p className="text-stone-500 text-sm mt-1">There are no registration requests right now.</p>
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
                
                <div className="flex items-center gap-3">
                  {req.status === 'PENDING' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCompare(req._id); }}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl transition-colors text-sm border border-blue-200 shrink-0"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Compare
                    </button>
                  )}
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
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-black text-stone-900">{req.society_name}</h4>
                        <p className="text-sm text-stone-500 mt-1">New Society Registration Request</p>
                      </div>
                      {req.status === 'PENDING' && (
                        <button
                          onClick={() => handleCompare(req._id)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md shadow-blue-500/20 shrink-0"
                        >
                          <BarChart3 className="w-4 h-4" />
                          AI Comparison Report
                        </button>
                      )}
                    </div>

                    {/* ===================== REVIEW FORM DATA ===================== */
                      /* ===================== REVIEW FORM DATA ===================== */
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-4">
                             <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Current President</h5>
                             <div className="space-y-2 text-sm">
                                <p><span className="text-stone-500 w-24 inline-block">Name:</span> <strong className="text-stone-900">{req.form_data?.current_president?.name}</strong></p>
                                <p><span className="text-stone-500 w-24 inline-block">Reg No:</span> <strong className="text-stone-900">{req.form_data?.current_president?.reg_no}</strong></p>
                                <p><span className="text-stone-500 w-24 inline-block">Phone:</span> <strong className="text-stone-900">{req.form_data?.current_president?.phone}</strong></p>
                                <p><span className="text-stone-500 w-24 inline-block">Email:</span> <strong className="text-stone-900">{req.form_data?.current_president?.email}</strong></p>
                             </div>
                           </div>
                           
                           {req.form_data?.past_president?.name && (
                             <div className="space-y-4">
                               <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Past President</h5>
                               <div className="space-y-2 text-sm">
                                  <p><span className="text-stone-500 w-24 inline-block">Name:</span> <strong className="text-stone-900">{req.form_data.past_president.name}</strong></p>
                                  <p><span className="text-stone-500 w-24 inline-block">Reg No:</span> <strong className="text-stone-900">{req.form_data.past_president.reg_no}</strong></p>
                               </div>
                             </div>
                           )}
                        </div>

                        {req.form_data?.other_office_bearers?.length > 0 && (
                          <div className="space-y-4">
                            <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Other Office Bearers</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                               {req.form_data.other_office_bearers.map((b: any, i: number) => (
                                 <div key={i} className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-sm">
                                    <p className="font-bold text-stone-900">{b.name}</p>
                                    <p className="text-stone-500 text-xs mt-0.5">{b.reg_no}</p>
                                 </div>
                               ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-4">
                           <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">Faculty Advisor</h5>
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm bg-orange-50/50 p-4 rounded-xl border border-orange-100/50">
                              <div><p className="text-orange-900/50 font-bold mb-1">Name</p><p className="font-semibold text-orange-950">{req.form_data?.faculty_advisor?.name}</p></div>
                              <div><p className="text-orange-900/50 font-bold mb-1">Designation</p><p className="font-semibold text-orange-950">{req.form_data?.faculty_advisor?.designation}</p></div>
                              <div><p className="text-orange-900/50 font-bold mb-1">Tenure</p><p className="font-semibold text-orange-950">{req.form_data?.faculty_advisor?.tenure}</p></div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <h5 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2">History & Activities</h5>
                           
                           <div>
                             <p className="text-sm font-bold text-stone-800 mb-2">Qualitative and Quantitative Review</p>
                             <p className="text-sm text-stone-600 bg-stone-50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap border border-stone-100">{req.form_data?.history?.review_comment}</p>
                           </div>

                           {req.form_data?.history?.activities?.length > 0 && (
                             <div>
                               <p className="text-sm font-bold text-stone-800 mb-3">Critical Review of Activities</p>
                               <div className="space-y-3">
                                 {req.form_data.history.activities.map((act: any, i: number) => (
                                   <div key={i} className="border border-stone-200 rounded-xl p-4">
                                      <div className="flex justify-between items-start mb-2">
                                        <h6 className="font-bold text-stone-900">{act.title}</h6>
                                        <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-1 rounded-md">{act.dates}</span>
                                      </div>
                                      <p className="text-sm text-stone-600 leading-relaxed">{act.review}</p>
                                   </div>
                                 ))}
                               </div>
                             </div>
                           )}

                           {req.form_data?.history?.challenges && (
                             <div>
                               <p className="text-sm font-bold text-stone-800 mb-2">Challenges Faced</p>
                               <p className="text-sm text-stone-600 bg-stone-50 p-4 rounded-xl leading-relaxed border border-stone-100">{req.form_data.history.challenges}</p>
                             </div>
                           )}
                           
                           {req.form_data?.history?.feedback && (
                             <div>
                               <p className="text-sm font-bold text-stone-800 mb-2">Feedback to Administration</p>
                               <p className="text-sm text-stone-600 bg-stone-50 p-4 rounded-xl leading-relaxed border border-stone-100">{req.form_data.history.feedback}</p>
                             </div>
                           )}
                        </div>
                      </div>
                    }
                  </div>

                  {/* Actions */}
                  {req.status === 'PENDING' ? (
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6 p-4 sm:p-6 sm:pt-0">
                      <button 
                        onClick={() => setRejectingId(req._id)}
                        disabled={isUpdating}
                        className="w-full sm:w-auto px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors text-sm border border-red-100 disabled:opacity-50"
                      >
                        Reject Request
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(req._id, "APPROVED")}
                        disabled={isUpdating}
                        className="w-full sm:w-auto px-6 py-3 bg-stone-900 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-sm shadow-md disabled:opacity-50"
                      >
                        {isUpdating && expandedId === req._id ? "Approving..." : "Approve & Register Society"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end mt-6 p-4 sm:p-6 sm:pt-0">
                      <div className={`px-6 py-3 rounded-xl font-bold text-sm border ${
                        req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        Application {req.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          ))
        )}
      </div>

      {/* Comparison Report Modal */}
      {comparisonRequestId && (
        <ComparisonReport
          data={comparisonData}
          isLoading={isComparing}
          error={comparisonError}
          onClose={() => setComparisonRequestId(null)}
        />
      )}
    </div>
    </>
  );
}
