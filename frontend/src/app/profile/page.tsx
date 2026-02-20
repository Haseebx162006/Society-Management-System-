"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "../../lib/hooks";
import {
  selectCurrentUser,
  selectRefreshToken,
  logOut,
} from "../../lib/features/auth/authSlice";
import { useLogoutMutation } from "../../lib/features/auth/authApiSlice";
import { useGetMySocietiesQuery } from "../../lib/features/user/userApiSlice";
import { useRouter } from "next/navigation";
import MyAccount from "../../components/profile/MyAccount";
import ChangePassword from "../../components/profile/ChangePassword";
import EnrolledSocieties from "../../components/profile/EnrolledSocieties";
import SocietyRegistration from "../../components/profile/SocietyRegistration";
import Header from "@/components/Header";

type Tab = "account" | "password" | "societies" | "registration";

const SIDEBAR_ITEMS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  {
    key: "account",
    label: "My Account",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    key: "password",
    label: "Change Password",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    key: "societies",
    label: "Enrolled Societies",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const user = useAppSelector(selectCurrentUser);
  const refreshToken = useAppSelector(selectRefreshToken);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [logoutApi] = useLogoutMutation();
  const { data: societies } = useGetMySocietiesQuery();

  const roleBasedItems = useMemo(() => {
    const items: { key: string; label: string; icon: React.ReactNode; action: () => void }[] = [];


    if (user?.is_super_admin) {
      items.push({
        key: "admin-dashboard",
        label: "Admin Dashboard",
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
          </svg>
        ),
        action: () => router.push("/admin/dashboard"),
      });
    }

    const canAccessDashboard = societies?.some((s) => s.role === "PRESIDENT" || s.role === "FINANCE MANAGER" || s.role === "EVENT MANAGER");
    if (canAccessDashboard) {
      items.push({
        key: "society-dashboard",
        label: "Society Dashboard",
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
        ),
        action: () => router.push("/society/dashboard"),
      });
    }


    if (!user?.is_super_admin) {
      items.push({
        key: "request-registration",
        label: "Request Society Registration",
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        action: () => setActiveTab("registration"),
      });
    }

    return items;
  }, [user, societies, router]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !user) {
      router.push("/");
    }
  }, [user, router, isMounted]);

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await logoutApi({ refreshToken }).unwrap();
      }
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      dispatch(logOut());
      router.push("/");
    }
  };

  if (!isMounted || !user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return <MyAccount />;
      case "password":
        return <ChangePassword />;
      case "societies":
        return <EnrolledSocieties />;
      case "registration":
        return <SocietyRegistration />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-10">
        <div className="max-w-screen-xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-sans">
              Settings
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="lg:hidden mb-6">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="flex items-center justify-between w-full px-5 py-3.5 rounded-xl bg-white border border-gray-100 shadow-sm text-sm font-medium text-gray-700"
            >
              <div className="flex items-center gap-3">
                {SIDEBAR_ITEMS.find((i) => i.key === activeTab)?.icon}
                {SIDEBAR_ITEMS.find((i) => i.key === activeTab)?.label}
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${mobileSidebarOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div
              className={`mt-2 rounded-xl bg-white border border-gray-100 shadow-lg overflow-hidden transition-all duration-300 origin-top ${mobileSidebarOpen
                ? "opacity-100 scale-y-100 max-h-[400px]"
                : "opacity-0 scale-y-95 max-h-0 pointer-events-none"
                }`}
            >
              <div className="py-2">
                {SIDEBAR_ITEMS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setActiveTab(item.key);
                      setMobileSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-5 py-3 text-sm font-medium transition-colors ${activeTab === item.key
                      ? "text-blue-600 bg-blue-50/80"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}

                {roleBasedItems.length > 0 && <div className="border-t border-gray-100 my-2 pt-2" />}

                {roleBasedItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      item.action();
                      setMobileSidebarOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-5 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-5 py-3 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            <aside className="hidden lg:block w-[260px] shrink-0">
              <div className="sticky top-28 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0f172b] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <nav className="p-2">
                  {SIDEBAR_ITEMS.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === item.key
                        ? "text-blue-600 bg-blue-50/80"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80"
                        }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}

                  {roleBasedItems.length > 0 && <div className="border-t border-gray-100/80 my-2" />}

                  {roleBasedItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={item.action}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50/80 transition-all duration-300"
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </nav>

                <div className="p-2 pt-0">
                  <div className="border-t border-gray-100/80 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50/80 transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            <main className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
