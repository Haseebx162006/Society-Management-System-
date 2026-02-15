"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../lib/hooks";
import { selectCurrentUser, updateAccessToken } from "../../lib/features/auth/authSlice";
import { useUpdateProfileMutation, useGetProfileQuery } from "../../lib/features/user/userApiSlice";

export default function MyAccount() {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const { data: profileData } = useGetProfileQuery();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const currentUser = profileData || user;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);


  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSave = async () => {
    try {
      const result = await updateProfile({ name, phone }).unwrap();
      dispatch(updateAccessToken({ accessToken: "", user: result }));
      setIsEditing(false);
      setToast({ type: "success", message: "Profile updated successfully" });
    } catch {
      setToast({ type: "error", message: "Failed to update profile" });
    }
  };

  const handleCancel = () => {
    setName(currentUser?.name || "");
    setPhone(currentUser?.phone || "");
    setIsEditing(false);
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-[var(--font-family-poppins)]">
            My Account
          </h2>
          <p className="text-sm text-gray-400 mt-1">Manage your personal information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => {
              setName(currentUser?.name || "");
              setPhone(currentUser?.phone || "");
              setIsEditing(true);
            }}
            className="px-5 py-2.5 text-sm font-semibold text-[#021e66] bg-[#021e66]/5 rounded-xl hover:bg-[#021e66]/10 transition-all duration-300"
          >
            Edit Profile
          </button>
        )}
      </div>

      {toast && (
        <div
          className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {toast.type === "success" ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            )}
          </svg>
          {toast.message}
        </div>
      )}

      <div className="bg-[#021e66] rounded-2xl p-8 flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold shadow-lg border border-white/20">
          {currentUser.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{currentUser.name}</h3>
          <p className="text-white/80 text-sm mt-1">{currentUser.email}</p>
          <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/20">
            {currentUser.is_super_admin ? "Super Admin" : "Member"}
          </span>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#021e66]/20 focus:border-[#021e66]/40 transition-all duration-300"
              />
            ) : (
              <p className="px-4 py-3 rounded-xl bg-gray-50/80 text-gray-900 text-sm font-medium border border-gray-100">
                {currentUser.name}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <p className="px-4 py-3 rounded-xl bg-gray-50/80 text-gray-500 text-sm font-medium border border-gray-100">
              {currentUser.email}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#021e66]/20 focus:border-[#021e66]/40 transition-all duration-300 placeholder:text-gray-300"
              />
            ) : (
              <p className="px-4 py-3 rounded-xl bg-gray-50/80 text-gray-900 text-sm font-medium border border-gray-100">
                {currentUser.phone || "Not provided"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Account Status
            </label>
            <div className="px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${currentUser.status === "ACTIVE" ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="text-sm font-medium text-gray-900">
                {currentUser.status || "ACTIVE"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-3 text-sm font-semibold text-white rounded-xl bg-[#021e66] hover:bg-[#021e66]/90 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-3 text-sm font-semibold text-gray-600 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
