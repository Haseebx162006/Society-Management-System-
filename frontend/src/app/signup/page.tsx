"use client";

import React, { useState } from "react";
import { useSignupMutation } from "../../lib/features/auth/authApiSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, UserPlus } from "lucide-react";
import { FuturisticInput } from "../../components/ui/FuturisticInput";
import { FuturisticButton } from "../../components/ui/FuturisticButton";
import Link from "next/link";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [signup, { isLoading }] = useSignupMutation();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(formData).unwrap();
      toast.success("Account created successfully! Please log in.", {
        style: {
          background: "#ffffff",
          color: "#1f2937",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
        iconTheme: {
          primary: "#10b981",
          secondary: "#d1fae5",
        },
      });
      router.push("/login");
    } catch (err) {
      console.error("Signup failed:", err);
      const errorMessage =
        (err as { data?: { message?: string } })?.data?.message || "Registration failed. Please try again.";
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
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl mix-blend-multiply animate-blob" />
        <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 mb-2 tracking-tight"
          >
            Create Account
          </motion.h1>
          <p className="text-gray-500">Join the community today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FuturisticInput
            label="Full Name"
            name="name"
            type="text"
            icon={User}
            value={formData.name}
            onChange={handleChange}
            required
          />

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
            label="Phone Number"
            name="phone"
            type="tel"
            icon={Phone}
            value={formData.phone}
            onChange={handleChange}
          />

          <FuturisticInput
            label="Password"
            name="password"
            type="password"
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            required
          />

          <FuturisticButton
            type="submit"
            isLoading={isLoading}
            className="w-full h-12 text-lg mt-4"
          >
            <UserPlus size={20} className="mr-2" />
            {isLoading ? "Creating Account..." : "Create Account"}
          </FuturisticButton>
        </form>

        <div className="mt-6 text-center text-gray-500 text-sm">
          Already a member?{" "}
          <Link
            href="/login"
            className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors ml-1"
          >
            Log In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
