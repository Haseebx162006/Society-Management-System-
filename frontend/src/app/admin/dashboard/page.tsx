"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../../../lib/hooks";
import { selectCurrentUser } from "../../../lib/features/auth/authSlice";
import {
  useGetSocietyRequestsQuery,
  useUpdateSocietyRequestStatusMutation,
} from "../../../lib/features/societies/societyApiSlice";
import { toast } from "react-hot-toast";
import Header from "../../../components/Header";
import Modal from "../../../components/ui/Modal";

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
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateSocietyRequestStatusMutation();

  const [rejectId, setRejectId] = useState<string | null>(null);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  /* 
    Updated to use useEffect for redirection to avoid "Cannot update a component while rendering" error.
    Also added a check to ensure we don't redirect while the user state might still be loading (though we don't have an explicit loading state from the selector here, assuming auth check happens earlier or user is null).
  */
  useEffect(() => {
    if (user && !user.is_super_admin) {
      router.push("/");
    } else if (!user) {
      // If no user, they might be logged out or state not ready. 
      // Ideally verify with specific auth loading state, but for now redirect if strictly not present.
      router.push("/");
    }
  }, [user, router]);

  if (!user?.is_super_admin) {
    return null;
  }

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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-(--font-family-poppins)">
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
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Requests
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {requests?.length || 0}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Pending
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-yellow-600">
                {requests?.filter((r) => r.status === "PENDING").length || 0}
              </dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Approved
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                {requests?.filter((r) => r.status === "APPROVED").length || 0}
              </dd>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Registration Requests
            </h3>
          </div>
          <div className="border-t border-gray-200">
            {isLoading ? (
              <div className="p-6 text-center text-gray-500">
                Loading requests...
              </div>
            ) : requests?.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No requests found.
              </div>
            ) : (
              <ul role="list" className="divide-y divide-gray-200">
                {requests?.map((request) => (
                  <li
                    key={request._id}
                    className="p-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-lg font-semibold text-blue-600 truncate">
                            {request.society_name}
                          </p>
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : request.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                              }`}
                          >
                            {request.status}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <span className="truncate">
                            Requested by:{" "}
                            <span className="font-medium text-gray-900">
                              {request.user_id?.name} ({request.user_id?.email})
                            </span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 max-w-xl">
                          {request.description || "No description provided."}
                        </p>
                        {request.status === "REJECTED" && (
                          <p className="text-sm text-red-500 mt-1">
                            Reason: {request.rejection_reason}
                          </p>
                        )}
                      </div>

                      {request.status === "PENDING" && (
                        <div className="ml-4 shrink-0 flex gap-2">
                          <button
                            onClick={() => handleApproveClick(request._id)}
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

      {/* Approve Modal */}
      <Modal
        isOpen={!!approveId}
        onClose={() => setApproveId(null)}
        title="Approve Request"
        footer={
          <>
            <button
              onClick={() => setApproveId(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={confirmApprove}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isUpdating ? "Approving..." : "Confirm Approve"}
            </button>
          </>
        }
      >
        <p>
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isUpdating}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isUpdating ? "Rejecting..." : "Reject"}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-500 mb-4">
          Please provide a reason for rejecting this society registration
          request.
        </p>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Reason for rejection..."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        ></textarea>
      </Modal>
    </div>
  );
}
