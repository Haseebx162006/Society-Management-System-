"use client";

import { useState, useEffect } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const passwordStrength = (): { label: string; color: string; width: string } => {
    if (!newPassword) return { label: "", color: "", width: "0%" };
    if (newPassword.length < 6) return { label: "Weak", color: "bg-red-500", width: "33%" };
    if (newPassword.length < 10) return { label: "Medium", color: "bg-amber-500", width: "66%" };
    return { label: "Strong", color: "bg-emerald-500", width: "100%" };
  };

  const strength = passwordStrength();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({ type: "error", message: "All fields are required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({ type: "error", message: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      setToast({ type: "error", message: "Password must be at least 6 characters" });
      return;
    }

    setToast({ type: "success", message: "Password changed successfully" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 font-[var(--font-family-poppins)]">
          Change Password
        </h2>
        <p className="text-sm text-stone-400 mt-1">Update your password to keep your account secure</p>
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

      <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-900">Security Tip</p>
          <p className="text-xs text-orange-600 mt-0.5">
            Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-blue-400 transition-all duration-300 placeholder:text-stone-300"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -transtone-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              {showCurrent ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-blue-400 transition-all duration-300 placeholder:text-stone-300"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -transtone-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              {showNew ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
            </button>
          </div>
          {newPassword && (
            <div className="mt-3 space-y-1.5">
              <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <p className="text-xs font-medium text-stone-400">
                Strength: <span className={strength.label === "Strong" ? "text-emerald-600" : strength.label === "Medium" ? "text-amber-600" : "text-red-600"}>{strength.label}</span>
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-blue-400 transition-all duration-300 placeholder:text-stone-300"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -transtone-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              {showConfirm ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500 mt-2 font-medium">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          className="px-6 py-3 text-sm font-semibold text-white rounded-xl bg-orange-600 hover:bg-blue-700 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
        >
          Update Password
        </button>
      </form>
    </div>
  );
}
