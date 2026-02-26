"use client";

import React, { useState } from "react";
import { useLoginMutation } from "../../lib/features/auth/authApiSlice";
import { useAppDispatch } from "../../lib/hooks";
import { setCredentials } from "../../lib/features/auth/authSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, ArrowLeft, Eye, EyeOff, Sparkles, ShieldCheck } from "lucide-react";
import { FuturisticInput } from "../../components/ui/FuturisticInput";
import { FuturisticButton } from "../../components/ui/FuturisticButton";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      dispatch(
        setCredentials({
          user: userData.data.user,
          accessToken: userData.data.accessToken,
          refreshToken: userData.data.refreshToken,
        })
      );

      toast.success("Welcome back!", {
        style: {
          background: "#ffffff",
          color: "#1c1917",
          border: "1px solid #e7e5e4",
        },
      });

      router.push("/profile");
    } catch (err) {
      toast.error("Login failed!");
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message || "Authentication failed. Access denied.";
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
            className="object-cover opacity-60 mix-blend-luminosity scale-105"
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
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest mb-6">
                        <Sparkles className="w-3 h-3" />
                        Next Gen Community
                    </span>
                    <h2 className="text-5xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
                        Empowering the <br /> 
                        <span className="text-orange-500">Leaders</span> of Tomorrow.
                    </h2>
                    <p className="text-stone-400 text-lg leading-relaxed font-medium">
                        Access the most advanced society management ecosystem and elevate your campus experience.
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
            href="/" 
            className="absolute top-8 right-8 lg:right-16 flex items-center gap-2 text-xs font-black text-stone-400 hover:text-orange-600 transition-all uppercase tracking-widest group"
        >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Home
        </Link>

        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
        >
            <div className="mb-12">
                <h1 className="text-4xl font-black text-stone-900 mb-4 tracking-tighter leading-tight">
                    Welcome <br className="lg:hidden" /> Back.
                </h1>
                <p className="text-stone-500 font-bold text-sm tracking-wide uppercase">
                    Enter your credentials to continue
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <FuturisticInput
                    label="Email Address"
                    name="email"
                    type="email"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleChange}
                    required
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

                <div className="flex justify-between items-center pb-8">
                   
                    <a href="#" className="text-[11px] font-bold text-stone-400 hover:text-orange-600 transition-colors uppercase tracking-widest">
                        Forget Password?
                    </a>
                </div>

                <FuturisticButton
                    type="submit"
                    isLoading={isLoading}
                    className="w-full py-5 text-sm rounded-2xl bg-stone-900 text-white hover:bg-orange-600 transition-all duration-500 font-black uppercase tracking-[0.15em]"
                >
                    Authorize Access
                </FuturisticButton>
            </form>

            <div className="mt-12 pt-8 border-t border-stone-100/60 text-center">
                <p className="text-stone-400 text-[11px] font-bold uppercase tracking-widest mb-4">
                    Don&apos;t have an account?
                </p>
                <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 py-3 px-8 rounded-full border-2 border-stone-100 text-stone-900 font-black text-xs uppercase tracking-widest hover:border-orange-600 hover:text-orange-600 transition-all duration-300"
                >
                    Create One
                </Link>
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
