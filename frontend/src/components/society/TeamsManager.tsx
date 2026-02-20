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
    useUpdateMemberRoleMutation,
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Team name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
                autoFocus
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none"
            />
            <div className="flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium"
                >
                    Cancel
                </button>
                <button
                    onClick={() => name.trim() && onSubmit(name.trim(), description.trim())}
                    disabled={!name.trim() || loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all"
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
    const [updateMemberRole] = useUpdateMemberRoleMutation();
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
        return <div className="py-4 text-center text-slate-400 animate-pulse text-sm">Loading members...</div>;
    }

    return (
        <div className="border-t border-slate-100 mt-3 pt-3 space-y-2">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    Team Members ({members?.length || 0})
                </span>
                <button
                    onClick={() => setShowAddModal(!showAddModal)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors font-medium"
                >
                    <MdPersonAdd className="text-base" /> Add Member
                </button>
            </div>

            {/* Add member modal */}
            {showAddModal && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3 animate-in fade-in duration-200 shadow-sm relative z-10">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-slate-700 font-bold uppercase tracking-wider">Select Member</span>
                        <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                            <MdClose />
                        </button>
                    </div>
                    {availableMembers.length === 0 ? (
                        <p className="text-xs text-slate-400 py-2">All society members are already in this team.</p>
                    ) : (
                        <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                            {availableMembers.map((m) => {
                                const user = typeof m.user_id === "string" ? null : m.user_id;
                                if (!user) return null;
                                return (
                                    <button
                                        key={m._id}
                                        onClick={() => handleAdd(user._id)}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-700 group-hover:text-slate-900 font-medium truncate">{user.name}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
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
                <p className="text-xs text-slate-400 py-2 text-center italic">No members in this team yet.</p>
            ) : (
                members.map((m) => {
                    const user = typeof m.user_id === "string" ? null : m.user_id;
                    if (!user) return null;
                    return (
                        <div key={m._id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-700 font-medium truncate">{user.name}</p>
                                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                                </div>
                            </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-3 transition-opacity">
                                    <select
                                        value={m.role || "MEMBER"}
                                        onChange={async (e) => {
                                            try {
                                                await updateMemberRole({
                                                    groupId,
                                                    userId: user._id,
                                                    role: e.target.value
                                                }).unwrap();
                                                toast.success(`Role updated to ${e.target.value}`);
                                            } catch (err: any) {
                                                toast.error(err?.data?.message || "Failed to update role");
                                            }
                                        }}
                                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500 text-slate-600 font-medium"
                                    >
                                        <option value="MEMBER">Member</option>
                                        <option value="LEAD">Lead</option>
                                        <option value="CO-LEAD">Co-Lead</option>
                                    </select>
                                    
                                    {user.phone && (
                                    <a
                                        href={`https://wa.me/${formatPhone(user.phone)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-7 h-7 rounded-md bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 text-sm transition-all"
                                        title="WhatsApp"
                                    >
                                        <FaWhatsapp />
                                    </a>
                                )}
                                <a
                                    href={`mailto:${user.email}`}
                                    className="w-7 h-7 rounded-md bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 text-xs transition-all"
                                    title="Email"
                                >
                                    <FaEnvelope />
                                </a>
                                <button
                                    onClick={() => handleRemove(user._id, user.name)}
                                    className="w-7 h-7 rounded-md bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 text-sm transition-all"
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
    const [updateMemberRole] = useUpdateMemberRoleMutation();

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
                    <h2 className="text-2xl font-bold text-slate-800">Teams</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        {groups?.length || 0} team{(groups?.length || 0) !== 1 ? "s" : ""}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Export Buttons */}
                    <button
                        onClick={exportToPDF}
                        disabled={selectedTeamId ? (!teamMembers || teamMembers.length === 0) : (!groups || groups.length === 0)}
                        className="flex items-center gap-2 bg-white hover:bg-slate-50 text-red-600 px-4 py-2.5 rounded-lg border border-red-100 hover:border-red-200 transition-all text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaFilePdf /> PDF
                    </button>
                    <button
                        onClick={exportToExcel}
                        disabled={selectedTeamId ? (!teamMembers || teamMembers.length === 0) : (!groups || groups.length === 0)}
                        className="flex items-center gap-2 bg-white hover:bg-slate-50 text-green-600 px-4 py-2.5 rounded-lg border border-green-100 hover:border-green-200 transition-all text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaFileExcel /> Excel
                    </button>

                    {!selectedTeamId && (
                         <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 transition-all text-sm font-medium"
                        >
                            <MdAdd className="text-lg" /> New Team
                        </button>
                    )}
                </div>
            </div>

            {/* Team Filters (Chips) */}
            <div className="flex flex-wrap gap-2 mb-6 pb-2 border-b border-slate-200">
                <button
                    onClick={() => setSelectedTeamId(null)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedTeamId === null
                            ? "bg-slate-800 text-white shadow-md shadow-slate-500/20"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
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
                                ? "bg-slate-800 text-white shadow-md shadow-slate-500/20"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
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
                     <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <MdGroups className="text-blue-500" />
                        {getSelectedTeamName()}
                        <span className="text-sm font-normal text-slate-400 ml-2">
                            ({teamMembers?.length || 0} members)
                        </span>
                     </h3>

                    {loadingMembers ? (
                         <div className="text-center py-12 text-slate-400 animate-pulse">Loading members...</div>
                    ) : !teamMembers || teamMembers.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                            <MdPersonAdd className="text-5xl text-slate-200 mx-auto mb-4" />
                             <p className="text-slate-800 font-medium mb-1">No members in this team yet.</p>
                             <p className="text-slate-500 text-sm">
                                Switch to "All Teams" view and expand this team to add members.
                             </p>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                                        <th className="p-4 font-semibold">Name</th>
                                        <th className="p-4 font-semibold">Email</th>
                                    <th className="p-4 font-semibold hidden md:table-cell">Phone</th>
    
                                        <th className="p-4 font-semibold hidden sm:table-cell">Joined Date</th>
                                        <th className="p-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {teamMembers.map((member) => {
                                         const user = typeof member.user_id === "string" ? null : member.user_id;
                                         if (!user) return null;
                                        return (
                                            <tr key={member._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-bold">
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-slate-900">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-slate-600">{user.email}</td>
                                                <td className="p-4 text-sm text-slate-500 hidden md:table-cell">
                                                    {user.phone ? (
                                                        <a href={`https://wa.me/${formatPhone(user.phone)}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 flex items-center gap-1">
                                                            <FaWhatsapp className="text-green-500" /> {user.phone}
                                                        </a>
                                                    ) : "N/A"}
                                                </td>
                                                <td className="p-4 text-sm text-slate-500 hidden sm:table-cell">
                                                    {new Date(member.joined_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <select
                                                            value={member.role || "MEMBER"}
                                                            onChange={async (e) => {
                                                                try {
                                                                    await updateMemberRole({
                                                                        groupId: selectedTeamId,
                                                                        userId: user._id,
                                                                        role: e.target.value
                                                                    }).unwrap();
                                                                    toast.success(`Role updated to ${e.target.value}`);
                                                                } catch (err: any) {
                                                                    toast.error(err?.data?.message || "Failed to update role");
                                                                }
                                                            }}
                                                            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-blue-500 text-slate-600 font-medium mr-2"
                                                        >
                                                            <option value="MEMBER">Member</option>
                                                            <option value="LEAD">Lead</option>
                                                            <option value="CO-LEAD">Co-Lead</option>
                                                            <option value="GENERAL SECRETARY">Gen. Secretary</option>
                                                        </select>

                                                        <a href={`mailto:${user.email}`} className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all">
                                                            <FaEnvelope />
                                                        </a>
                                                        <button
                                                            onClick={() => handleRemoveMember(user._id, selectedTeamId)}
                                                            className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all"
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
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                        <MdGroups className="text-5xl text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Teams Yet</h3>
                        <p className="text-slate-500 text-sm">
                            Create your first team to organize your society members.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Team Name</th>
                                    <th className="p-4 font-semibold">Members</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {groups.map((group) => (
                                    <React.Fragment key={group._id}>
                                        {editingGroup === group._id ? (
                                            <tr>
                                                <td colSpan={4} className="p-4 bg-slate-50">
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
                                            <tr className="hover:bg-slate-50 transition-colors group">
                                                <td className="p-4">
                                                    <div
                                                        className="flex items-center gap-3 cursor-pointer"
                                                        onClick={() =>
                                                            setExpandedGroup(expandedGroup === group._id ? null : group._id)
                                                        }
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                                                            <MdGroups className="text-xl" />
                                                        </div>
                                                        <span className="font-semibold text-slate-800">{group.name}</span>
                                                        {expandedGroup === group._id ? (
                                                            <MdExpandLess className="text-slate-400 text-xl" />
                                                        ) : (
                                                            <MdExpandMore className="text-slate-400 text-xl" />
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="p-4">
                                                    <span className="text-sm text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 font-medium">
                                                        {group.memberCount || 0} Members
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditingGroup(group._id)}
                                                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all border border-slate-100"
                                                            title="Edit team"
                                                        >
                                                            <MdEdit className="text-base" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(group._id, group.name)}
                                                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 flex items-center justify-center text-slate-500 hover:text-red-500 transition-all border border-slate-100 hover:border-red-100"
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
                                                    <div className="bg-slate-50/50 border-y border-slate-100 px-4 py-4 animate-in slide-in-from-top-2 duration-200">
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
