'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/store';
import { useGetAllSocietiesQuery, useGetSocietyByIdQuery } from '@/lib/features/societies/societyApiSlice';
import CreateSocietyForm from '@/components/society/CreateSocietyForm';
import SocietyDashboard from '@/components/society/SocietyDashboard';

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const { data: societies, isLoading: isSocietiesLoading } = useGetAllSocietiesQuery({});
  
  const societyId = React.useMemo(() => {
    if (user && societies) {
        const userId = user._id || user.id;
        const found = societies.find((s: any) => s.created_by?._id === userId || s.created_by === userId);
        return found?._id;
    }
    return null;
  }, [user, societies]);

  const { data: societyDetails, isLoading: isDetailsLoading } = useGetSocietyByIdQuery(societyId, {
    skip: !societyId
  });

  if (isSocietiesLoading || (societyId && isDetailsLoading)) {
    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="text-blue-500 animate-pulse text-xl">Loading Dashboard...</div>
        </div>
    );
  }

  // If user has a society and we fetched its details
  if (societyDetails) {
    // Merge society data and members for the dashboard component
    const fullSociety = {
        ...societyDetails.society,
        members: societyDetails.members
    };
    return <SocietyDashboard society={fullSociety} />;
  }
  
  // If we found a society ID but details failed to load, strictly waiting might be better, 
  // but if we have societyId and no data yet, it's likely loading or error. 
  // If NO societyId found after societies loaded, then show create form.

  if (!isSocietiesLoading && !societyId) {
       // If user is President but no society, show Create Form
       return <CreateSocietyForm />;
  }

  return null; // Fallback during transitions
}
