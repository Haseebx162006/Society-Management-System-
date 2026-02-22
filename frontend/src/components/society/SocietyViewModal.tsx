"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Crown, Users, Shield, Lock, ChevronRight } from "lucide-react";
import Modal from "../ui/Modal";
import { useState } from "react";
import { useGetMyGroupMembershipsQuery } from "../../lib/features/groups/groupApiSlice";

interface SocietyViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    society: any;
    members: any[];
    currentUserMember: any;
}

export default function SocietyViewModal({
    isOpen,
    onClose,
    society,
    members,
    currentUserMember,
}: SocietyViewModalProps) {
    const { data: myGroupMemberships } = useGetMyGroupMembershipsQuery();

    const [selectedTeam, setSelectedTeam] = useState<any | null>(null);

    const teamMembers = selectedTeam
        ? members.filter((m) => m.group_id?._id === selectedTeam._id || m.group_id === selectedTeam._id)
        : [];

    const president = members.find((m) => m.role === "PRESIDENT");

    const myGroupIds = myGroupMemberships
        ?.filter(m => {
            const sId = typeof m.society_id === 'object' ? m.society_id._id : m.society_id;
            return sId === society._id;
        })
        .map(m => typeof m.group_id === 'object' ? m.group_id._id : m.group_id) || [];

    const handleTeamClick = (group: any) => {        
        const isMyTeam = myGroupIds.includes(group._id);
        
        if (isMyTeam) {
            setSelectedTeam(group);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                setSelectedTeam(null);
                onClose();
            }}
            title={selectedTeam ? selectedTeam.name : society.name}
            size="lg"
        >
            <div className="space-y-6">
                <AnimatePresence mode="wait">
                    {selectedTeam ? (
                        <motion.div
                            key="team-view"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <button
                                onClick={() => setSelectedTeam(null)}
                                className="text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1 mb-4"
                            >
                                ← Back to Society Overview
                            </button>

                            <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
                                {teamMembers.length > 0 ? (
                                    teamMembers.map((member) => (
                                        <div
                                            key={member._id}
                                            className="flex items-center justify-between p-4 rounded-xl bg-stone-50 border border-stone-100"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                                    {member.user_id?.name?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-stone-900">
                                                        {member.user_id?.name || "Unknown User"}
                                                    </p>
                                                    <p className="text-xs text-stone-500">
                                                        {member.user_id?.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100">
                                                {member.role}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-stone-500 text-center py-8">
                                        No members found in this team.
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="society-view"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100/50">
                                <h4 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-orange-500" />
                                    Society President
                                </h4>
                                {president ? (
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-xl font-bold text-orange-600 border-2 border-white">
                                            {president.user_id?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-stone-900">
                                                {president.user_id?.name}
                                            </p>
                                            <p className="text-orange-600 text-sm font-medium">
                                                Leading {society.name}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-stone-500 italic">No President assigned.</p>
                                )}
                            </div>

                            <div>
                                <h4 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-stone-400" />
                                    Teams & Departments
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {society.groups?.map((group: any) => {
                                        const isMyTeam = myGroupIds.includes(group._id);

                                        return (
                                            <button
                                                key={group._id}
                                                onClick={() => handleTeamClick(group)}
                                                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                                                    isMyTeam
                                                        ? "bg-white border-orange-200 shadow-sm hover:shadow-md hover:border-orange-300 cursor-pointer group"
                                                        : "bg-stone-50 border-stone-100 opacity-70 cursor-not-allowed"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                            isMyTeam
                                                                ? "bg-orange-100 text-orange-600"
                                                                : "bg-stone-200 text-stone-400"
                                                        }`}
                                                    >
                                                        {isMyTeam ? (
                                                            <Shield className="w-5 h-5" />
                                                        ) : (
                                                            <Lock className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p
                                                            className={`font-semibold ${
                                                                isMyTeam ? "text-stone-900" : "text-stone-500"
                                                            }`}
                                                        >
                                                            {group.name}
                                                        </p>
                                                        {isMyTeam && (
                                                            <p className="text-xs text-orange-600 font-medium">
                                                                Your Team
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {isMyTeam && (
                                                    <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-orange-500 transition-colors" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Modal>
    );
}
