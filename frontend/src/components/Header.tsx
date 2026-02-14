"use client";

import Link from "next/link";
import { useState } from "react";
import SignupModal from "./SignupModal";
import LoginModal from "./LoginModal";
import { useAppSelector } from "../lib/hooks";
import { selectCurrentUser } from "../lib/features/auth/authSlice";

export default function Header() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const user = useAppSelector(selectCurrentUser);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
            COMSOC
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/profile" className="text-sm font-medium text-gray-900 hover:text-blue-600">
                {user.name || "Profile"}
              </Link>
            ) : (
              <>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsSignupOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <div className="relative z-[60]">
        <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    </>
  );
}
