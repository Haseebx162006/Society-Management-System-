"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

import { useAppSelector, useAppDispatch } from "../lib/hooks";
import {
  selectCurrentUser,
  selectRefreshToken,
  logOut,
} from "../lib/features/auth/authSlice";
import { useLogoutMutation } from "../lib/features/auth/authApiSlice";
import { useRouter, usePathname } from "next/navigation";



const NAV_LINKS = [
  { label: "HOME", href: "/" },
  { label: "SOCIETIES", href: "/societies" },
  { label: "EVENTS", href: "/events" },
  { label: "ABOUT", href: "/about" },
  { label: "CONTACT", href: "/contact" },
];

export default function Header() {

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = useAppSelector(selectCurrentUser);
  const refreshToken = useAppSelector(selectRefreshToken);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [logout] = useLogoutMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await logout({ refreshToken }).unwrap();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      dispatch(logOut());
      setDropdownOpen(false);
      router.push("/");
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white border-b border-stone-100"
            : "bg-white border-b border-stone-100"
        }`}
      >
        <motion.div
           className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-orange-600 origin-left z-[51]"
           style={{ scaleX }}
        />
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-20 w-20 transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/logo.png?v=1?v=1"
                alt="COMSOC Logo"
                fill
                className="object-contain object-left filter drop-shadow-sm"
                priority
              />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link relative px-5 py-2.5 text-[13px] font-semibold tracking-[0.08em] rounded-full transition-all duration-300 ${
                  isActive(link.href)
                    ? "text-orange-600 bg-orange-50/80"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-50/80"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gradient-to-r bg-orange-500 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {mounted && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-stone-50/80 transition-all duration-300 group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br bg-orange-500 flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-orange-500/20 group-hover:shadow-orange-500/30 transition-shadow duration-300">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
                    {user.name?.split(" ")[0] || "User"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  className={`absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#fffdfa]/95 backdrop-blur-xl border border-stone-100/80 shadow-xl shadow-stone-200/50 py-2 transition-all duration-300 origin-top-right ${
                    dropdownOpen
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="px-4 py-3 border-b border-stone-100/80">
                    <p className="text-sm font-semibold text-stone-900 truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-stone-400 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50/80 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50/80 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm font-semibold text-stone-700 hover:text-stone-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="relative px-6 py-2.5 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-orange-600 via-yellow-600 to-orange-600 bg-[length:200%_100%] hover:bg-right shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-500"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-stone-50/80 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-5 flex flex-col justify-center items-center gap-[5px]">
              <span
                className={`block w-5 h-[2px] bg-stone-700 rounded-full transition-all duration-300 origin-center ${
                  mobileOpen ? "rotate-45 translate-y-[3.5px]" : ""
                }`}
              />
              <span
                className={`block w-5 h-[2px] bg-stone-700 rounded-full transition-all duration-300 ${
                  mobileOpen ? "opacity-0 scale-0" : ""
                }`}
              />
              <span
                className={`block w-5 h-[2px] bg-stone-700 rounded-full transition-all duration-300 origin-center ${
                  mobileOpen ? "-rotate-45 -translate-y-[3.5px]" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 z-40 w-[300px] h-full bg-[#fffdfa]/95 backdrop-blur-xl shadow-2xl lg:hidden transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-24 pb-8 px-6">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-semibold tracking-[0.06em] transition-all duration-300 ${
                  isActive(link.href)
                    ? "text-orange-600 bg-orange-50/80"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-50/80"
                }`}
                style={{
                  transitionDelay: mobileOpen ? `${i * 50}ms` : "0ms",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-stone-100 pt-6 flex flex-col gap-3">
            {mounted && user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-stone-50 text-stone-700 font-semibold rounded-xl hover:bg-stone-100 transition-colors"
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => {
                    setMobileOpen(false);
                  }}
                  className="w-full py-3.5 text-sm font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 rounded-xl transition-all duration-300"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => {
                    setMobileOpen(false);
                  }}
                  className="w-full py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>


    </>
  );
}
