"use client";

import React, { useState } from "react";
import { useLoginMutation } from "../../lib/features/auth/authApiSlice";
import { useAppDispatch } from "../../lib/hooks";
import { setCredentials } from "../../lib/features/auth/authSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, ArrowLeft } from "lucide-react";
import { FuturisticInput } from "../../components/ui/FuturisticInput";
import { FuturisticButton } from "../../components/ui/FuturisticButton";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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

      toast.success("Welcome back, Commander!", {
        style: {
          background: "#ffffff",
          color: "#1f2937",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: {
          primary: "#4f46e5",
          secondary: "#e0e7ff",
        },
      });

      router.push("/profile");
    } catch (err: any) {
      console.error("Login failed:", err);
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message || "Authentication protocols failed. Access denied.";
      toast.error(errorMessage, {
        style: {
          background: "#ffffff",
          color: "#1f2937",
          border: "1px solid #fee2e2",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: {
          primary: "#ef4444",
          secondary: "#fee2e2",
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft size={16} />
        Back to Home
      </Link>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl mix-blend-multiply animate-blob" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-bold text-gray-900 mb-2 tracking-tight"
          >
            Welcome Back
          </motion.h1>
          <p className="text-gray-500">Access your dashboard to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FuturisticInput
            label="Email Address"
            name="email"
            type="email"
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          <FuturisticInput
            label="Password"
            name="password"
            type="password"
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />

          <div className="flex justify-end relative bottom-4">
            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              Forgot Password?
            </a>
          </div>

          <FuturisticButton
            type="submit"
            isLoading={isLoading}
            className="w-full h-12 text-lg"
          >
            <LogIn size={20} className="mr-2" />
            {isLoading ? "Authenticating..." : "Login"}
          </FuturisticButton>
        </form>

        <div className="mt-8 text-center text-gray-500 text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors ml-1"
          >
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
