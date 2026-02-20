'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';
import { selectCurrentUser } from '@/lib/features/auth/authSlice';
import { useGetSocietyByIdQuery, useGetMyManageableSocietiesQuery } from '@/lib/features/societies/societyApiSlice';
import SocietyDashboard from '@/components/society/SocietyDashboard';
import Loading from '@/app/loading';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !user) {
      router.push('/login');
    }
  }, [user, router, isMounted]);

  const { data: manageableSocieties, isLoading: isSocietiesLoading } = useGetMyManageableSocietiesQuery({}, {
    skip: !user,
  });

  const societyId = React.useMemo(() => {
    if (manageableSocieties && manageableSocieties.length > 0) {
        return manageableSocieties[0]._id;
    }
    return null;
  }, [manageableSocieties]);

  const { data: societyDetails, isLoading: isDetailsLoading } = useGetSocietyByIdQuery(societyId, {
    skip: !societyId
  });

  useEffect(() => {
    if (!isSocietiesLoading && !societyId && user) {
      router.push('/profile');
    }
  }, [isSocietiesLoading, societyId, user, router]);

  if (!isMounted || !user) return null;

  if (isSocietiesLoading || (societyId && isDetailsLoading)) {
    return <Loading />;
  }

  if (societyDetails) {
    const fullSociety = {
        ...societyDetails.society,
        members: societyDetails.members
    };
    return <SocietyDashboard society={fullSociety} />;
  }

  return null;
}
