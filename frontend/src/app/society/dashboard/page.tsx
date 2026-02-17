'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/store';
import { useGetAllSocietiesQuery } from '@/lib/features/societies/societyApiSlice';
import CreateSocietyForm from '@/components/society/CreateSocietyForm';
import SocietyDashboard from '@/components/society/SocietyDashboard';

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const { data: societies, isLoading } = useGetAllSocietiesQuery({});
  
  const mySociety = React.useMemo(() => {
    if (user && societies) {
        const userId = user._id || user.id;
        return societies.find((s: any) => s.created_by?._id === userId || s.created_by === userId);
    }
    return null;
  }, [user, societies]);

  if (isLoading) {
    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="text-blue-500 animate-pulse text-xl">Loading Dashboard...</div>
        </div>
    );
  }

  // If user has a society, show Dashboard
  if (mySociety) {
    return <SocietyDashboard society={mySociety} />;
  }

  // If user is President but no society, show Create Form
  // Note: We might want to check if user.role includes "PRESIDENT" or similar logic
  // but for now assuming if they are on this page, they intend to be a President/Admin
  return <CreateSocietyForm />;
}
