"use client";

import React, { useState } from "react";
import { useSignupMutation } from "../../lib/features/auth/authApiSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, UserPlus, ArrowLeft, Eye, EyeOff, Check, Sparkles, ShieldCheck } from "lucide-react";
import { FuturisticInput } from "../../components/ui/FuturisticInput";
import { FuturisticButton } from "../../components/ui/FuturisticButton";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [signup, { isLoading }] = useSignupMutation();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordConditions = [
    { label: "Capital letter", regex: /[A-Z]/ },
    { label: "Small letter", regex: /[a-z]/ },
    { label: "Number", regex: /[0-9]/ },
    { label: "Special char", regex: /[^A-Za-z0-9]/ },
  ];

  const isPasswordValid = passwordConditions.every(condition => 
    condition.regex.test(formData.password)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    try {
      await signup(formData).unwrap();
      toast.success("Welcome to the community!");
      router.push("/login");
    } catch (err) {
      console.error("Signup failed:", err);
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-[var(--font-family-poppins)]">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-stone-900">
        <Image 
            src="/auth-hero.png" 
            alt="Premium Background" 
            fill 
            className="object-cover opacity-60 mix-blend-luminosity scale-110 rotate-180"
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
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest mb-6">
                        <Sparkles className="w-3 h-3" />
                        Join the Elite
                    </span>
                    <h2 className="text-5xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
                        Architect Your <br /> 
                        <span className="text-orange-500">Future</span> With Us.
                    </h2>
                    <p className="text-stone-400 text-lg leading-relaxed font-medium">
                        Create your unique identity and start your journey within the campus's most exclusive society.
                    </p>
                </motion.div>
            </div>

            <div className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 w-fit">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-stone-900 bg-stone-700" />
                    ))}
                </div>
                <div className="h-6 w-px bg-white/10 mx-2" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">5k+ Registered</span>
            </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-[#fffdfa] relative h-full min-h-screen">
        <Link 
            href="/" 
            className="absolute top-8 right-8 lg:right-16 flex items-center gap-2 text-xs font-black text-stone-400 hover:text-orange-600 transition-all uppercase tracking-widest group"
        >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Exit
        </Link>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm py-12"
        >
            <div className="mb-10">
                <h1 className="text-4xl font-black text-stone-900 mb-4 tracking-tighter leading-tight">
                    Create Identity.
                </h1>
                <p className="text-stone-500 font-bold text-sm tracking-wide uppercase">
                    Initialize your profile membership
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <FuturisticInput
                    label="Legal Full Name"
                    name="name"
                    type="text"
                    icon={User}
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <FuturisticInput
                    label="Primary Email"
                    name="email"
                    type="email"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <FuturisticInput
                    label="Phone Connection"
                    name="phone"
                    type="tel"
                    icon={Phone}
                    value={formData.phone}
                    onChange={handleChange}
                />

                <FuturisticInput
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    icon={Lock}
                    value={formData.password}
                    onChange={handleChange}
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

                <div className="grid grid-cols-2 gap-3 pb-6">
                    {passwordConditions.map((condition, i) => {
                        const met = condition.regex.test(formData.password);
                        return (
                            <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all duration-300 ${met ? "bg-green-50/50 border-green-100 text-green-700" : "bg-stone-50/50 border-stone-100 text-stone-300"}`}>
                                {met ? <Check size={12} strokeWidth={4} /> : <div className="w-1.5 h-1.5 bg-current rounded-full" />}
                                <span className={`text-[9px] font-black uppercase tracking-wider ${met ? "text-green-700" : "text-stone-400"}`}>{condition.label}</span>
                            </div>
                        );
                    })}
                </div>

                <FuturisticButton
                    type="submit"
                    isLoading={isLoading}
                    className={`w-full py-5 text-sm rounded-2xl transition-all duration-500 font-black uppercase tracking-[0.15em] shadow-xl ${isPasswordValid ? "bg-stone-900 text-white hover:bg-orange-600 shadow-stone-900/10" : "bg-stone-100 text-stone-300 cursor-not-allowed shadow-none"}`}
                    disabled={!isPasswordValid}
                >
                    Complete Entry
                </FuturisticButton>
            </form>

            <div className="mt-12 pt-8 border-t border-stone-100/60 text-center">
                <p className="text-stone-400 text-[11px] font-bold uppercase tracking-widest mb-4">
                    Already recognized?
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
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Privacy Protected</span>
        </div>
      </div>
    </div>
  );
}
