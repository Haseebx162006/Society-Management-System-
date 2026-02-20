"use client";

import React, { useState } from "react";
import {
    useGetSocietyMembersQuery,
    useGetGroupsInSocietyQuery,
    useAddMemberToGroupMutation,
} from "@/lib/features/groups/groupApiSlice";
import { useUpdateSocietyMemberRoleMutation } from "@/lib/features/societies/societyApiSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { FaWhatsapp, FaEnvelope, FaSearch, FaUserPlus, FaFilePdf, FaFileExcel, FaTimes } from "react-icons/fa";
import { MdGroups, MdChevronLeft, MdChevronRight, MdEdit, MdStar, MdManageAccounts, MdAdminPanelSettings, MdAccountBalance, MdEvent, MdPeople, MdShield } from "react-icons/md";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface MembersManagerProps {
    societyId: string;
}

const ITEMS_PER_PAGE = 10;

const ROLE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string; borderColor: string; ringColor: string; description: string; category: string }> = {
    PRESIDENT: {
        icon: <MdStar className="text-base" />,
        color: "text-amber-700",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        ringColor: "ring-amber-400",
        description: "Full control over the society",
        category: "Leadership",
    },
    "GENERAL SECRETARY": {
        icon: <MdAdminPanelSettings className="text-base" />,
        color: "text-emerald-700",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        ringColor: "ring-emerald-400",
        description: "Manages day-to-day operations",
        category: "Leadership",
    },
    LEAD: {
        icon: <MdManageAccounts className="text-base" />,
        color: "text-purple-700",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        ringColor: "ring-purple-400",
        description: "Leads a specific team",
        category: "Management",
    },
    "CO-LEAD": {
        icon: <MdShield className="text-base" />,
        color: "text-indigo-700",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
        ringColor: "ring-indigo-400",
        description: "Assists the team lead",
        category: "Management",
    },
    "FINANCE MANAGER": {
        icon: <MdAccountBalance className="text-base" />,
        color: "text-teal-700",
        bgColor: "bg-teal-50",
        borderColor: "border-teal-200",
        ringColor: "ring-teal-400",
        description: "Manages society finances",
        category: "Management",
    },
    "EVENT MANAGER": {
        icon: <MdEvent className="text-base" />,
        color: "text-orange-700",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        ringColor: "ring-orange-400",
        description: "Organizes and manages events",
        category: "Management",
    },
    MEMBER: {
        icon: <MdPeople className="text-base" />,
        color: "text-slate-600",
        bgColor: "bg-slate-50",
        borderColor: "border-slate-200",
        ringColor: "ring-slate-400",
        description: "Regular society member",
        category: "General",
    },
};

const ROLE_ORDER = ["GENERAL SECRETARY", "FINANCE MANAGER", "EVENT MANAGER", "MEMBER"];

