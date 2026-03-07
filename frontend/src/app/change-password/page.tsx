"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import { useChangePasswordMutation } from "@/lib/features/auth/authApiSlice";
import { useAppDispatch } from "@/lib/hooks";
import { updateAccessToken } from "@/lib/features/auth/authSlice";
import { setCredentials } from "@/lib/features/auth/authSlice";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, KeyRound } from "lucide-react";

export default function ChangePasswordPage() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }).unwrap();

      if (user) {
        dispatch(updateAccessToken({
          accessToken: "",
          user: { ...user, password_reset_required: false },
        }));
      }

      toast.success("Password changed successfully! Welcome.");
      router.push("/profile");
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-orange-50/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl shadow-stone-200 p-10 w-full max-w-md border border-stone-100"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-5 border border-orange-100">
            <KeyRound className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Change Your Password</h1>
          <p className="text-stone-500 text-sm mt-3 leading-relaxed">
            For your security, you must set a new password before you can access your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label: "Current Password", name: "currentPassword", show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
            { label: "New Password", name: "newPassword", show: showNew, toggle: () => setShowNew(!showNew) },
            { label: "Confirm New Password", name: "confirmPassword", show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
                {field.label}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                  <Lock size={16} />
                </div>
                <input
                  type={field.show ? "text" : "password"}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-12 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
                <button
                  type="button"
                  onClick={field.toggle}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {field.show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3 items-start mt-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 font-semibold leading-relaxed">
              Password must be at least 8 characters, include uppercase, lowercase, a number, and a special character (@$!%*?&).
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-2 bg-stone-900 hover:bg-orange-600 text-white font-black text-sm rounded-2xl transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-stone-900/20"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Set New Password <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
