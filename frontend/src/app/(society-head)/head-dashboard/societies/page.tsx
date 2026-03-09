"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  useGetAllSocietiesAdminQuery, 
  useSuspendSocietyMutation, 
  useReactivateSocietyMutation,
  useCreatePresidentMutation,
  useChangeFacultyAdvisorMutation,
  useUpdatePresidentDetailsMutation,
  useGetAllUsersQuery
} from "@/lib/features/societies/societyApiSlice";
import { Users, AlertCircle, CheckCircle2, ArrowRight, ShieldAlert, RotateCcw, XCircle, Search, UserPlus, UserCircle2, Save } from "lucide-react";
import toast from "react-hot-toast";

interface SocietyCardData {
  _id: string;
  name: string;
  category: string;
  description: string;
  status: string;
  membersCount: number;
  renewal_approved: boolean;
  president?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  faculty_advisor?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export default function SocietyHeadSocietiesPage() {
  const { data: societies = [], isLoading, error } = useGetAllSocietiesAdminQuery(undefined);
  const [suspendSociety] = useSuspendSocietyMutation();
  const [reactivateSociety] = useReactivateSocietyMutation();
  const [createPresident] = useCreatePresidentMutation();
  const [changeFacultyAdvisor] = useChangeFacultyAdvisorMutation();
  const [updatePresidentDetails] = useUpdatePresidentDetailsMutation();
  const { data: allUsers = [] } = useGetAllUsersQuery(undefined);

  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [presidentForm, setPresidentForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [presidentUpdateDetails, setPresidentUpdateDetails] = useState({ phone: "", name: "" });
  
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    societyId: string;
    societyName: string;
    action: 'SUSPEND' | 'REACTIVATE' | 'ADD_PRESIDENT' | 'VIEW_FACULTY' | 'VIEW_PRESIDENT';
    data?: any;
  }>({
    isOpen: false,
    societyId: '',
    societyName: '',
    action: 'SUSPEND'
  });

  const handleAction = async () => {
    try {
      if (modalConfig.action === 'SUSPEND') {
        await suspendSociety(modalConfig.societyId).unwrap();
        toast.success(`${modalConfig.societyName} suspended successfully`);
      } else if (modalConfig.action === 'REACTIVATE') {
        await reactivateSociety(modalConfig.societyId).unwrap();
        toast.success(`${modalConfig.societyName} reactivated successfully`);
      } else if (modalConfig.action === 'ADD_PRESIDENT') {
        await createPresident({ societyId: modalConfig.societyId, ...presidentForm }).unwrap();
        toast.success(`President account created and linked to ${modalConfig.societyName}`);
        setPresidentForm({ name: "", email: "", phone: "", password: "" });
      } else if (modalConfig.action === 'VIEW_PRESIDENT') {
        await updatePresidentDetails({ societyId: modalConfig.societyId, phone: presidentUpdateDetails.phone, name: presidentUpdateDetails.name }).unwrap();
        toast.success(`President details updated successfully`);
      }
      setModalConfig({ ...modalConfig, isOpen: false });
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Action failed");
    }
  };

  const handleAdvisorChange = async (newAdvisorId: string) => {
    try {
        await changeFacultyAdvisor({ societyId: modalConfig.societyId, new_advisor_id: newAdvisorId }).unwrap();
        toast.success("Faculty Advisor updated successfully");
        setModalConfig({ ...modalConfig, isOpen: false });
    } catch (err) {
        const error = err as { data?: { message?: string } };
        toast.error(error?.data?.message || "Failed to update Faculty Advisor");
    }
  };

  const filteredSocieties = (societies as SocietyCardData[]).filter((s: SocietyCardData) => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 font-(--font-family-poppins)">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Society Management</h1>
          <p className="text-sm text-stone-500 mt-1">Manage and monitor all societies across the campus.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search societies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <p className="font-bold">Failed to load societies. Please try again later.</p>
          </div>
        ) : filteredSocieties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border text-stone-400 border-stone-200 border-dashed rounded-3xl p-12 text-center"
          >
            {searchQuery ? (
              <>
                <Search className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="font-bold text-lg text-stone-900">No Match Found</p>
                <p className="text-sm mt-1">We couldn&apos;t find any society matching &quot;{searchQuery}&quot;</p>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="font-bold text-lg text-stone-900">No Societies Found</p>
                <p className="text-sm mt-1">There are no societies currently registered.</p>
              </>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSocieties.map((society: SocietyCardData, index: number) => (
              <motion.div
                key={society._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Decorative Top Accent */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-linear-to-r ${society.status === 'ACTIVE' ? 'from-orange-400 to-orange-600' : 'from-red-400 to-red-600'}`} />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-xl text-stone-900 tracking-tight leading-tight group-hover:text-orange-600 transition-colors">
                      {society.name}
                    </h3>
                    {society.status !== 'ACTIVE' && (
                      <span className="flex items-center gap-1 text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        <XCircle size={10} /> Suspended
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="inline-flex px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wider">
                      {society.category}
                    </div>
                    {society.renewal_approved ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm shadow-emerald-100">
                        <CheckCircle2 size={10} /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-medium bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm shadow-amber-100">
                        <AlertCircle size={10} /> Not Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-500 line-clamp-3 leading-relaxed mb-4">
                    {society.description || "No description provided for this society."}
                  </p>

                  <div className="space-y-3 mt-auto">
                    {/* Faculty Advisor Section */}
                    <div 
                      onClick={() => {
                        setModalConfig({
                          isOpen: true,
                          societyId: society._id,
                          societyName: society.name,
                          action: 'VIEW_FACULTY',
                          data: society.faculty_advisor
                        });
                        setUserSearchQuery("");
                      }}
                      className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-3 cursor-pointer hover:bg-blue-100/80 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Users size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium text-blue-500 uppercase tracking-wider">Faculty Advisor</p>
                        <p className="text-sm font-semibold text-stone-800 line-clamp-1">
                          {society.faculty_advisor?.name || "Not Assigned"}
                        </p>
                      </div>
                    </div>

                    {/* President Section */}
                    <div 
                        className={`p-3 rounded-xl border flex flex-col justify-center ${society.president ? 'bg-stone-50 border-stone-100 cursor-pointer hover:bg-stone-100 transition-colors' : 'bg-red-50/50 border-red-100'}`}
                        onClick={() => {
                            if (society.president) {
                              setPresidentUpdateDetails({ 
                                  phone: society.president.phone || "",
                                  name: society.president.name || ""
                              });
                              setModalConfig({
                                isOpen: true,
                                societyId: society._id,
                                societyName: society.name,
                                action: 'VIEW_PRESIDENT',
                                data: society.president
                              });
                            }
                        }}
                    >
                      {society.president ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <UserCircle2 size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">President</p>
                            <p className="text-sm font-semibold text-stone-800 line-clamp-1">{society.president.name}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-stone-400">No President Linked</p>
                          <button 
                            onClick={() => setModalConfig({
                              isOpen: true,
                              societyId: society._id,
                              societyName: society.name,
                              action: 'ADD_PRESIDENT'
                            })}
                            className="flex items-center gap-1.5 text-[10px] font-black bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            <UserPlus size={12} /> Add
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-500">
                    <Users className="w-4 h-4 text-stone-400" />
                    <span className="text-sm font-semibold">{society.membersCount || 0} Members</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {society.status === 'ACTIVE' ? (
                      <button
                        onClick={() => setModalConfig({
                          isOpen: true,
                          societyId: society._id,
                          societyName: society.name,
                          action: 'SUSPEND'
                        })}
                        className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => setModalConfig({
                          isOpen: true,
                          societyId: society._id,
                          societyName: society.name,
                          action: 'REACTIVATE'
                        })}
                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reactivate
                      </button>
                    )}
                    <Link 
                      href={`/societies/${society._id}`}
                      className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-orange-700 transition-colors bg-stone-50 hover:bg-orange-50 px-3 py-1.5 rounded-lg border border-stone-100"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Confirmation/Action Modal */}
      <AnimatePresence>
        {modalConfig.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative bg-white rounded-3xl overflow-hidden shadow-2xl ${
                modalConfig.action === 'ADD_PRESIDENT' || modalConfig.action === 'VIEW_FACULTY' ? 'max-w-2xl w-full' : 'max-w-md w-full p-8'
              }`}
            >
              {modalConfig.action === 'VIEW_FACULTY' ? (
                 <div className="flex flex-col">
                  <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                    <div>
                      <h2 className="text-xl font-black text-stone-900 tracking-tight">Faculty Advisor Details</h2>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-0.5">{modalConfig.societyName}</p>
                    </div>
                    <button 
                      onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                      className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                      {modalConfig.data ? (
                          <div className="space-y-4">
                              <div className="flex items-center gap-4 p-4 border rounded-xl bg-stone-50">
                                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                      <Users size={24} />
                                  </div>
                                  <div>
                                      <p className="font-bold text-stone-900">{modalConfig.data.name}</p>
                                      <p className="text-sm text-stone-500">{modalConfig.data.email}</p>
                                      <p className="text-sm text-stone-500">{modalConfig.data.phone || 'No phone provided'}</p>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="p-4 border rounded-xl bg-red-50 text-red-600">
                              <p className="font-bold">No Faculty Advisor Assigned</p>
                          </div>
                      )}

                      <div className="border-t pt-6">
                          <h3 className="text-sm font-bold text-stone-700 mb-4">Change Faculty Advisor</h3>
                          <div className="relative mb-4">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                              <input 
                                  type="text"
                                  placeholder="Search users by name or email..."
                                  value={userSearchQuery}
                                  onChange={(e) => setUserSearchQuery(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                              />
                          </div>
                          <div className="max-h-60 overflow-y-auto space-y-2">
                              {(allUsers as any[]).filter(u => 
                                  u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                                  u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                              ).map(user => (
                                  <div key={user._id} className="flex items-center justify-between p-3 border rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                                      <div>
                                          <p className="font-semibold text-sm text-stone-800">{user.name}</p>
                                          <p className="text-xs text-stone-500">{user.email}</p>
                                      </div>
                                      <button 
                                          onClick={() => handleAdvisorChange(user._id)}
                                          className="text-xs font-bold text-blue-600 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                                      >
                                          Set Advisor
                                      </button>
                                  </div>
                              ))}
                              {userSearchQuery && (allUsers as any[]).filter(u => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(userSearchQuery.toLowerCase())).length === 0 && (
                                  <p className="text-sm text-stone-500 text-center py-4">No users found.</p>
                              )}
                          </div>
                      </div>
                  </div>
                 </div>
              ) : modalConfig.action === 'VIEW_PRESIDENT' ? (
                <div className="flex flex-col">
                  <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                    <div>
                      <h2 className="text-xl font-black text-stone-900 tracking-tight">President Details</h2>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-0.5">{modalConfig.societyName}</p>
                    </div>
                    <button 
                      onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                      className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                  <div className="p-8 space-y-6">
                      <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                              <UserCircle2 size={32} />
                          </div>
                          <div>
                              <p className="font-bold text-lg text-stone-900">{modalConfig.data?.email}</p>
                              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">Status: Active</p>
                          </div>
                      </div>
                      
                      <div className="space-y-4">
                          <div>
                              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Full Name</label>
                              <input
                                  type="text"
                                  value={presidentUpdateDetails.name}
                                  onChange={(e) => setPresidentUpdateDetails({ ...presidentUpdateDetails, name: e.target.value })}
                                  placeholder="e.g. Muhammad Ali"
                                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                              />
                          </div>
                          <div>
                              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                              <input
                                  type="tel"
                                  value={presidentUpdateDetails.phone}
                                  onChange={(e) => setPresidentUpdateDetails({ ...presidentUpdateDetails, phone: e.target.value })}
                                  placeholder="e.g. +92 300 1234567"
                                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                              />
                          </div>
                      </div>

                      <button
                          onClick={() => handleAction()}
                          disabled={
                              (!presidentUpdateDetails.phone || presidentUpdateDetails.phone === modalConfig.data?.phone) && 
                              (!presidentUpdateDetails.name || presidentUpdateDetails.name === modalConfig.data?.name)
                          }
                          className="w-full mt-2 py-3.5 rounded-xl font-black text-sm text-white bg-stone-900 hover:bg-orange-600 transition-all uppercase tracking-widest shadow-lg disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                      >
                          <Save size={16} /> Save Changes
                      </button>
                  </div>
                </div>
              ) : modalConfig.action === 'ADD_PRESIDENT' ? (
                <div className="flex flex-col">
                  <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                    <div>
                      <h2 className="text-xl font-black text-stone-900 tracking-tight">Create President Account</h2>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-0.5">{modalConfig.societyName}</p>
                    </div>
                    <button 
                      onClick={() => { setModalConfig({ ...modalConfig, isOpen: false }); setPresidentForm({ name: "", email: "", phone: "", password: "" }); }}
                      className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-xs text-stone-500 leading-relaxed">
                      A new user account will be created with these credentials. The president will be required to change their password on first login.
                    </p>
                    {([
                      { label: "Full Name", field: "name", type: "text", placeholder: "e.g. Muhammad Ali" },
                      { label: "Email Address", field: "email", type: "email", placeholder: "e.g. ali@university.edu" },
                      { label: "Phone Number", field: "phone", type: "tel", placeholder: "e.g. +92 300 1234567" },
                      { label: "Temporary Password", field: "password", type: "password", placeholder: "At least 8 characters" },
                    ] as const).map(({ label, field, type, placeholder }) => (
                      <div key={field}>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">{label}</label>
                        <input
                          type={type}
                          value={presidentForm[field]}
                          onChange={(e) => setPresidentForm({ ...presidentForm, [field]: e.target.value })}
                          placeholder={placeholder}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => handleAction()}
                      disabled={!presidentForm.name || !presidentForm.email || !presidentForm.phone || !presidentForm.password}
                      className="w-full py-3.5 rounded-xl font-black text-sm text-white bg-stone-900 hover:bg-orange-600 transition-all uppercase tracking-widest shadow-lg disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                    >
                      <UserPlus size={16} /> Create President Account
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Decorative Background Icon */}
                  <div className={`absolute -top-10 -right-10 opacity-5 ${modalConfig.action === 'SUSPEND' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {modalConfig.action === 'SUSPEND' ? <ShieldAlert size={200} /> : <RotateCcw size={200} />}
                  </div>

                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${modalConfig.action === 'SUSPEND' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {modalConfig.action === 'SUSPEND' ? <ShieldAlert size={32} /> : <RotateCcw size={32} />}
                    </div>

                    <h2 className="text-2xl font-black text-stone-900 mb-2 tracking-tight">
                      {modalConfig.action === 'SUSPEND' ? 'Suspend Society?' : 'Reactivate Society?'}
                    </h2>
                    <p className="text-stone-500 text-sm leading-relaxed mb-8">
                      Are you sure you want to {modalConfig.action?.toLowerCase()} <span className="font-bold text-stone-800">&quot;{modalConfig.societyName}&quot;</span>? 
                      {modalConfig.action === 'SUSPEND' 
                        ? " This will restrict all normal activities and member access for this society temporarily."
                        : " This will restore all features and access for the society and its members."}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                        className="px-6 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAction()}
                        className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                          modalConfig.action === 'SUSPEND' 
                            ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                        }`}
                      >
                        Confirm {modalConfig.action?.charAt(0) + modalConfig.action?.slice(1).toLowerCase()}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
