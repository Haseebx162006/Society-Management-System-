"use client";

import { useAppDispatch, useAppSelector } from "../../lib/hooks";
import { selectCurrentUser, logOut } from "../../lib/features/auth/authSlice";
import { useLogoutMutation } from "../../lib/features/auth/authApiSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [logoutApi] = useLogoutMutation();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logoutApi({}).unwrap();
      dispatch(logOut());
      router.push("/");
    } catch (err) {
      console.error("Logout failed", err);
      // Fallback local logout
      dispatch(logOut());
      router.push("/");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
            <p className="text-lg text-gray-900 font-medium">{user.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
            <p className="text-lg text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
            <p className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
              {user.is_super_admin ? "Super Admin" : "User"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
