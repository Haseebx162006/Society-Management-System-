"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVerifyOtpMutation, useResendOtpMutation } from "@/lib/features/auth/authApiSlice";
import { useAppDispatch } from "@/lib/hooks";
import { setCredentials } from "@/lib/features/auth/authSlice";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function VerifyOTPContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5 && newOtp.every((d) => d !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length && i < 6; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    // Focus the next empty or last input
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Auto-submit if full
    if (pasted.length === 6) {
      handleVerify(pasted);
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    try {
      const result = await verifyOtp({ email, otp: code }).unwrap();

      dispatch(
        setCredentials({
          user: result.data.user,
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        })
      );

      toast.success("Email verified! Welcome aboard!", {
        style: { background: "#ffffff", color: "#1c1917", fontWeight: 700 },
        iconTheme: { primary: "#ea580c", secondary: "#fff" },
      });

      router.push("/");
    } catch (err: any) {
      const errorMessage = err?.data?.message || "Verification failed. Please try again.";
      toast.error(errorMessage);
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    try {
      await resendOtp({ email }).unwrap();
      toast.success("New OTP sent to your email!");
      setCooldown(60); // 60 second cooldown
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const errorMessage = err?.data?.message || "Failed to resend OTP.";
      toast.error(errorMessage);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(b.length) + c)
    : "";

  return (
    <div className="min-h-screen flex bg-white font-[var(--font-family-poppins)]">
      {/* Left visual panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-stone-900">
        <Image
          src="/auth-hero.png"
          alt="Premium Background"
          fill
          className="object-cover opacity-60 mix-blend-luminosity scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />

        <div className="relative z-10 w-full p-16 flex flex-col justify-between">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="relative h-20 w-64 transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="COMSOC Logo"
                fill
                className="object-contain object-left filter drop-shadow-xl"
                priority
              />
            </div>
          </Link>

          <div className="max-w-md">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-6">
                <ShieldCheck className="w-3 h-3" />
                Verification
              </span>
              <h2 className="text-5xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
                Confirm Your <br />
                <span className="text-orange-500">Identity</span>.
              </h2>
              <p className="text-stone-400 text-lg leading-relaxed font-medium">
                We sent a 6-digit verification code to your email. Enter it below to activate your account.
              </p>
            </motion.div>
          </div>

          <div className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 w-fit">
            <Mail className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">
              Check Your Inbox
            </span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-[#fffdfa] relative min-h-screen">
        <Link
          href="/signup"
          className="absolute top-8 right-8 lg:right-16 flex items-center gap-2 text-xs font-black text-stone-400 hover:text-orange-600 transition-all uppercase tracking-widest group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm py-12"
        >
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/20">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-black text-stone-900 mb-3 tracking-tighter">
              Verify Email
            </h1>
            <p className="text-stone-400 font-medium text-sm">
              Enter the 6-digit code sent to
            </p>
            <p className="text-stone-700 font-bold text-sm mt-1">{maskedEmail}</p>
          </div>

          {/* OTP Input Grid */}
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-xl font-black rounded-xl border-2 transition-all duration-300 outline-none
                  ${digit
                    ? "border-orange-500 bg-orange-50/50 text-stone-900 shadow-sm shadow-orange-500/10"
                    : "border-stone-200 bg-stone-50/50 text-stone-900 focus:border-orange-500 focus:bg-orange-50/30"
                  }`}
              />
            ))}
          </div>

          {/* Verify Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleVerify()}
            disabled={isVerifying || otp.some((d) => d === "")}
            className={`w-full py-4 text-sm rounded-2xl font-black uppercase tracking-[0.15em] shadow-xl transition-all duration-500 flex items-center justify-center gap-2 ${
              otp.every((d) => d !== "") && !isVerifying
                ? "bg-stone-900 text-white hover:bg-orange-600 shadow-stone-900/10"
                : "bg-stone-100 text-stone-300 cursor-not-allowed shadow-none"
            }`}
          >
            {isVerifying ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                Verify & Activate
              </>
            )}
          </motion.button>

          {/* Resend Section */}
          <div className="mt-8 text-center">
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-3">
              Didn&apos;t receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className={`inline-flex items-center gap-2 py-2.5 px-6 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                cooldown > 0 || isResending
                  ? "text-stone-300 cursor-not-allowed"
                  : "text-orange-600 hover:bg-orange-50 border border-orange-200 hover:border-orange-300"
              }`}
            >
              <RefreshCw size={12} className={isResending ? "animate-spin" : ""} />
              {cooldown > 0 ? `Resend in ${cooldown}s` : isResending ? "Sending..." : "Resend Code"}
            </button>
          </div>

          {/* Expiry notice */}
          <div className="mt-8 p-4 rounded-xl bg-stone-50 border border-stone-100 text-center">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
              Code expires in 10 minutes
            </p>
          </div>

          {/* Login link */}
          <div className="mt-10 pt-8 border-t border-stone-100/60 text-center">
            <p className="text-stone-400 text-[11px] font-bold uppercase tracking-widest mb-4">
              Already verified?
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 py-3 px-8 rounded-full border-2 border-stone-100 text-stone-900 font-black text-xs uppercase tracking-widest hover:border-orange-600 hover:text-orange-600 transition-all duration-300"
            >
              Log In
            </Link>
          </div>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30">
          <ShieldCheck size={14} className="text-stone-400" />
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
            Secure Verification
          </span>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fffdfa]">
          <div className="animate-pulse text-stone-400 font-bold text-sm uppercase tracking-widest">
            Loading...
          </div>
        </div>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}