const MembersManager: React.FC<MembersManagerProps> = ({ societyId }) => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [teamDropdownOpen, setTeamDropdownOpen] = useState<string | null>(null);
    const [roleModalUser, setRoleModalUser] = useState<{
        _id: string;
        user_id: { _id: string; name: string; email: string; phone?: string } | string;
        role: string;
        assigned_at: string;
    } | null>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isUpdatingRole, setIsUpdatingRole] = useState(false);
    const [confirmTransfer, setConfirmTransfer] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const { user: currentUser } = useSelector((state: RootState) => state.auth);

    const { data, isLoading, error } = useGetSocietyMembersQuery({
        societyId,
        page,
        limit: ITEMS_PER_PAGE,
        search,
    });

    const { data: groups } = useGetGroupsInSocietyQuery(societyId);
    const [addMemberToGroup] = useAddMemberToGroupMutation();
    const [updateMemberRole] = useUpdateSocietyMemberRoleMutation();

    const members = data?.members || [];
    const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0, limit: ITEMS_PER_PAGE };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleAddToTeam = async (userId: string, groupId: string) => {
        try {
            await addMemberToGroup({ groupId, user_id: userId }).unwrap();
            toast.success("Member added to team!");
            setTeamDropdownOpen(null);
        } catch (err) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || "Failed to add member to team");
        }
    };

    const formatPhone = (phone: string) => {
        let cleaned = phone.replace(/[^\d+]/g, "");
        if (!cleaned.startsWith("+")) {
            cleaned = "+" + cleaned;
        }
        return cleaned;
    };

    const getRoleBadgeColor = (role: string) => {
        const config = ROLE_CONFIG[role];
        if (config) return `${config.bgColor} ${config.color} ${config.borderColor}`;
        return "bg-blue-100 text-blue-700 border-blue-200";
    };

    const handleRoleUpdate = async (role: string) => {
        if (!roleModalUser) return;
        if (role === roleModalUser.role) {
            setIsRoleModalOpen(false);
            return;
        }

        if (role === "PRESIDENT") {
            setSelectedRole(role);
            setConfirmTransfer(true);
            return;
        }

        await executeRoleUpdate(role);
    };

    const executeRoleUpdate = async (role: string) => {
        if (!roleModalUser) return;
        const targetUserId = typeof roleModalUser.user_id === "string"
            ? roleModalUser.user_id
            : roleModalUser.user_id?._id;

        setIsUpdatingRole(true);
        try {
            await updateMemberRole({
                societyId,
                userId: targetUserId,
                role: role,
            }).unwrap();
            toast.success(`Role updated to ${role}`);
            setIsRoleModalOpen(false);
            setConfirmTransfer(false);
            setSelectedRole(null);
        } catch {
            toast.error("Failed to update role");
        } finally {
            setIsUpdatingRole(false);
        }
    };

    const openRoleModal = (member: typeof roleModalUser) => {
        setRoleModalUser(member);
        setIsRoleModalOpen(true);
        setConfirmTransfer(false);
        setSelectedRole(null);
    };

    const exportToPDF = () => {
        if (!members.length) return;

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Society Members", 14, 22);

        const tableData = members.map((member) => {
            const user = member.user_id;
            if (!user || typeof user === "string") return [];
            return [
                user.name,
                member.role,
                user.email,
                user.phone || "N/A",
                new Date(member.assigned_at).toLocaleDateString(),
            ];
        });

        autoTable(doc, {
            head: [["Name", "Role", "Email", "Phone", "Joined Date"]],
            body: tableData,
            startY: 30,
        });

        doc.save("society_members.pdf");
    };

    const exportToExcel = () => {
        if (!members.length) return;

        const worksheetData = members.map((member) => {
            const user = member.user_id;
            if (!user || typeof user === "string") return {};
            return {
                Name: user.name,
                Role: member.role,
                Email: user.email,
                Phone: user.phone || "N/A",
                "Joined Date": new Date(member.assigned_at).toLocaleDateString(),
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
        saveAs(data, "society_members.xlsx");
    };

    if (isLoading && page === 1) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400 animate-pulse">
                Loading members...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500">
                Failed to load members. Please try again.
            </div>
        );
    }

    const roleModalUserName = roleModalUser && typeof roleModalUser.user_id === "object" ? roleModalUser.user_id.name : "";

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Members</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        {pagination.total} total member{pagination.total !== 1 ? "s" : ""}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                        <div className="relative grow sm:grow-0">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full sm:w-64 bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-white hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg border border-slate-200 transition-all text-sm shadow-sm hover:shadow-md"
                        >
                            Search
                        </button>
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setSearchInput("");
                                    setPage(1);
                                }}
                                className="text-sm text-slate-500 hover:text-slate-700 whitespace-nowrap"
                            >
                                Clear
                            </button>
                        )}
                    </form>

                    <div className="flex gap-2">
                        <button
                            onClick={exportToPDF}
                            disabled={members.length === 0}
                            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg border border-red-200 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <FaFilePdf /> PDF
                        </button>
                        <button
                            onClick={exportToExcel}
                            disabled={members.length === 0}
                            className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-600 px-4 py-2 rounded-lg border border-green-200 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <FaFileExcel /> Excel
                        </button>
                    </div>
                </div>
            </div>

            {members.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                    <MdGroups className="text-5xl text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No Members Found</h3>
                    <p className="text-slate-500 text-sm">
                        {search ? "No members match your search." : "Approved join requests will appear here."}
                    </p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden overflow-x-auto shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">User</th>
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold hidden md:table-cell">Details</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {members.map((member) => {
                                const user = member.user_id;
                                if (!user || typeof user === "string") return null;

                                return (
                                    <tr key={member._id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-900">{user.name}</h4>
                                                    <p className="text-xs text-slate-500 break-all">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider whitespace-nowrap ${getRoleBadgeColor(member.role)}`}
                                            >
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <div className="space-y-1">
                                                <p className="text-xs text-slate-500">
                                                    Joined: {new Date(member.assigned_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                                </p>
                                                {user.phone && <p className="text-xs text-slate-500">Phone: {user.phone}</p>}

                                                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
                                                    <span className="text-xs text-slate-500 font-medium">Role:</span>
                                                    <button
                                                        onClick={() => openRoleModal(member)}
                                                        disabled={member.role === 'PRESIDENT' && (currentUser?._id === (typeof member.user_id === 'object' ? member.user_id._id : member.user_id))}
                                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                                                            member.role === 'PRESIDENT' && (currentUser?._id === (typeof member.user_id === 'object' ? member.user_id._id : member.user_id))
                                                            ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-100'
                                                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 hover:shadow-md'
                                                        }`}
                                                    >
                                                        <MdEdit className="text-sm" />
                                                        Change Role
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.phone && (
                                                    <a
                                                        href={`https://wa.me/${formatPhone(user.phone)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 flex items-center justify-center text-green-600 hover:text-green-700 transition-all shadow-sm"
                                                        title="WhatsApp"
                                                    >
                                                        <FaWhatsapp className="text-lg" />
                                                    </a>
                                                )}

                                                <a
                                                    href={`mailto:${user.email}`}
                                                    className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 hover:text-blue-700 transition-all shadow-sm"
                                                    title="Email"
                                                >
                                                    <FaEnvelope className="text-sm" />
                                                </a>

                                                {groups && groups.length > 0 && member.role !== "PRESIDENT" && (
                                                    <div className="relative">
                                                        <button
                                                            onClick={() =>
                                                                setTeamDropdownOpen(
                                                                    teamDropdownOpen === member._id ? null : member._id
                                                                )
                                                            }
                                                            className="w-8 h-8 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 hover:text-purple-700 transition-all shadow-sm"
                                                            title="Add to team"
                                                        >
                                                            <FaUserPlus className="text-sm" />
                                                        </button>

                                                        {teamDropdownOpen === member._id && (
                                                            <div className="absolute right-0 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                                                <p className="px-3 py-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider text-left bg-slate-50 border-b border-slate-100 mb-1">
                                                                    Add to Team
                                                                </p>
                                                                {groups.map((group) => (
                                                                    <button
                                                                        key={group._id}
                                                                        onClick={() => handleAddToTeam(user._id, group._id)}
                                                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors truncate"
                                                                    >
                                                                        {group.name}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <MdChevronLeft className="text-xl" />
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                            if (pagination.totalPages <= 7) return true;
                            if (p === 1 || p === pagination.totalPages) return true;
                            if (Math.abs(p - page) <= 1) return true;
                            return false;
                        })
                        .map((p, idx, arr) => (
                            <React.Fragment key={p}>
                                {idx > 0 && arr[idx - 1] !== p - 1 && (
                                    <span className="text-slate-400 px-1">...</span>
                                )}
                                <button
                                    onClick={() => setPage(p)}
                                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all shadow-sm ${p === page
                                            ? "bg-blue-600 text-white shadow-blue-200"
                                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    {p}
                                </button>
                            </React.Fragment>
                        ))}

                    <button
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <MdChevronRight className="text-xl" />
                    </button>
                </div>
            )}

            {isRoleModalOpen && roleModalUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700" />
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E\")" }} />
                            <div className="relative px-6 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold border border-white/20">
                                        {roleModalUserName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white tracking-tight">Change Role</h3>
                                        <p className="text-blue-100 text-sm mt-0.5 truncate max-w-[200px]">{roleModalUserName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsRoleModalOpen(false);
                                        setConfirmTransfer(false);
                                        setSelectedRole(null);
                                    }}
                                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all border border-white/10"
                                >
                                    <FaTimes className="text-sm" />
                                </button>
                            </div>
                        </div>

                        {confirmTransfer ? (
                            <div className="p-6">
                                <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-5">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                                            <MdStar className="text-red-600 text-xl" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-red-800 text-sm">Transfer Presidency</h4>
                                            <p className="text-red-600 text-xs mt-1.5 leading-relaxed">
                                                You are about to transfer your President role to <span className="font-bold">{roleModalUserName}</span>. 
                                                This action cannot be undone. You will lose all presidential privileges.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setConfirmTransfer(false);
                                            setSelectedRole(null);
                                        }}
                                        disabled={isUpdatingRole}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => selectedRole && executeRoleUpdate(selectedRole)}
                                        disabled={isUpdatingRole}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all shadow-sm shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isUpdatingRole ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Transferring...
                                            </>
                                        ) : (
                                            "Confirm Transfer"
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-5 space-y-1.5 max-h-[420px] overflow-y-auto">
                                    {(() => {
                                        let lastCategory = "";
                                        return ROLE_ORDER.map((role) => {
                                            const config = ROLE_CONFIG[role];
                                            if (!config) return null;
                                            const isCurrent = role === roleModalUser.role;
                                            const showCategory = config.category !== lastCategory;
                                            lastCategory = config.category;

                                            return (
                                                <React.Fragment key={role}>
                                                    {showCategory && (
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-3 pb-1 px-1">
                                                            {config.category}
                                                        </p>
                                                    )}
                                                    <button
                                                        onClick={() => handleRoleUpdate(role)}
                                                        disabled={isUpdatingRole}
                                                        className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border-2 transition-all duration-200 group relative ${
                                                            isCurrent
                                                                ? `${config.bgColor} ${config.borderColor} ring-2 ${config.ringColor}/30`
                                                                : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                                                        } ${isUpdatingRole ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                                            isCurrent
                                                                ? `${config.bgColor} ${config.color} ring-2 ${config.ringColor}/40`
                                                                : `bg-slate-50 text-slate-400 group-hover:${config.bgColor} group-hover:${config.color}`
                                                        }`}>
                                                            {config.icon}
                                                        </div>
                                                        <div className="flex-1 text-left min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-sm font-bold tracking-wide ${isCurrent ? config.color : "text-slate-800"}`}>
                                                                    {role}
                                                                </span>
                                                                {isCurrent && (
                                                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                                                                        Current
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-400 mt-0.5 truncate">{config.description}</p>
                                                        </div>
                                                        {!isCurrent && (
                                                            <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-blue-400 transition-colors shrink-0" />
                                                        )}
                                                        {isCurrent && (
                                                            <div className={`w-5 h-5 rounded-full ${config.borderColor} border-2 flex items-center justify-center shrink-0`}>
                                                                <div className={`w-2.5 h-2.5 rounded-full ${config.color.replace("text-", "bg-")}`} />
                                                            </div>
                                                        )}
                                                    </button>
                                                </React.Fragment>
                                            );
                                        });
                                    })()}
                                </div>
                                <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end">
                                    <button
                                        onClick={() => {
                                            setIsRoleModalOpen(false);
                                            setConfirmTransfer(false);
                                            setSelectedRole(null);
                                        }}
                                        className="px-5 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembersManager;
