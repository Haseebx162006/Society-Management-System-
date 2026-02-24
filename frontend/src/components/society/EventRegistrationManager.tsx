'use client';

import React, { useState, useMemo } from 'react';
import { FaCheck, FaTimes, FaFileExcel, FaFilePdf, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import {
    useGetEventRegistrationsQuery,
    useUpdateRegistrationStatusMutation,
    EventRegistration,
} from '@/lib/features/events/eventApiSlice';

// ─── Props ──────────────────────────────────────────────────────────────────

interface EventRegistrationManagerProps {
    societyId: string;
    eventId: string;
    eventTitle: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

const EventRegistrationManager: React.FC<EventRegistrationManagerProps> = ({
    societyId,
    eventId,
    eventTitle,
}) => {
    // ── Data ──
    const { data: registrations, isLoading } = useGetEventRegistrationsQuery({ societyId, eventId });
    const [updateStatus, { isLoading: isUpdating }] = useUpdateRegistrationStatusMutation();

    // ── UI State ──
    const [filterStatus, setFilterStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // ── Toast helper ──
    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Approve ──
    const handleApprove = async (registrationId: string) => {
        try {
            await updateStatus({
                societyId, eventId, registrationId,
                body: { status: 'APPROVED' },
            }).unwrap();
            showToast('success', 'Registration approved!');
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            showToast('error', error?.data?.message || 'Failed to approve');
        }
    };

    // ── Reject ──
    const handleReject = async (registrationId: string) => {
        try {
            await updateStatus({
                societyId, eventId, registrationId,
                body: { status: 'REJECTED', rejection_reason: rejectionReason },
            }).unwrap();
            setRejectingId(null);
            setRejectionReason('');
            showToast('success', 'Registration rejected.');
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            showToast('error', error?.data?.message || 'Failed to reject');
        }
    };

    // ── Get auth token from stored state ──
    const getToken = (): string => {
        try {
            const authState = localStorage.getItem('authState');
            if (authState) return JSON.parse(authState).token || '';
        } catch { /* ignore */ }
        return '';
    };

    // ── Download helper (Excel / PDF) ──
    const downloadFile = async (format: 'excel' | 'pdf') => {
        try {
            const ext = format === 'excel' ? 'xlsx' : 'pdf';
            const endpoint = format === 'excel' ? 'export' : 'export-pdf';

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/society/${societyId}/events/${eventId}/${endpoint}`,
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${eventTitle}_registrations.${ext}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            showToast('error', `Failed to export as ${format.toUpperCase()}`);
        }
    };

    // ── Filtered list ──
    const filteredRegistrations = useMemo(() => {
        if (!registrations) return [];
        let list = [...registrations];

        if (filterStatus) list = list.filter(r => r.status === filterStatus);

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(r => {
                const user = typeof r.user_id === 'object' ? r.user_id : null;
                return (
                    user?.name?.toLowerCase().includes(q) ||
                    user?.email?.toLowerCase().includes(q) ||
                    r.responses?.some(resp => String(resp.value).toLowerCase().includes(q))
                );
            });
        }

        return list;
    }, [registrations, filterStatus, searchQuery]);

    // ── Counts ──
    const counts = useMemo(() => {
        if (!registrations) return { total: 0, pending: 0, approved: 0, rejected: 0 };
        return {
            total: registrations.length,
            pending: registrations.filter(r => r.status === 'PENDING').length,
            approved: registrations.filter(r => r.status === 'APPROVED').length,
            rejected: registrations.filter(r => r.status === 'REJECTED').length,
        };
    }, [registrations]);

    // ── Loading ──
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-orange-500 animate-pulse text-lg">Loading registrations...</div>
            </div>
        );
    }

    // ─── Render ─────────────────────────────────────────────────────

    return (
        <div className="space-y-6">

            {/* ── Header with export buttons ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Event Registrations</h2>
                    <p className="text-slate-500 mt-1">{eventTitle}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => downloadFile('excel')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-sm"
                    >
                        <FaFileExcel /> Excel
                    </button>
                    <button
                        onClick={() => downloadFile('pdf')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm"
                    >
                        <FaFilePdf /> PDF
                    </button>
                </div>
            </div>

            {/* ── Toast ── */}
            {toast && (
                <div className={`p-4 rounded-xl border text-sm font-medium ${
                    toast.type === 'error'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-green-50 border-green-200 text-green-700'
                }`}>
                    {toast.message}
                </div>
            )}

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: counts.total, bg: 'bg-white border-slate-200', text: 'text-slate-800', sub: 'text-slate-500' },
                    { label: 'Pending', value: counts.pending, bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', sub: 'text-yellow-600' },
                    { label: 'Approved', value: counts.approved, bg: 'bg-green-50 border-green-200', text: 'text-green-700', sub: 'text-green-600' },
                    { label: 'Rejected', value: counts.rejected, bg: 'bg-red-50 border-red-200', text: 'text-red-700', sub: 'text-red-600' },
                ].map(card => (
                    <div key={card.label} className={`${card.bg} border rounded-xl p-4`}>
                        <p className={`text-sm ${card.sub}`}>{card.label}</p>
                        <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Search & Filter ── */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800"
                        placeholder="Search by name, email..."
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-800 bg-white"
                >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* ── Registration List ── */}
            {filteredRegistrations.length > 0 ? (
                <div className="space-y-3">
                    {filteredRegistrations.map(reg => (
                        <RegistrationCard
                            key={reg._id}
                            reg={reg}
                            isExpanded={expandedId === reg._id}
                            isRejecting={rejectingId === reg._id}
                            isUpdating={isUpdating}
                            rejectionReason={rejectionReason}
                            onToggleExpand={() => setExpandedId(expandedId === reg._id ? null : reg._id)}
                            onApprove={() => handleApprove(reg._id)}
                            onStartReject={() => setRejectingId(rejectingId === reg._id ? null : reg._id)}
                            onConfirmReject={() => handleReject(reg._id)}
                            onCancelReject={() => { setRejectingId(null); setRejectionReason(''); }}
                            onReasonChange={setRejectionReason}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No Registrations Found</h3>
                    <p className="text-slate-400">
                        {filterStatus || searchQuery ? 'Try adjusting your filters' : 'No one has registered yet'}
                    </p>
                </div>
            )}
        </div>
    );
};

// ─── Registration Card (keeps main component clean) ─────────────────────────

interface RegistrationCardProps {
    reg: EventRegistration;
    isExpanded: boolean;
    isRejecting: boolean;
    isUpdating: boolean;
    rejectionReason: string;
    onToggleExpand: () => void;
    onApprove: () => void;
    onStartReject: () => void;
    onConfirmReject: () => void;
    onCancelReject: () => void;
    onReasonChange: (v: string) => void;
}

const RegistrationCard: React.FC<RegistrationCardProps> = ({
    reg, isExpanded, isRejecting, isUpdating, rejectionReason,
    onToggleExpand, onApprove, onStartReject, onConfirmReject, onCancelReject, onReasonChange,
}) => {
    const user = typeof reg.user_id === 'object' ? reg.user_id : null;

    const statusStyle =
        reg.status === 'APPROVED' ? 'bg-green-100 text-green-700'
        : reg.status === 'REJECTED' ? 'bg-red-100 text-red-700'
        : 'bg-yellow-100 text-yellow-700';

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

            {/* ── Row ── */}
            <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                        {user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{user?.name || 'Unknown'}</p>
                        <p className="text-sm text-slate-400 truncate">{user?.email || 'N/A'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyle}`}>
                        {reg.status}
                    </span>

                    {/* Expand / collapse */}
                    <button onClick={onToggleExpand} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                        {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </button>

                    {/* Approve / Reject (only for PENDING) */}
                    {reg.status === 'PENDING' && (
                        <>
                            <button
                                onClick={onApprove}
                                disabled={isUpdating}
                                className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve"
                            >
                                <FaCheck />
                            </button>
                            <button
                                onClick={onStartReject}
                                disabled={isUpdating}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject"
                            >
                                <FaTimes />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ── Expanded: Form Responses ── */}
            {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-lg p-4 mt-3">
                        <h4 className="text-sm font-semibold text-slate-600 mb-3">Form Responses</h4>
                        {reg.responses && reg.responses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {reg.responses.map((resp, idx) => (
                                    <div key={idx} className="text-sm">
                                        <p className="text-slate-500 font-medium">{resp.field_label}</p>
                                        {resp.field_type === 'FILE' ? (
                                            <a href={String(resp.value)} target="_blank" rel="noopener noreferrer"
                                               className="text-orange-600 hover:underline">
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
                        {reg.reviewed_at && <> &bull; Reviewed: {new Date(reg.reviewed_at).toLocaleString()}</>}
                    </div>
                </div>
            )}

            {/* ── Rejection Reason Input ── */}
            {isRejecting && (
                <div className="px-4 pb-4 border-t border-slate-100">
                    <div className="flex gap-2 mt-3">
                        <input
                            type="text"
                            value={rejectionReason}
                            onChange={e => onReasonChange(e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-slate-800"
                            placeholder="Reason for rejection (optional)"
                        />
                        <button
                            onClick={onConfirmReject}
                            disabled={isUpdating}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={onCancelReject}
                            className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventRegistrationManager;
