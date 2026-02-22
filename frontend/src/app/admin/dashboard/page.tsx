"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminDashboardPage() {
  const user = useAppSelector(selectCurrentUser);
  const router = useRouter();

  useEffect(() => {
    if (user && !user.is_super_admin) {
      router.push("/");
    } else if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user?.is_super_admin) {
    return null;
  }

  return <AdminDashboard />;
}
