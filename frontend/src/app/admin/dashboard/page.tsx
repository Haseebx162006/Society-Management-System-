"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../../../lib/hooks";
import { selectCurrentUser } from "../../../lib/features/auth/authSlice";
import {
  useGetSocietyRequestsQuery,
  useUpdateSocietyRequestStatusMutation,
} from "../../../lib/features/societies/societyApiSlice";
import Header from "../../../components/Header";

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

export default function AdminDashboard() {
  const user = useAppSelector(selectCurrentUser);
  const router = useRouter();
  const { data: requests, isLoading } = useGetSocietyRequestsQuery(undefined, {
    pollingInterval: 30000,
    skip: !user?.is_super_admin,
  }) as { data: SocietyRequest[] | undefined; isLoading: boolean };
  const [updateStatus, { isLoading: isUpdating }] = useUpdateSocietyRequestStatusMutation();

  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!user?.is_super_admin) {
    if (typeof window !== "undefined") router.push("/");
    return null;
  }

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this request? This will create a new society.")) return;
    try {
      await updateStatus({ id, status: "APPROVED" }).unwrap();
      alert("Request approved successfully!");
    } catch (err) {
      console.error("Failed to approve:", err);
      const error = err as { data?: { message?: string } };
      alert(error?.data?.message || "Failed to approve request");
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectionReason.trim()) return;
    try {
      await updateStatus({ id: rejectId, status: "REJECTED", rejection_reason: rejectionReason }).unwrap();
      alert("Request rejected successfully!");
      setRejectId(null);
      setRejectionReason("");
    } catch (err) {
      console.error("Failed to reject:", err);
      const error = err as { data?: { message?: string } };
      alert(error?.data?.message || "Failed to reject request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-[var(--font-family-poppins)]">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage society registration requests and system settings.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{requests?.length || 0}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
             <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
              <dd className="mt-1 text-3xl font-semibold text-yellow-600">
                {requests?.filter((r) => r.status === "PENDING").length || 0}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
             <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
               <dd className="mt-1 text-3xl font-semibold text-green-600">
                {requests?.filter((r) => r.status === "APPROVED").length || 0}
              </dd>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Registration Requests</h3>
          </div>
          <div className="border-t border-gray-200">
            {isLoading ? (
               <div className="p-6 text-center text-gray-500">Loading requests...</div>
            ) : requests?.length === 0 ? (
               <div className="p-6 text-center text-gray-500">No requests found.</div>
            ) : (
              <ul role="list" className="divide-y divide-gray-200">
                {requests?.map((request) => (
                  <li key={request._id} className="p-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                             <p className="text-lg font-semibold text-blue-600 truncate">{request.society_name}</p>
                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                request.status === "APPROVED" ? "bg-green-100 text-green-800" :
                                request.status === "REJECTED" ? "bg-red-100 text-red-800" :
                                "bg-yellow-100 text-yellow-800"
                             }`}>
                                {request.status}
                             </span>
                        </div>
                         <div className="flex items-center text-sm text-gray-500 mb-2">
                             <span className="truncate">Requested by: <span className="font-medium text-gray-900">{request.user_id?.name} ({request.user_id?.email})</span></span>
                         </div>
                         <p className="text-sm text-gray-600 max-w-xl">{request.description || "No description provided."}</p>
                         {request.status === "REJECTED" && (
                            <p className="text-sm text-red-500 mt-1">Reason: {request.rejection_reason}</p>
                         )}
                      </div>
                      
                      {request.status === "PENDING" && (
                          <div className="ml-4 shrink-0 flex gap-2">
                             <button
                                onClick={() => handleApprove(request._id)}
                                disabled={isUpdating}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                             >
                                Accept
                             </button>
                             <button
                                onClick={() => setRejectId(request._id)}
                                disabled={isUpdating}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
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
      </main>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setRejectId(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Reject Request</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Please provide a reason for rejecting this society registration request.
                      </p>
                      <textarea
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || isUpdating}
                >
                  {isUpdating ? 'Rejecting...' : 'Reject'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setRejectId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
