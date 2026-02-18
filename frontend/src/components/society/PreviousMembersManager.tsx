'use client';
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaTrash, FaEnvelope, FaFileExcel, FaTimes, FaCheckCircle, FaExclamationCircle, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';
import {
    useUploadPreviousMembersMutation,
    useGetPreviousMembersQuery,
    useDeletePreviousMemberMutation,
    useClearPreviousMembersMutation,
} from '@/lib/features/join/joinApiSlice';

interface PreviousMembersManagerProps {
    societyId: string;
}

const PreviousMembersManager: React.FC<PreviousMembersManagerProps> = ({ societyId }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [uploadResult, setUploadResult] = useState<{ with_account: number; without_account: number; unregistered_emails: string[] } | null>(null);

    // ─── API Hooks ───────────────────────────────────────────────────────────
    const { data: members = [], isLoading } = useGetPreviousMembersQuery(societyId);
    const [uploadExcel, { isLoading: isUploading }] = useUploadPreviousMembersMutation();
    const [deleteMember] = useDeletePreviousMemberMutation();
    const [clearAll, { isLoading: isClearing }] = useClearPreviousMembersMutation();

    // ─── Upload Handler ──────────────────────────────────────────────────────
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
            toast.error('Please upload an Excel file (.xlsx or .xls)');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadExcel({ societyId, body: formData }).unwrap();
            toast.success(`${result.newly_added} email(s) added — ${result.with_account} have accounts, ${result.without_account} do not`);
            if (result.without_account > 0) {
                setUploadResult(result);
            } else {
                setUploadResult(null);
            }
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to upload file');
        }

        // Reset the file input so the same file can be re-uploaded
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ─── Delete Single Email ─────────────────────────────────────────────────
    const handleDelete = async (memberId: string, email: string) => {
        try {
            await deleteMember({ societyId, memberId }).unwrap();
            toast.success(`Removed ${email}`);
        } catch {
            toast.error('Failed to remove email');
        }
    };

    // ─── Clear All ───────────────────────────────────────────────────────────
    const handleClearAll = async () => {
        try {
            await clearAll(societyId).unwrap();
            toast.success('All previous member emails cleared');
            setShowClearConfirm(false);
        } catch {
            toast.error('Failed to clear emails');
        }
    };

    // ─── Download Unregistered Emails as Excel ──────────────────────────────
    const handleDownloadUnregistered = async () => {
        try {
            const authState = localStorage.getItem('authState');
            const token = authState ? JSON.parse(authState).token : null;
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/society/${societyId}/previous-members/export-unregistered`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) {
                const err = await res.json();
                toast.error(err.message || 'Failed to download');
                return;
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'unregistered_members.xlsx';
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error('Failed to download Excel');
        }
    };

    // Derived counts
    const registeredCount = members.filter(m => m.has_account).length;
    const unregisteredCount = members.filter(m => !m.has_account).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Previous Members</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Upload an Excel file with previous member emails. When they join, they'll be auto-approved without payment or other required fields.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {members.length > 0 && (
                        <>
                            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                {registeredCount} registered
                            </span>
                            <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                {unregisteredCount} not registered
                            </span>
                        </>
                    )}
                    <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                        {members.length} total
                    </span>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-300 transition-colors">
                <FaFileExcel className="mx-auto text-4xl text-green-500 mb-3" />
                <p className="text-slate-600 font-medium mb-1">Upload Excel File</p>
                <p className="text-slate-400 text-sm mb-4">
                    All email addresses found anywhere in the spreadsheet will be extracted automatically.
                </p>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition-colors font-medium">
                    <FaUpload />
                    {isUploading ? 'Uploading...' : 'Choose File'}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                    />
                </label>
            </div>

            {/* Action Bar */}
            {members.length > 0 && (
                <div className="flex justify-between items-center">
                    {unregisteredCount > 0 && (
                        <button
                            onClick={handleDownloadUnregistered}
                            className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                        >
                            <FaDownload className="text-xs" /> Download Unregistered Emails (.xlsx)
                        </button>
                    )}
                    <div className="ml-auto">
                        {!showClearConfirm ? (
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                        >
                            <FaTrash className="text-xs" /> Clear All
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                            <span className="text-sm text-red-600">Delete all emails?</span>
                            <button
                                onClick={handleClearAll}
                                disabled={isClearing}
                                className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                            >
                                {isClearing ? 'Clearing...' : 'Yes, Clear'}
                            </button>
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="text-sm text-slate-500 hover:text-slate-700"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                    </div>
                </div>
            )}

            {/* Email List */}
            {isLoading ? (
                <div className="text-center py-12 text-slate-400">Loading...</div>
            ) : members.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                    <FaEnvelope className="mx-auto text-3xl text-slate-300 mb-3" />
                    <p className="text-slate-400 font-medium">No previous member emails uploaded yet</p>
                    <p className="text-slate-300 text-sm mt-1">Upload an Excel file to get started</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <span>Email</span>
                        <span>Status</span>
                        <span>Added On</span>
                        <span></span>
                    </div>
                    <AnimatePresence>
                        {members.map((member) => (
                            <motion.div
                                key={member._id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-6 py-3 border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                            >
                                <span className="text-sm text-slate-700 font-medium flex items-center gap-2">
                                    <FaEnvelope className="text-slate-400 text-xs" />
                                    {member.email}
                                </span>
                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                                    member.has_account
                                        ? 'bg-green-50 text-green-600'
                                        : 'bg-orange-50 text-orange-600'
                                }`}>
                                    {member.has_account
                                        ? <><FaCheckCircle className="text-[10px]" /> Registered</>
                                        : <><FaExclamationCircle className="text-[10px]" /> Not Registered</>
                                    }
                                </span>
                                <span className="text-xs text-slate-400">
                                    {new Date(member.created_at).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={() => handleDelete(member._id, member.email)}
                                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                    title="Remove"
                                >
                                    <FaTimes className="text-sm" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default PreviousMembersManager;
