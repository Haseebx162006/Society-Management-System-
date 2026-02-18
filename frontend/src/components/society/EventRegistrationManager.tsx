'use client';

import React, { useState } from 'react';
import { FaCheck, FaTimes, FaFileExcel, FaEye, FaSearch, FaFilter } from 'react-icons/fa';
import {
    useGetEventRegistrationsQuery,
    useUpdateRegistrationStatusMutation,
    EventRegistration,
    EventFormField
} from '@/lib/features/events/eventApiSlice';

interface EventRegistrationManagerProps {
    societyId: string;
    eventId: string;
    eventTitle: string;
    onExportExcel: () => void;
}

const EventRegistrationManager: React.FC<EventRegistrationManagerProps> = ({
    societyId,
    eventId,
    eventTitle,
    onExportExcel
}) => {
    const { data: registrations, isLoading } = useGetEventRegistrationsQuery({ societyId, eventId });
    const [updateStatus, { isLoading: isUpdating }] = useUpdateRegistrationStatusMutation();

    const [filterStatus, setFilterStatus] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleApprove = async (registrationId: string) => {
        setError('');
        try {
            await updateStatus({
                societyId,
                eventId,
                registrationId,
                body: { status: 'APPROVED' }
            }).unwrap();
            setSuccess('Registration approved!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err?.data?.message || 'Failed to approve');
        }
    };

    const handleReject = async (registrationId: string) => {
        setError('');
        try {
            await updateStatus({
                societyId,
                eventId,
                registrationId,
                body: { status: 'REJECTED', rejection_reason: rejectionReason }
            }).unwrap();
            setRejectingId(null);
            setRejectionReason('');
            setSuccess('Registration rejected.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err?.data?.message || 'Failed to reject');
        }
    };

    const filteredRegistrations = React.useMemo(() => {
        if (!registrations) return [];
        let filtered = [...registrations];

        if (filterStatus) {
            filtered = filtered.filter(r => r.status === filterStatus);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(r => {
                const user = typeof r.user_id === 'object' ? r.user_id : null;
                return (
                    user?.name?.toLowerCase().includes(q) ||
                    user?.email?.toLowerCase().includes(q) ||
                    r.responses?.some(resp => String(resp.value).toLowerCase().includes(q))
                );
            });
        }

        return filtered;
    }, [registrations, filterStatus, searchQuery]);

    const counts = React.useMemo(() => {
        if (!registrations) return { total: 0, pending: 0, approved: 0, rejected: 0 };
        return {
            total: registrations.length,
            pending: registrations.filter(r => r.status === 'PENDING').length,
            approved: registrations.filter(r => r.status === 'APPROVED').length,
            rejected: registrations.filter(r => r.status === 'REJECTED').length,
        };
    }, [registrations]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-blue-500 animate-pulse text-lg">Loading registrations...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Event Registrations</h2>
                    <p className="text-slate-500 mt-1">{eventTitle}</p>
                </div>
                <button
                    onClick={onExportExcel}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                >
                    <FaFileExcel /> Export Approved to Excel
                </button>
            </div>

            {(error || success) && (
                <div className={`p-4 rounded-xl border ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    {error || success}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="text-sm text-slate-500">Total</p>
                    <p className="text-2xl font-bold text-slate-800">{counts.total}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">{counts.pending}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-600">Approved</p>
                    <p className="text-2xl font-bold text-green-700">{counts.approved}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-700">{counts.rejected}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-800"
                        placeholder="Search by name, email..."
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-800 bg-white"
                >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* Registration List */}
            {filteredRegistrations.length > 0 ? (
                <div className="space-y-3">
                    {filteredRegistrations.map((reg) => {
                        const user = typeof reg.user_id === 'object' ? reg.user_id : null;
                        const isExpanded = expandedId === reg._id;
                        const isRejecting = rejectingId === reg._id;

                        return (
                            <div key={reg._id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                            {user?.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{user?.name || 'Unknown'}</p>
                                            <p className="text-sm text-slate-400">{user?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                            reg.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                            reg.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {reg.status}
                                        </span>

                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : reg._id)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <FaEye />
                                        </button>

                                        {reg.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(reg._id)}
                                                    disabled={isUpdating}
                                                    className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Approve"
                                                >
                                                    <FaCheck />
                                                </button>
                                                <button
                                                    onClick={() => setRejectingId(isRejecting ? null : reg._id)}
                                                    disabled={isUpdating}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Reject"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Response Details */}
                                {isExpanded && (
                                    <div className="p-4 pt-0 border-t border-slate-100">
                                        <div className="bg-slate-50 rounded-lg p-4 mt-3">
                                            <h4 className="text-sm font-semibold text-slate-600 mb-3">Form Responses</h4>
                                            {reg.responses && reg.responses.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {reg.responses.map((resp, idx) => (
                                                        <div key={idx} className="text-sm">
                                                            <p className="text-slate-500 font-medium">{resp.field_label}</p>
                                                            {resp.field_type === 'FILE' ? (
                                                                <a
                                                                    href={String(resp.value)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline"
                                                                >
                                                                    View File
                                                                </a>
                                                            ) : (
                                                                <p className="text-slate-800">{String(resp.value)}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-slate-400 text-sm">No form responses</p>
                                            )}
                                        </div>
                                        <div className="mt-3 text-xs text-slate-400">
                                            Registered: {new Date(reg.created_at).toLocaleString()}
                                            {reg.reviewed_at && <> | Reviewed: {new Date(reg.reviewed_at).toLocaleString()}</>}
                                        </div>
                                    </div>
                                )}

                                {/* Rejection Reason Input */}
                                {isRejecting && (
                                    <div className="p-4 pt-0 border-t border-slate-100">
                                        <div className="flex gap-2 mt-3">
                                            <input
                                                type="text"
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-slate-800"
                                                placeholder="Reason for rejection (optional)"
                                            />
                                            <button
                                                onClick={() => handleReject(reg._id)}
                                                disabled={isUpdating}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                                            >
                                                Confirm Reject
                                            </button>
                                            <button
                                                onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                                                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No Registrations Found</h3>
                    <p className="text-slate-400">
                        {filterStatus || searchQuery ? 'Try adjusting your filters' : 'No one has registered for this event yet'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default EventRegistrationManager;
