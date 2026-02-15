"use client";

import Link from "next/link";
import { useState } from "react";
import SignupModal from "./SignupModal";
import LoginModal from "./LoginModal";
import { useAppSelector, useAppDispatch } from "../lib/hooks";
import { selectCurrentUser, selectRefreshToken, logOut } from "../lib/features/auth/authSlice";
import { useLogoutMutation } from "../lib/features/auth/authApiSlice";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const user = useAppSelector(selectCurrentUser);
  const refreshToken = useAppSelector(selectRefreshToken);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await logout({ refreshToken }).unwrap();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      dispatch(logOut());
      router.push("/");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
            COMSOC
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200 transition-colors border border-blue-200 shadow-sm" title="Go to Profile">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </Link>
              </div>
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
