'use client';

import React from 'react';
import { useGetSocietyByIdQuery, useGetMyManageableSocietiesQuery } from '@/lib/features/societies/societyApiSlice';
import CreateSocietyForm from '@/components/society/CreateSocietyForm';
import SocietyDashboard from '@/components/society/SocietyDashboard';

export default function DashboardPage() {
  // Use the new endpoint that returns societies where user is PRESIDENT or FINANCE MANAGER
  const { data: manageableSocieties, isLoading: isSocietiesLoading } = useGetMyManageableSocietiesQuery({});
  
  const societyId = React.useMemo(() => {
    if (manageableSocieties && manageableSocieties.length > 0) {
        // For now, default to the first manageable society. 
        // In the future, we could add a society switcher if a user manages multiple.
        return manageableSocieties[0]._id;
    }
    return null;
  }, [manageableSocieties]);

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

  // If we have society details, check specific role and render dashboard
  if (societyDetails) {
    // Merge society data and members for the dashboard component
    const fullSociety = {
        ...societyDetails.society,
        members: societyDetails.members
    };
    return <SocietyDashboard society={fullSociety} />;
  }
  
  // If no manageable societies found, show Create Form
  if (!isSocietiesLoading && !societyId) {
       return <CreateSocietyForm />;
  }

  return null; // Fallback during transitions
}
