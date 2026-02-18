"use client";

import React, { useState } from "react";
import {
    useGetSocietyMembersQuery,
    useGetGroupsInSocietyQuery,
    useAddMemberToGroupMutation,
} from "@/lib/features/groups/groupApiSlice";
import { FaWhatsapp, FaEnvelope, FaSearch, FaUserPlus } from "react-icons/fa";
import { MdGroups, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { toast } from "react-hot-toast";

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
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to add member to team");
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
                return "bg-amber-500/20 text-amber-300 border-amber-500/30";
            case "LEAD":
                return "bg-purple-500/20 text-purple-300 border-purple-500/30";
            case "CO-LEAD":
                return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
            case "GENERAL SECRETARY":
                return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
            default:
                return "bg-blue-500/20 text-blue-300 border-blue-500/30";
        }
    };

    if (isLoading && page === 1) {
        return (
            <div className="flex items-center justify-center h-64 text-blue-400 animate-pulse">
                Loading members...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-400">
                Failed to load members. Please try again.
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-blue-200">Members</h2>
                    <p className="text-blue-400/60 text-sm mt-1">
                        {pagination.total} total member{pagination.total !== 1 ? "s" : ""}
                    </p>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/50 text-sm" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by name or email..."
                            className="bg-[#1e293b]/80 border border-blue-500/20 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-blue-400/40 focus:outline-none focus:border-blue-500/50 w-64"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-4 py-2 rounded-lg border border-blue-500/30 transition-all text-sm"
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
                            className="text-sm text-blue-400/60 hover:text-blue-300"
                        >
                            Clear
                        </button>
                    )}
                </form>
            </div>

            {/* Members List */}
            {members.length === 0 ? (
                <div className="bg-[#1e293b]/50 border border-blue-500/10 rounded-2xl p-12 text-center">
                    <MdGroups className="text-5xl text-blue-500/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-blue-200 mb-2">No Members Found</h3>
                    <p className="text-blue-400/60 text-sm">
                        {search ? "No members match your search." : "Approved join requests will appear here."}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {members.map((member) => {
                        const user = member.user_id;
                        if (!user || typeof user === "string") return null;

                        return (
                            <div
                                key={member._id}
                                className="bg-[#1e293b]/50 border border-blue-500/10 rounded-xl p-4 hover:border-blue-500/25 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    {/* Left: Avatar + Info */}
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-semibold text-white truncate">
                                                    {user.name}
                                                </h4>
                                                <span
                                                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${getRoleBadgeColor(member.role)}`}
                                                >
                                                    {member.role}
                                                </span>
                                            </div>
                                            <p className="text-sm text-blue-400/60 truncate">{user.email}</p>
                                            <p className="text-xs text-blue-400/40 mt-0.5">
                                                Joined {new Date(member.assigned_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center gap-2 shrink-0 ml-4">
                                        {/* WhatsApp */}
                                        {user.phone && (
                                            <a
                                                href={`https://wa.me/${formatPhone(user.phone)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 rounded-lg bg-green-500/10 hover:bg-green-500/25 border border-green-500/20 flex items-center justify-center text-green-400 hover:text-green-300 transition-all"
                                                title="WhatsApp"
                                            >
                                                <FaWhatsapp className="text-lg" />
                                            </a>
                                        )}

                                        {/* Email */}
                                        <a
                                            href={`mailto:${user.email}`}
                                            className="w-9 h-9 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:text-blue-300 transition-all"
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
                                                    className="w-9 h-9 rounded-lg bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/20 flex items-center justify-center text-purple-400 hover:text-purple-300 transition-all"
                                                    title="Add to team"
                                                >
                                                    <FaUserPlus className="text-sm" />
                                                </button>

                                                {teamDropdownOpen === member._id && (
                                                    <div className="absolute right-0 top-11 z-20 w-56 bg-[#1e293b] border border-blue-500/20 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                        <p className="px-3 py-1.5 text-xs text-blue-400/60 font-semibold uppercase tracking-wider">
                                                            Add to Team
                                                        </p>
                                                        {groups.map((group) => (
                                                            <button
                                                                key={group._id}
                                                                onClick={() => handleAddToTeam(user._id, group._id)}
                                                                className="w-full text-left px-3 py-2 text-sm text-blue-200 hover:bg-blue-500/10 transition-colors"
                                                            >
                                                                {group.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-9 h-9 rounded-lg bg-[#1e293b]/50 border border-blue-500/10 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
                                    <span className="text-blue-500/30 px-1">...</span>
                                )}
                                <button
                                    onClick={() => setPage(p)}
                                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === page
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                            : "bg-[#1e293b]/50 border border-blue-500/10 text-blue-400 hover:bg-blue-500/10"
                                        }`}
                                >
                                    {p}
                                </button>
                            </React.Fragment>
                        ))}

                    <button
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="w-9 h-9 rounded-lg bg-[#1e293b]/50 border border-blue-500/10 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <MdChevronRight className="text-xl" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default MembersManager;
