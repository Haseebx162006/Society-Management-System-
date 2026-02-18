"use client";

import React, { useState } from "react";
import {
    useGetJoinRequestsForSocietyQuery,
    useUpdateJoinRequestStatusMutation,
    JoinRequest,
} from "@/lib/features/join/joinApiSlice";
import {
    CheckCircle,
    XCircle,
    Clock,
    User,
    Mail,
    ChevronDown,
    ChevronUp,
    Loader2,
    Filter,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface JoinRequestManagerProps {
    societyId: string;
}

type StatusFilter = "" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_COLORS = {
    PENDING: "text-amber-400 bg-amber-900/30 border-amber-500/20",
    APPROVED: "text-green-400 bg-green-900/30 border-green-500/20",
    REJECTED: "text-red-400 bg-red-900/30 border-red-500/20",
};

const JoinRequestManager: React.FC<JoinRequestManagerProps> = ({
    societyId,
}) => {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
    const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
    const [rejectionModal, setRejectionModal] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const { data: requests = [], isLoading } =
        useGetJoinRequestsForSocietyQuery({
            societyId,
            status: statusFilter || undefined,
        });

    const [updateStatus, { isLoading: isUpdating }] =
        useUpdateJoinRequestStatusMutation();

    const handleApprove = async (requestId: string) => {
        try {
            await updateStatus({
                societyId,
                requestId,
                body: { status: "APPROVED" },
            }).unwrap();
            toast.success("Request approved. User is now a member.");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to approve request");
        }
    };

    const handleReject = async () => {
        if (!rejectionModal) return;
        try {
            await updateStatus({
                societyId,
                requestId: rejectionModal,
                body: {
                    status: "REJECTED",
                    rejection_reason: rejectionReason.trim() || undefined,
                },
            }).unwrap();
            toast.success("Request rejected");
            setRejectionModal(null);
            setRejectionReason("");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to reject request");
        }
    };

    const getUserName = (req: JoinRequest): string => {
        if (typeof req.user_id === "object") return req.user_id.name;
        return "Unknown User";
    };

    const getUserEmail = (req: JoinRequest): string => {
        if (typeof req.user_id === "object") return req.user_id.email;
        return "";
    };

    const getUserPhone = (req: JoinRequest): string => {
        if (typeof req.user_id === "object") return req.user_id.phone || "";
        return "";
    };

    const getFormTitle = (req: JoinRequest): string => {
        if (typeof req.form_id === "object") return req.form_id.title;
        return "";
    };

    const getTeamName = (req: JoinRequest): string => {
        if (req.selected_team && typeof req.selected_team === "object")
            return req.selected_team.name;
        return "";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-blue-200">Join Requests</h2>
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                        className="h-9 px-3 bg-[#0f172a] border border-blue-500/20 rounded-lg text-sm text-white focus:outline-none focus:border-blue-400"
                    >
                        <option value="">All</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Count Summary */}
            <div className="flex gap-4">
                {(["PENDING", "APPROVED", "REJECTED"] as const).map((status) => {
                    const count = requests.filter((r) => r.status === status).length;
                    return (
                        <button
                            key={status}
                            onClick={() =>
                                setStatusFilter(statusFilter === status ? "" : status)
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${statusFilter === status
                                ? STATUS_COLORS[status]
                                : "text-slate-500 bg-slate-800/50 border-slate-700 hover:border-slate-500"
                                }`}
                        >
                            {status.charAt(0) + status.slice(1).toLowerCase()} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Requests List */}
            {requests.length === 0 ? (
                <div className="text-center py-16 bg-[#1e293b]/50 border border-blue-500/10 rounded-xl">
                    <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium mb-1">No requests found</p>
                    <p className="text-slate-500 text-sm">
                        {statusFilter
                            ? `No ${statusFilter.toLowerCase()} requests.`
                            : "No one has submitted a join request yet."}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {requests.map((req) => {
                        const isExpanded = expandedRequest === req._id;
                        return (
                            <div
                                key={req._id}
                                className="bg-[#1e293b]/50 border border-blue-500/10 rounded-xl overflow-hidden"
                            >
                                {/* Request Header */}
                                <div
                                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-blue-900/10 transition-colors"
                                    onClick={() =>
                                        setExpandedRequest(isExpanded ? null : req._id)
                                    }
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 shrink-0">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-blue-100">
                                            {getUserName(req)}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {getFormTitle(req)} | {new Date(req.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2.5 py-1 text-xs font-bold rounded-full border ${STATUS_COLORS[req.status]
                                            }`}
                                    >
                                        {req.status}
                                    </span>
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-slate-500" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-slate-500" />
                                    )}
                                </div>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <div className="px-5 pb-5 border-t border-blue-500/10 space-y-4">
                                        {/* User Info */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="w-4 h-4 text-slate-500" />
                                                <span className="text-slate-300">{getUserEmail(req)}</span>
                                            </div>
                                            {getUserPhone(req) && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-slate-500 text-xs">Phone:</span>
                                                    <span className="text-slate-300">{getUserPhone(req)}</span>
                                                </div>
                                            )}
                                            {getTeamName(req) && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-slate-500 text-xs">Preferred Team:</span>
                                                    <span className="text-slate-300">{getTeamName(req)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Form Responses */}
                                        {req.responses.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-blue-300 mb-2">
                                                    Form Responses
                                                </h4>
                                                <div className="space-y-2">
                                                    {req.responses.map((response, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 px-3 py-2 bg-slate-800/50 rounded-lg"
                                                        >
                                                            <span className="text-xs font-semibold text-slate-400 sm:w-40 shrink-0 pt-1">
                                                                {response.field_label}
                                                            </span>
                                                            {response.field_type === "FILE" &&
                                                                typeof response.value === "string" &&
                                                                response.value.startsWith("http") ? (
                                                                <div className="flex flex-col gap-2">
                                                                    {/* Check if it looks like an image URL */}
                                                                    {/\.(jpg|jpeg|png|gif|webp|bmp|svg)($|\?)/i.test(
                                                                        response.value as string
                                                                    ) ||
                                                                        (response.value as string).includes(
                                                                            "/image/upload/"
                                                                        ) ? (
                                                                        <a
                                                                            href={response.value as string}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="block"
                                                                        >
                                                                            <img
                                                                                src={response.value as string}
                                                                                alt={response.field_label}
                                                                                className="max-w-xs max-h-48 rounded-lg border border-blue-500/20 object-contain hover:opacity-80 transition-opacity"
                                                                            />
                                                                            <span className="text-xs text-blue-400 mt-1 inline-block">
                                                                                Click to view full size
                                                                            </span>
                                                                        </a>
                                                                    ) : (
                                                                        <a
                                                                            href={response.value as string}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                                                        >
                                                                            <svg
                                                                                className="w-4 h-4"
                                                                                fill="none"
                                                                                viewBox="0 0 24 24"
                                                                                stroke="currentColor"
                                                                                strokeWidth={1.5}
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                                                                />
                                                                            </svg>
                                                                            View / Download File
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-white">
                                                                    {typeof response.value === "boolean"
                                                                        ? response.value
                                                                            ? "Yes"
                                                                            : "No"
                                                                        : String(response.value)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Rejection Reason */}
                                        {req.status === "REJECTED" && req.rejection_reason && (
                                            <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
                                                <p className="text-xs font-semibold text-red-400 mb-1">
                                                    Rejection Reason
                                                </p>
                                                <p className="text-sm text-red-200">
                                                    {req.rejection_reason}
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {req.status === "PENDING" && (
                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    onClick={() => handleApprove(req._id)}
                                                    disabled={isUpdating}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/40 text-green-300 font-medium rounded-lg border border-green-500/30 transition-all disabled:opacity-50"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => setRejectionModal(req._id)}
                                                    disabled={isUpdating}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 font-medium rounded-lg border border-red-500/30 transition-all disabled:opacity-50"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Rejection Reason Modal */}
            {rejectionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1e293b] border border-blue-500/20 rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold text-blue-200 mb-4">
                            Rejection Reason
                        </h3>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Optional: Provide a reason for rejection..."
                            rows={3}
                            className="w-full px-4 py-3 bg-[#0f172a] border border-blue-500/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 resize-none"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleReject}
                                disabled={isUpdating}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-medium rounded-lg transition-all"
                            >
                                {isUpdating ? "Rejecting..." : "Confirm Rejection"}
                            </button>
                            <button
                                onClick={() => {
                                    setRejectionModal(null);
                                    setRejectionReason("");
                                }}
                                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JoinRequestManager;
