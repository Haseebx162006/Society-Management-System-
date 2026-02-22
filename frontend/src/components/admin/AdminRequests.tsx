import React, { useState } from 'react';
import { useGetSocietyRequestsQuery, useUpdateSocietyRequestStatusMutation } from '@/lib/features/societies/societyApiSlice';
import { toast } from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

interface SocietyRequest {
  _id: string;
  society_name: string;
  description?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason?: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
  };
  created_at: string;
}

const AdminRequests: React.FC = () => {
  const { data: requests, isLoading } = useGetSocietyRequestsQuery(undefined, {
    pollingInterval: 30000,
  }) as { data: SocietyRequest[] | undefined; isLoading: boolean };
  
  const [updateStatus, { isLoading: isUpdating }] = useUpdateSocietyRequestStatusMutation();

  const [rejectId, setRejectId] = useState<string | null>(null);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApproveClick = (id: string) => {
    setApproveId(id);
  };

  const confirmApprove = async () => {
    if (!approveId) return;
    try {
      await updateStatus({ id: approveId, status: "APPROVED" }).unwrap();
      toast.success("Request approved successfully!");
      setApproveId(null);
    } catch (err) {
      console.error("Failed to approve:", err);
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to approve request");
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectionReason.trim()) return;
    try {
      await updateStatus({
        id: rejectId,
        status: "REJECTED",
        rejection_reason: rejectionReason,
      }).unwrap();
      toast.success("Request rejected successfully!");
      setRejectId(null);
      setRejectionReason("");
    } catch (err) {
      console.error("Failed to reject:", err);
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to reject request");
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Registration Requests</h2>
        <p className="text-slate-500">Manage all society creation requests</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100 p-6">
          <dt className="text-sm font-medium text-slate-500 truncate">Total Requests</dt>
          <dd className="mt-1 text-3xl font-bold text-slate-800">{requests?.length || 0}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100 p-6">
          <dt className="text-sm font-medium text-slate-500 truncate">Pending</dt>
          <dd className="mt-1 text-3xl font-bold text-yellow-600">
            {requests?.filter((r) => r.status === "PENDING").length || 0}
          </dd>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-slate-100 p-6">
          <dt className="text-sm font-medium text-slate-500 truncate">Approved</dt>
          <dd className="mt-1 text-3xl font-bold text-green-600">
            {requests?.filter((r) => r.status === "APPROVED").length || 0}
          </dd>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-100 overflow-hidden rounded-2xl">
        <div className="border-t border-slate-200">
          {isLoading ? (
            <div className="p-6 text-center text-slate-500 text-sm">Loading requests...</div>
          ) : requests?.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">No requests found.</div>
          ) : (
            <ul role="list" className="divide-y divide-slate-100">
              {requests?.map((request) => (
                <li key={request._id} className="p-4 sm:px-6 hover:bg-slate-50/50 transition duration-150 ease-in-out">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-lg font-bold text-slate-800 truncate">
                          {request.society_name}
                        </p>
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                            request.status === "APPROVED"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : request.status === "REJECTED"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-slate-500 mb-2">
                        <span className="truncate">
                          Requested by:{" "}
                          <span className="font-semibold text-slate-700">
                            {request.user_id?.name} ({request.user_id?.email})
                          </span>
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 max-w-xl">
                        {request.description || "No description provided."}
                      </p>
                      {request.status === "REJECTED" && (
                        <p className="text-sm text-red-500 font-medium mt-2">
                          Reason: {request.rejection_reason}
                        </p>
                      )}
                    </div>

                    {request.status === "PENDING" && (
                      <div className="ml-4 shrink-0 flex gap-2">
                        <button
                          onClick={() => handleApproveClick(request._id)}
                          disabled={isUpdating}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-orange-600 hover:bg-orange-700 shadow-sm disabled:opacity-50 transition-all font-sans"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectId(request._id)}
                          disabled={isUpdating}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-all font-sans"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={!!approveId}
        onClose={() => setApproveId(null)}
        title="Approve Request"
        footer={
          <>
            <button
              onClick={() => setApproveId(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all font-sans"
            >
              Cancel
            </button>
            <button
              onClick={confirmApprove}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-all font-sans"
            >
              {isUpdating ? "Approving..." : "Confirm"}
            </button>
          </>
        }
      >
        <p className="text-slate-600 text-sm">
          Are you sure you want to approve this request? This will create a new
          society in the system.
        </p>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectId}
        onClose={() => setRejectId(null)}
        title="Reject Request"
        footer={
          <>
            <button
              onClick={() => setRejectId(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all font-sans"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all font-sans"
            >
              {isUpdating ? "Rejecting..." : "Reject"}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 mb-4 font-sans">
          Please provide a reason for rejecting this society registration
          request.
        </p>
        <textarea
          className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:ring-orange-500 focus:border-orange-500 outline-none font-sans"
          rows={3}
          placeholder="Reason for rejection..."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        ></textarea>
      </Modal>
    </>
  );
};

export default AdminRequests;
