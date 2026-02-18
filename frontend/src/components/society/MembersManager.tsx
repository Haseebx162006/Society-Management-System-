"use client";

import React, { useState } from "react";
import {
    useGetSocietyMembersQuery,
    useGetGroupsInSocietyQuery,
    useAddMemberToGroupMutation,
} from "@/lib/features/groups/groupApiSlice";
import { FaWhatsapp, FaEnvelope, FaSearch, FaUserPlus, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { MdGroups, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface MembersManagerProps {
    societyId: string;
}

const ITEMS_PER_PAGE = 10;

const MembersManager: React.FC<MembersManagerProps> = ({ societyId }) => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [teamDropdownOpen, setTeamDropdownOpen] = useState<string | null>(null);

    const { data, isLoading, error } = useGetSocietyMembersQuery({
        societyId,
        page,
        limit: ITEMS_PER_PAGE,
        search,
    });

    const { data: groups } = useGetGroupsInSocietyQuery(societyId);
    const [addMemberToGroup] = useAddMemberToGroupMutation();

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
        // Remove non-digit characters
        let cleaned = phone.replace(/[^\d+]/g, "");
        if (!cleaned.startsWith("+")) {
            cleaned = "+" + cleaned;
        }
        return cleaned;
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "PRESIDENT":
                return "bg-amber-100 text-amber-700 border-amber-200";
            case "LEAD":
                return "bg-purple-100 text-purple-700 border-purple-200";
            case "CO-LEAD":
                return "bg-indigo-100 text-indigo-700 border-indigo-200";
            case "GENERAL SECRETARY":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            default:
                return "bg-blue-100 text-blue-700 border-blue-200";
        }
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

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Members</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        {pagination.total} total member{pagination.total !== 1 ? "s" : ""}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
                    {/* Search */}
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

                    {/* Export Buttons */}
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

            {/* Members Table */}
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
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* WhatsApp */}
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

                                                {/* Email */}
                                                <a
                                                    href={`mailto:${user.email}`}
                                                    className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 hover:text-blue-700 transition-all shadow-sm"
                                                    title="Email"
                                                >
                                                    <FaEnvelope className="text-sm" />
                                                </a>

                                                {/* Add to Team dropdown */}
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

            {/* Pagination */}
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
        </div>
    );
};

export default MembersManager;
