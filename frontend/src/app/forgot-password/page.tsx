"use client";

import React, { useState } from "react";
import { useForgotPasswordMutation, useVerifyResetOtpMutation, useResetPasswordMutation } from "../../lib/features/auth/authApiSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Sparkles, ShieldCheck, KeyRound } from "lucide-react";
import { FuturisticInput } from "../../components/ui/FuturisticInput";
import { FuturisticButton } from "../../components/ui/FuturisticButton";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
  const [verifyOtp, { isLoading: isVerifyLoading }] = useVerifyResetOtpMutation();
  const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    try {
      await forgotPassword({ email }).unwrap();
      toast.success("OTP sent to your email", {
        style: { background: "#ffffff", color: "#1c1917", border: "1px solid #e7e5e4" },
      });
      setStep(2);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    try {
      await verifyOtp({ email, otp }).unwrap();
      toast.success("OTP verified successfully", {
        style: { background: "#ffffff", color: "#1c1917", border: "1px solid #e7e5e4" },
      });
      setStep(3);
    } catch (err: any) {
      toast.error(err?.data?.message || "Invalid or expired OTP");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
      return;
    }

    try {
      await resetPassword({ email, otp, newPassword }).unwrap();
      toast.success("Password reset successfully. Please log in.", {
        style: { background: "#ffffff", color: "#1c1917", border: "1px solid #e7e5e4" },
      });
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-[var(--font-family-poppins)]">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-stone-900">
        <Image 
            src="/auth-hero.png" 
            alt="Premium Background" 
            fill 
            className="object-cover opacity-60 mix-blend-luminosity scale-105"
            priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
        
        <div className="relative z-10 w-full p-16 flex flex-col justify-between">
            <Link href="/" className="flex items-center gap-3 group w-fit">
                <div className="relative h-20 w-64 transition-transform duration-500 group-hover:scale-105">
                    <Image
                        src="/logo.png?v=1"
                        alt="COMSOC Logo"
                        fill
                        className="object-contain object-left filter drop-shadow-xl"
                        priority
                    />
                </div>
            </Link>

            <div className="max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest mb-6">
                        <Sparkles className="w-3 h-3" />
                        Secure Recovery
                    </span>
                    <h2 className="text-5xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
                        Regain Access <br /> 
                        <span className="text-orange-500">Safely</span>.
                    </h2>
                    <p className="text-stone-400 text-lg leading-relaxed font-medium">
                        Follow the steps to securely reset your password and continue your journey with COMSOC.
                    </p>
                </motion.div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-stone-900 bg-stone-800" />
                    ))}
                </div>
                <span className="text-sm font-bold text-stone-500 tracking-wide uppercase">Join 500+ active members</span>
            </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-[#fffdfa] relative">
        <Link 
            href="/login" 
            className="absolute top-8 right-8 lg:right-16 flex items-center gap-2 text-xs font-black text-stone-400 hover:text-orange-600 transition-all uppercase tracking-widest group"
        >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Login
        </Link>

        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
        >
            <div className="mb-12">
                <h1 className="text-4xl font-black text-stone-900 mb-4 tracking-tighter leading-tight">
                    Reset <br className="lg:hidden" /> Password.
                </h1>
                <p className="text-stone-500 font-bold text-sm tracking-wide uppercase h-10">
                    {step === 1 && "Enter your email to receive an OTP"}
                    {step === 2 && "Enter the OTP sent to your email"}
                    {step === 3 && "Create a new strong password"}
                </p>
            </div>

            <div className="relative min-h-[300px]">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleRequestOtp} 
                            className="space-y-6 absolute w-full"
                        >
                            <FuturisticInput
                                label="Email Address"
                                name="email"
                                type="email"
                                icon={Mail}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <div className="pt-4">
                                <FuturisticButton
                                    type="submit"
                                    isLoading={isForgotLoading}
                                    className="w-full py-5 text-sm rounded-2xl bg-stone-900 text-white hover:bg-orange-600 transition-all duration-500 font-black uppercase tracking-[0.15em]"
                                >
                                    Send OTP
                                </FuturisticButton>
                            </div>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form 
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleVerifyOtp} 
                            className="space-y-6 absolute w-full"
                        >
                            <div className="text-sm text-stone-500 mb-6 font-medium">
                                We sent a 6-digit code to <span className="font-bold text-stone-900">{email}</span>
                            </div>
                            
                            <FuturisticInput
                                label="6-Digit OTP"
                                name="otp"
                                type="text"
                                icon={KeyRound}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                required
                            />

                            <div className="pt-4 flex flex-col gap-4">
                                <FuturisticButton
                                    type="submit"
                                    isLoading={isVerifyLoading}
                                    className="w-full py-5 text-sm rounded-2xl bg-stone-900 text-white hover:bg-orange-600 transition-all duration-500 font-black uppercase tracking-[0.15em]"
                                >
                                    Verify Code
                                </FuturisticButton>
                                
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-xs font-bold text-stone-400 hover:text-orange-600 uppercase tracking-widest transition-colors"
                                >
                                    Change Email
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {step === 3 && (
                        <motion.form 
                            key="step3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleResetPassword} 
                            className="space-y-4 absolute w-full"
                        >
                            <FuturisticInput
                                label="New Password"
                                name="newPassword"
                                type={showPassword ? "text" : "password"}
                                icon={Lock}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                rightElement={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="p-2 text-stone-300 hover:text-orange-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />

                            <FuturisticInput
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                icon={Lock}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                rightElement={
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="p-2 text-stone-300 hover:text-orange-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />

                            <div className="pt-4 flex flex-col gap-4">
                                <FuturisticButton
                                    type="submit"
                                    isLoading={isResetLoading}
                                    className="w-full py-5 text-sm rounded-2xl bg-stone-900 text-white hover:bg-orange-600 transition-all duration-500 font-black uppercase tracking-[0.15em]"
                                >
                                    Reset Password
                                </FuturisticButton>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30">
            <ShieldCheck size={14} className="text-stone-400" />
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Secure Environment</span>
        </div>
      </div>
    </div>
  );
}
