'use client';

import React, { useState } from 'react';
import { useGetEmailTargetsQuery, useSendBulkEmailMutation } from '@/lib/features/email/emailApiSlice';
import { FaPaperPlane, FaUsers, FaLayerGroup, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { MdEmail, MdGroups } from 'react-icons/md';

interface SendEmailManagerProps {
    societyId: string;
}

const SendEmailManager: React.FC<SendEmailManagerProps> = ({ societyId }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [targetType, setTargetType] = useState<'all' | 'groups'>('all');
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const { data: targets, isLoading: targetsLoading } = useGetEmailTargetsQuery(societyId);
    const [sendEmail, { isLoading: isSending }] = useSendBulkEmailMutation();

    const handleGroupToggle = (groupId: string) => {
        setSelectedGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const handleSelectAllGroups = () => {
        if (!targets) return;
        if (selectedGroups.length === targets.groups.length) {
            setSelectedGroups([]);
        } else {
            setSelectedGroups(targets.groups.map(g => g._id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg('');
        setErrorMsg('');

        if (!subject.trim()) {
            setErrorMsg('Subject is required');
            return;
        }
        if (!message.trim()) {
            setErrorMsg('Message is required');
            return;
        }
        if (targetType === 'groups' && selectedGroups.length === 0) {
            setErrorMsg('Please select at least one group');
            return;
        }

        try {
            const result = await sendEmail({
                society_id: societyId,
                subject: subject.trim(),
                message: message.trim(),
                targetType,
                groupIds: targetType === 'groups' ? selectedGroups : undefined,
            }).unwrap();

            setSuccessMsg(`Email sent successfully to ${result.recipientCount} member(s)!`);
            setSubject('');
            setMessage('');
            setSelectedGroups([]);
            setTargetType('all');
        } catch (err: any) {
            setErrorMsg(err?.data?.message || 'Failed to send email. Please try again.');
        }
    };

    const recipientCount = React.useMemo(() => {
        if (!targets) return 0;
        if (targetType === 'all') return targets.totalMembers;
        return targets.groups
            .filter(g => selectedGroups.includes(g._id))
            .reduce((sum, g) => sum + g.memberCount, 0);
    }, [targets, targetType, selectedGroups]);

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <MdEmail className="text-orange-600" />
                    Send Email
                </h2>
                <p className="text-slate-500 mt-1">Compose and send emails to society members</p>
            </div>

            {/* Success/Error Alerts */}
            {successMsg && (
                <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-xl">
                    <FaCheckCircle className="text-green-600 text-lg flex-shrink-0" />
                    <span className="font-medium">{successMsg}</span>
                    <button onClick={() => setSuccessMsg('')} className="ml-auto text-green-600 hover:text-green-800 font-bold text-lg">&times;</button>
                </div>
            )}
            {errorMsg && (
                <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-xl">
                    <FaExclamationTriangle className="text-red-600 text-lg flex-shrink-0" />
                    <span className="font-medium">{errorMsg}</span>
                    <button onClick={() => setErrorMsg('')} className="ml-auto text-red-600 hover:text-red-800 font-bold text-lg">&times;</button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main composer area */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Subject */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Email Subject
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Enter email subject..."
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-800 placeholder-slate-400"
                                maxLength={200}
                            />
                            <p className="text-xs text-slate-400 mt-1 text-right">{subject.length}/200</p>
                        </div>

                        {/* Message */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your message here..."
                                rows={10}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-800 placeholder-slate-400 resize-none"
                                maxLength={5000}
                            />
                            <p className="text-xs text-slate-400 mt-1 text-right">{message.length}/5000</p>
                        </div>
                    </div>

                    {/* Sidebar - Target Selection */}
                    <div className="space-y-5">
                        {/* Target Type */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Send To
                            </label>
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => { setTargetType('all'); setSelectedGroups([]); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                                        targetType === 'all'
                                            ? 'bg-orange-50 border-orange-200 text-orange-700'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <FaUsers className="text-lg" />
                                    <div className="text-left">
                                        <div className="font-medium text-sm">All Members</div>
                                        <div className="text-xs opacity-70">
                                            {targetsLoading ? '...' : `${targets?.totalMembers || 0} members`}
                                        </div>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTargetType('groups')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                                        targetType === 'groups'
                                            ? 'bg-orange-50 border-orange-200 text-orange-700'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <MdGroups className="text-lg" />
                                    <div className="text-left">
                                        <div className="font-medium text-sm">Specific Groups</div>
                                        <div className="text-xs opacity-70">Select groups below</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Group Selection */}
                        {targetType === 'groups' && (
                            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Select Groups
                                    </label>
                                    {targets && targets.groups.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleSelectAllGroups}
                                            className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                                        >
                                            {selectedGroups.length === targets.groups.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    )}
                                </div>
                                {targetsLoading ? (
                                    <div className="text-slate-400 text-sm py-4 text-center">Loading groups...</div>
                                ) : targets && targets.groups.length > 0 ? (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {targets.groups.map((group) => (
                                            <label
                                                key={group._id}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                                                    selectedGroups.includes(group._id)
                                                        ? 'bg-orange-50 border border-orange-200'
                                                        : 'hover:bg-slate-50 border border-transparent'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedGroups.includes(group._id)}
                                                    onChange={() => handleGroupToggle(group._id)}
                                                    className="w-4 h-4 text-orange-600 bg-slate-100 border-slate-300 rounded focus:ring-orange-500"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-slate-700 truncate">{group.name}</div>
                                                    <div className="text-xs text-slate-400">{group.memberCount} members</div>
                                                </div>
                                                <FaLayerGroup className="text-slate-300 text-sm flex-shrink-0" />
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-slate-400 text-sm py-4 text-center">No groups available</div>
                                )}
                            </div>
                        )}

                        {/* Summary & Send */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-semibold text-slate-700">Recipients</span>
                                <span className="text-lg font-bold text-orange-600">{recipientCount}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={isSending || recipientCount === 0}
                                className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                                    isSending || recipientCount === 0
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-200 hover:shadow-orange-300'
                                }`}
                            >
                                {isSending ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <FaPaperPlane />
                                        Send Email
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SendEmailManager;
