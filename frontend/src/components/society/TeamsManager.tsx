"use client";

import React, { useState } from "react";
import {
    useGetGroupsInSocietyQuery,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useDeleteGroupMutation,
    useGetGroupMembersQuery,
    useAddMemberToGroupMutation,
    useRemoveMemberFromGroupMutation,
    useGetSocietyMembersQuery,
} from "@/lib/features/groups/groupApiSlice";
import {
    MdGroups,
    MdAdd,
    MdEdit,
    MdDelete,
    MdExpandMore,
    MdExpandLess,
    MdClose,
    MdPersonAdd,
    MdPersonRemove,
} from "react-icons/md";
import { FaWhatsapp, FaEnvelope, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface TeamsManagerProps {
    societyId: string;
}

// ─── Inline Create / Edit Form ───────────────────────────────────────────────

const TeamForm: React.FC<{
    initial?: { name: string; description: string };
    onSubmit: (name: string, description: string) => void;
    onCancel: () => void;
    loading?: boolean;
    submitLabel?: string;
}> = ({ initial, onSubmit, onCancel, loading, submitLabel = "Create" }) => {
    const [name, setName] = useState(initial?.name || "");
    const [description, setDescription] = useState(initial?.description || "");

    return (
        <div className="bg-[#1e293b]/80 border border-blue-500/20 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Team name"
                className="w-full bg-[#0f172a]/60 border border-blue-500/20 rounded-lg px-4 py-2.5 text-white placeholder:text-blue-400/40 focus:outline-none focus:border-blue-500/50"
                autoFocus
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full bg-[#0f172a]/60 border border-blue-500/20 rounded-lg px-4 py-2.5 text-white placeholder:text-blue-400/40 focus:outline-none focus:border-blue-500/50 resize-none"
            />
            <div className="flex justify-end gap-2">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm text-blue-400/60 hover:text-blue-300 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => name.trim() && onSubmit(name.trim(), description.trim())}
                    disabled={!name.trim() || loading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
                >
                    {loading ? "Saving..." : submitLabel}
                </button>
            </div>
        </div>
    );
};

// ─── Team Member List (shown when expanded) ──────────────────────────────────

const TeamMemberList: React.FC<{
    groupId: string;
    societyId: string;
}> = ({ groupId, societyId }) => {
    const { data: members, isLoading } = useGetGroupMembersQuery(groupId);
    const [removeMember] = useRemoveMemberFromGroupMutation();
    const [addMember] = useAddMemberToGroupMutation();
    const [showAddModal, setShowAddModal] = useState(false);

    // Large limit to show all members for picker
    const { data: allMembersData } = useGetSocietyMembersQuery(
        { societyId, page: 1, limit: 50 },
        { skip: !showAddModal }
    );

    const handleRemove = async (userId: string, name: string) => {
        if (!confirm(`Remove ${name} from this team?`)) return;
        try {
            await removeMember({ groupId, userId }).unwrap();
            toast.success("Member removed from team");
        } catch (err) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || "Failed to remove member");
        }
    };

    const handleAdd = async (userId: string) => {
        try {
            await addMember({ groupId, user_id: userId }).unwrap();
            toast.success("Member added to team!");
            setShowAddModal(false);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to add member");
        }
    };

    // Filter out members already in the team
    const teamUserIds = members?.map((m) => (typeof m.user_id === "string" ? m.user_id : m.user_id._id)) || [];
    const availableMembers = allMembersData?.members.filter(
        (m) => {
            const uid = typeof m.user_id === "string" ? m.user_id : m.user_id._id;
            return !teamUserIds.includes(uid);
        }
    ) || [];

    const formatPhone = (phone: string) => {
        let cleaned = phone.replace(/[^\d+]/g, "");
        if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
        return cleaned;
    };

    if (isLoading) {
        return <div className="py-4 text-center text-blue-400/60 animate-pulse text-sm">Loading members...</div>;
    }

    return (
        <div className="border-t border-blue-500/10 mt-3 pt-3 space-y-2">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-blue-400/60 font-semibold uppercase tracking-wider">
                    Team Members ({members?.length || 0})
                </span>
                <button
                    onClick={() => setShowAddModal(!showAddModal)}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                    <MdPersonAdd className="text-base" /> Add Member
                </button>
            </div>

            {/* Add member modal */}
            {showAddModal && (
                <div className="bg-[#0f172a]/80 border border-purple-500/20 rounded-lg p-3 mb-3 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-purple-300 font-semibold">Select a Society Member</span>
                        <button onClick={() => setShowAddModal(false)} className="text-blue-400/40 hover:text-white">
                            <MdClose />
                        </button>
                    </div>
                    {availableMembers.length === 0 ? (
                        <p className="text-xs text-blue-400/40 py-2">All society members are already in this team.</p>
                    ) : (
                        <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                            {availableMembers.map((m) => {
                                const user = typeof m.user_id === "string" ? null : m.user_id;
                                if (!user) return null;
                                return (
                                    <button
                                        key={m._id}
                                        onClick={() => handleAdd(user._id)}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-purple-500/10 transition-colors text-left"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-linear-to-br from-purple-500 to-pink-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-white truncate">{user.name}</p>
                                            <p className="text-[10px] text-blue-400/40 truncate">{user.email}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Members */}
            {(!members || members.length === 0) ? (
                <p className="text-xs text-blue-400/40 py-2 text-center">No members in this team yet.</p>
            ) : (
                members.map((m) => {
                    const user = typeof m.user_id === "string" ? null : m.user_id;
                    if (!user) return null;
                    return (
                        <div key={m._id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-blue-500/5 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-white truncate">{user.name}</p>
                                    <p className="text-[11px] text-blue-400/50 truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-3">
                                {user.phone && (
                                    <a
                                        href={`https://wa.me/${formatPhone(user.phone)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-7 h-7 rounded-md bg-green-500/10 hover:bg-green-500/25 flex items-center justify-center text-green-400 text-sm transition-all"
                                        title="WhatsApp"
                                    >
                                        <FaWhatsapp />
                                    </a>
                                )}
                                <a
                                    href={`mailto:${user.email}`}
                                    className="w-7 h-7 rounded-md bg-blue-500/10 hover:bg-blue-500/25 flex items-center justify-center text-blue-400 text-xs transition-all"
                                    title="Email"
                                >
                                    <FaEnvelope />
                                </a>
                                <button
                                    onClick={() => handleRemove(user._id, user.name)}
                                    className="w-7 h-7 rounded-md bg-red-500/10 hover:bg-red-500/25 flex items-center justify-center text-red-400 text-sm transition-all"
                                    title="Remove from team"
                                >
                                    <MdPersonRemove />
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

// ─── Main Teams Manager ──────────────────────────────────────────────────────

const TeamsManager: React.FC<TeamsManagerProps> = ({ societyId }) => {
    const { data: groups, isLoading, error } = useGetGroupsInSocietyQuery(societyId);
    const [createGroup, { isLoading: creating }] = useCreateGroupMutation();
    const [updateGroup, { isLoading: updating }] = useUpdateGroupMutation();
    const [deleteGroup] = useDeleteGroupMutation();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingGroup, setEditingGroup] = useState<string | null>(null);
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

    // Fetch members of selected team
    const { data: teamMembers, isLoading: loadingMembers } = useGetGroupMembersQuery(selectedTeamId || "", {
        skip: !selectedTeamId,
    });

    const [removeMember] = useRemoveMemberFromGroupMutation();

    const handleCreate = async (name: string, description: string) => {
        try {
            await createGroup({ society_id: societyId, name, description }).unwrap();
            toast.success("Team created!");
            setShowCreateForm(false);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to create team");
        }
    };

    const handleUpdate = async (groupId: string, name: string, description: string) => {
        try {
            await updateGroup({
                id: groupId,
                body: { name, description },
                societyId,
            }).unwrap();
            toast.success("Team updated!");
            setEditingGroup(null);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update team");
        }
    };

    const handleDelete = async (groupId: string, name: string) => {
        if (!confirm(`Delete team "${name}"? This will remove all member assignments.`)) return;
        try {
            await deleteGroup({ id: groupId, societyId }).unwrap();
            toast.success("Team deleted");
            if (selectedTeamId === groupId) setSelectedTeamId(null);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete team");
        }
    };

    const handleRemoveMember = async (userId: string, groupId: string) => {
        if (!confirm("Remove this member from the team?")) return;
        try {
            await removeMember({ groupId, userId }).unwrap();
            toast.success("Member removed");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to remove member");
        }
    };

    const formatPhone = (phone: string) => {
        let cleaned = phone.replace(/[^\d+]/g, "");
        if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
        return cleaned;
    };

    const getSelectedTeamName = () => {
        return groups?.find(g => g._id === selectedTeamId)?.name || "Team";
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);

        if (selectedTeamId && teamMembers) {
            // Export Members of Selected Team
            const teamName = getSelectedTeamName();
            doc.text(`${teamName} - Members`, 14, 22);

            const tableData = teamMembers.map((member) => {
                const user = typeof member.user_id === "string" ? null : member.user_id;
                return [
                    user?.name || "N/A",
                    user?.email || "N/A",
                    user?.phone || "N/A",
                    new Date(member.joined_at).toLocaleDateString(),
                ];
            });

            autoTable(doc, {
                head: [["Name", "Email", "Phone", "Joined Date"]],
                body: tableData,
                startY: 30,
            });
            doc.save(`${teamName.replace(/\s+/g, "_")}_members.pdf`);

        } else if (groups?.length) {
            // Export List of Teams
            doc.text("Society Teams", 14, 22);

            const tableData = groups.map((group) => {
                return [
                    group.name,
    
                    group.memberCount || 0,
                ];
            });

            autoTable(doc, {
                head: [["Team Name", "Members Count"]],
                body: tableData,
                startY: 30,
            });

            doc.save("society_teams.pdf");
        }
    };

    const exportToExcel = () => {
        if (selectedTeamId && teamMembers) {
            // Export Members of Selected Team
            const teamName = getSelectedTeamName();
            const worksheetData = teamMembers.map((member) => {
                const user = typeof member.user_id === "string" ? null : member.user_id;
                return {
                    Name: user?.name || "N/A",
                    Email: user?.email || "N/A",
                    Phone: user?.phone || "N/A",
                    "Joined Date": new Date(member.joined_at).toLocaleDateString(),
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
            saveAs(data, `${teamName.replace(/\s+/g, "_")}_members.xlsx`);

        } else if (groups?.length) {
            // Export List of Teams
            const worksheetData = groups.map((group) => {
                return {
                    Name: group.name,
                    "Members Count": group.memberCount || 0,
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(worksheetData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Teams");
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
            saveAs(data, "society_teams.xlsx");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 text-blue-400 animate-pulse">
                Loading teams...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-400">
                Failed to load teams. Please try again.
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-200">Teams</h2>
                    <p className="text-blue-400/60 text-sm mt-1">
                        {groups?.length || 0} team{(groups?.length || 0) !== 1 ? "s" : ""}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Export Buttons */}
                    <button
                        onClick={exportToPDF}
                        disabled={selectedTeamId ? (!teamMembers || teamMembers.length === 0) : (!groups || groups.length === 0)}
                        className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 px-4 py-2.5 rounded-lg border border-red-500/30 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaFilePdf /> PDF
                    </button>
                    <button
                        onClick={exportToExcel}
                        disabled={selectedTeamId ? (!teamMembers || teamMembers.length === 0) : (!groups || groups.length === 0)}
                        className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 px-4 py-2.5 rounded-lg border border-green-500/30 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaFileExcel /> Excel
                    </button>

                    {!selectedTeamId && (
                         <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg shadow-lg shadow-blue-600/20 transition-all text-sm font-medium"
                        >
                            <MdAdd className="text-lg" /> New Team
                        </button>
                    )}
                </div>
            </div>

            {/* Team Filters (Chips) */}
            <div className="flex flex-wrap gap-2 mb-6 pb-2 border-b border-blue-500/10">
                <button
                    onClick={() => setSelectedTeamId(null)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedTeamId === null
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                            : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                    }`}
                >
                    All Teams
                </button>
                {groups?.map((group) => (
                    <button
                        key={group._id}
                        onClick={() => setSelectedTeamId(group._id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            selectedTeamId === group._id
                                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                                : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                        }`}
                    >
                        {group.name}
                    </button>
                ))}
            </div>

            {/* Create Form (Only visible when All Teams is selected) */}
            {showCreateForm && !selectedTeamId && (
                <div className="mb-6">
                    <TeamForm
                        onSubmit={handleCreate}
                        onCancel={() => setShowCreateForm(false)}
                        loading={creating}
                        submitLabel="Create Team"
                    />
                </div>
            )}

            {/* Content Area */}
            {selectedTeamId ? (
                // ─── Filtered Team View (Member List) ───────────────────────
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                     <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <MdGroups className="text-blue-400" />
                        {getSelectedTeamName()}
                        <span className="text-sm font-normal text-blue-400/60 ml-2">
                            ({teamMembers?.length || 0} members)
                        </span>
                     </h3>

                    {loadingMembers ? (
                         <div className="text-center py-12 text-blue-400 animate-pulse">Loading members...</div>
                    ) : !teamMembers || teamMembers.length === 0 ? (
                        <div className="bg-[#1e293b]/50 border border-blue-500/10 rounded-xl p-8 text-center">
                            <MdPersonAdd className="text-4xl text-blue-500/30 mx-auto mb-3" />
                             <p className="text-blue-200 mb-1">No members in this team yet.</p>
                             <p className="text-blue-400/60 text-sm">
                                Switch to "All Teams" view and expand this team to add members.
                             </p>
                        </div>
                    ) : (
                        <div className="bg-[#1e293b]/50 border border-blue-500/10 rounded-xl overflow-hidden overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-blue-500/10 border-b border-blue-500/10 text-blue-300 text-sm uppercase tracking-wider">
                                        <th className="p-4 font-semibold">Name</th>
                                        <th className="p-4 font-semibold">Email</th>
                                    <th className="p-4 font-semibold hidden md:table-cell">Phone</th>
    
                                        <th className="p-4 font-semibold hidden sm:table-cell">Joined Date</th>
                                        <th className="p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-500/10">
                                    {teamMembers.map((member) => {
                                         const user = typeof member.user_id === "string" ? null : member.user_id;
                                         if (!user) return null;
                                        return (
                                            <tr key={member._id} className="hover:bg-blue-500/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/20">
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-white">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-blue-200">{user.email}</td>
                                                <td className="p-4 text-sm text-blue-400 hidden md:table-cell">
                                                    {user.phone ? (
                                                        <a href={`https://wa.me/${formatPhone(user.phone)}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 flex items-center gap-1">
                                                            <FaWhatsapp className="text-green-500/70" /> {user.phone}
                                                        </a>
                                                    ) : "N/A"}
                                                </td>
                                                <td className="p-4 text-sm text-blue-400 hidden sm:table-cell">
                                                    {new Date(member.joined_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <a href={`mailto:${user.email}`} className="text-blue-400 hover:text-white p-2 rounded-lg hover:bg-blue-500/20 transition-all">
                                                            <FaEnvelope />
                                                        </a>
                                                        <button
                                                            onClick={() => handleRemoveMember(user._id, selectedTeamId)}
                                                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-all"
                                                            title="Remove from team"
                                                        >
                                                            <MdPersonRemove />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                // ─── Default View (List of Teams) ───────────────────────────
                !groups || groups.length === 0 ? (
                    <div className="bg-[#1e293b]/50 border border-blue-500/10 rounded-2xl p-12 text-center">
                        <MdGroups className="text-5xl text-blue-500/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-blue-200 mb-2">No Teams Yet</h3>
                        <p className="text-blue-400/60 text-sm">
                            Create your first team to organize your society members.
                        </p>
                    </div>
                ) : (
                    <div className="bg-[#1e293b]/50 border border-blue-500/10 rounded-xl overflow-hidden overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-blue-500/10 border-b border-blue-500/10 text-blue-300 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Team Name</th>
                                    <th className="p-4 font-semibold">Members</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-500/10">
                                {groups.map((group) => (
                                    <React.Fragment key={group._id}>
                                        {editingGroup === group._id ? (
                                            <tr>
                                                <td colSpan={4} className="p-4">
                                                    <TeamForm
                                                        initial={{ name: group.name, description: group.description || "" }}
                                                        onSubmit={(name, desc) => handleUpdate(group._id, name, desc)}
                                                        onCancel={() => setEditingGroup(null)}
                                                        loading={updating}
                                                        submitLabel="Save Changes"
                                                    />
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr className="hover:bg-blue-500/5 transition-colors group">
                                                <td className="p-4">
                                                    <div
                                                        className="flex items-center gap-3 cursor-pointer"
                                                        onClick={() =>
                                                            setExpandedGroup(expandedGroup === group._id ? null : group._id)
                                                        }
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0">
                                                            <MdGroups className="text-xl" />
                                                        </div>
                                                        <span className="font-semibold text-white">{group.name}</span>
                                                        {expandedGroup === group._id ? (
                                                            <MdExpandLess className="text-blue-400/40 text-xl" />
                                                        ) : (
                                                            <MdExpandMore className="text-blue-400/40 text-xl" />
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="p-4">
                                                    <span className="text-sm text-blue-300 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
                                                        {group.memberCount || 0} Members
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditingGroup(group._id)}
                                                            className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center text-blue-400 transition-all"
                                                            title="Edit team"
                                                        >
                                                            <MdEdit className="text-base" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(group._id, group.name)}
                                                            className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-all"
                                                            title="Delete team"
                                                        >
                                                            <MdDelete className="text-base" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {/* Expanded — show team members */}
                                        {expandedGroup === group._id && !editingGroup && (
                                            <tr>
                                                <td colSpan={4} className="p-0">
                                                    <div className="bg-[#0f172a]/30 border-y border-blue-500/10 px-4 py-4 animate-in slide-in-from-top-2 duration-200">
                                                        <TeamMemberList groupId={group._id} societyId={societyId} />
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
};

export default TeamsManager;
