"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import { PieChart, ListChecks, LogOut, RefreshCw, Users, Calendar } from "lucide-react";

export default function SocietyHeadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: "Overview", href: "/head-dashboard", icon: PieChart },
    { name: "Societies", href: "/head-dashboard/societies", icon: Users },
    { name: "Events", href: "/head-dashboard/events", icon: Calendar },
    { name: "Manage Requests", href: "/head-dashboard/requests", icon: ListChecks },
    { name: "Manage Renewals", href: "/head-dashboard/renewals", icon: RefreshCw },
  ];

  return (
    <div className="min-h-screen bg-[#fffdfa] font-(--font-family-poppins)">
      <Header />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="sticky top-28 bg-white border border-stone-200 rounded-3xl shadow-sm p-4">
              <div className="px-4 py-3 mb-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Role</p>
                <p className="text-sm font-semibold text-stone-900">Society Head</p>
              </div>

              <nav className="space-y-1.5">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive 
                          ? "bg-stone-900 text-white shadow-md shadow-stone-900/10" 
                          : "text-stone-500 hover:bg-stone-50 hover:text-stone-900"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 pt-4 border-t border-stone-100">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Leave Dashboard
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
          
        </div>
      </div>
    </div>
  );
}
