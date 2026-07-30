import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { MdGroups, MdEvent } from 'react-icons/md';
import { FaUsers, FaArrowRight, FaBars } from 'react-icons/fa';
import { useGetEventsBySocietyQuery } from '@/lib/features/events/eventApiSlice';
import { useGetSocietyRequestForSocietyQuery } from '@/lib/features/societies/societyApiSlice';
import { Lock } from 'lucide-react';

import DashboardSidebar from '@/components/society/DashboardSidebar';
import CreateSocietyForm from '@/components/society/CreateSocietyForm';
import JoinFormManager from '@/components/society/JoinFormManager';
import JoinRequestManager from '@/components/society/JoinRequestManager';
import MembersManager from '@/components/society/MembersManager';
import TeamsManager from '@/components/society/TeamsManager';
import EventManager from '@/components/society/EventManager';
import EventFormBuilder from '@/components/society/EventFormBuilder';
import PreviousMembersManager from '@/components/society/PreviousMembersManager';
import SponsorsManager from '@/components/society/SponsorsManager';
import DocumentationPage from '@/components/society/DocumentationPage';
import ApplicationForm from '@/components/profile/forms/ApplicationForm';
import ReadonlySocietyDetails from '@/components/profile/forms/ReadonlySocietyDetails';
import ReadonlyRenewalDetails from '@/components/profile/forms/ReadonlyRenewalDetails';

// Custom layout imports
import TopBar from '@/components/society/TopBar';
import KPIStats from '@/components/society/dashboard/KPIStats';
import GrowthChart from '@/components/society/dashboard/GrowthChart';
import RequestOverview from '@/components/society/dashboard/RequestOverview';
import CategoryChart from '@/components/society/dashboard/CategoryChart';
import HealthStatus from '@/components/society/dashboard/HealthStatus';
import ActivityFeed from '@/components/society/dashboard/ActivityFeed';
import AttentionNeeded from '@/components/society/dashboard/AttentionNeeded';
import PlatformInsights from '@/components/society/dashboard/PlatformInsights';

interface SocietyMember {
  user_id: { _id: string; name: string };
  role: string;
  assigned_at: string;
  group_id?: string | { _id: string; name: string };
}

interface SocietyGroup {
  _id: string;
  name: string;
}

interface SocietyDashboardProps {
  society: {
    _id: string;
    name: string;
    description: string;
    members: SocietyMember[];
    groups: SocietyGroup[];
    registration_fee: number;
    renewal_approved: boolean;
    content_sections: any[];
    [key: string]: any;
  };
}

const SocietyDashboard: React.FC<SocietyDashboardProps> = ({ society }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isApproved = society.renewal_approved;
  const [activeTab, setActiveTab] = React.useState(isApproved ? 'overview' : 'renewal-form');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { data: events } = useGetEventsBySocietyQuery(society._id);
  const { data: societyRequest, isLoading: isRequestLoading } = useGetSocietyRequestForSocietyQuery({ societyId: society._id, type: 'REGISTER' }, { 
    skip: activeTab !== 'review-form'
  });
  const { data: renewalRequest } = useGetSocietyRequestForSocietyQuery({ societyId: society._id, type: 'RENEWAL' }, {
    skip: activeTab !== 'renewal-form'
  });

  const isRenewalLocked = renewalRequest && (renewalRequest.status === 'PENDING' || renewalRequest.status === 'APPROVED');

  const currentUserRole = useMemo(() => {
      if (!user || !society.members) return 'MEMBER';
      const userId = user._id || user.id;
      const member = society.members.find((m: { user_id: { _id: string } | string; role: string }) => {
          const mUserId = typeof m.user_id === 'object' ? m.user_id._id : m.user_id;
          return mUserId === userId;
      });
      return member?.role || 'MEMBER';
  }, [user, society.members]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        role={currentUserRole}
        renewal_approved={isApproved}
        user={user}
      />

      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 transition-opacity duration-300 ${
          isSidebarOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none peer-hover:opacity-100 peer-hover:pointer-events-auto'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 lg:ml-20 min-h-screen flex flex-col transition-all duration-300 ease-in-out">
        {/* TopBar Header */}
        <TopBar user={user} role={currentUserRole} onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 pt-20 p-6 md:p-8 overflow-y-auto">
          {(!isApproved && activeTab !== 'renewal-form' && activeTab !== 'review-form') ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-6">
                <Lock className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">Feature Locked</h3>
              <p className="text-slate-500 max-w-sm px-6">
                This feature is currently locked. You must submit and receive approval for your society&apos;s renewal request to regain full access to the dashboard.
              </p>
              <button 
                onClick={() => setActiveTab('renewal-form')}
                className="mt-8 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                Go to Renewal Form <FaArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : activeTab === 'settings' ? (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
               <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Edit Society Settings</h2>
                <p className="text-slate-500">Manage your society profile and configuration</p>
              </div>
              <CreateSocietyForm
                initialData={society}
                isEditing={true}
                isModal={false}
                key={society._id}
                onCancel={() => setActiveTab('overview')}
              />
            </div>
          ) : (
            <>
              {activeTab === 'overview' ? (
                <div className="space-y-6">
                  {/* Top Bar inside main body for title / action buttons */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                    <div className="space-y-1">
                      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {society.name} <span className="text-orange-700">Dashboard</span>
                      </h1>
                      <p className="text-sm text-slate-400 font-medium">Monitor societies, members, events, and administrative activity.</p>
                    </div>
                  </div>

                  {/* Row 1: KPI Stats Cards */}
                  <KPIStats 
                    totalSocieties={48} 
                    totalMembers={society.members?.length || 6842} 
                    pendingReviews={12} 
                    pendingRenewals={8} 
                  />

                  {/* Row 2: Analytics Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <GrowthChart />
                    </div>
                    <div>
                      <RequestOverview />
                    </div>
                  </div>

                  {/* Row 3: Society Insights */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CategoryChart />
                    <HealthStatus />
                  </div>

                  {/* Row 4: Activity and Action List */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ActivityFeed />
                    <AttentionNeeded onAction={(action) => {
                      if (action === 'registration') {
                        setActiveTab('join-requests');
                      } else if (action === 'renewal') {
                        setActiveTab('renewal-form');
                      } else if (action === 'incomplete') {
                        setActiveTab('settings');
                      }
                    }} />
                  </div>

                  {/* Row 5: Bottom Platform Insights Banner */}
                  <PlatformInsights />
                </div>
              ) : activeTab === 'join-form' ? (
                <JoinFormManager societyId={society._id} />
              ) : activeTab === 'join-requests' ? (
                <JoinRequestManager societyId={society._id} />
              ) : activeTab === 'members' ? (
                <MembersManager societyId={society._id} />
              ) : activeTab === 'teams' ? (
                <TeamsManager societyId={society._id} />
              ) : activeTab === 'events' ? (
                <EventManager societyId={society._id} />
              ) : activeTab === 'event-forms' ? (
                <EventFormBuilder societyId={society._id} />
              ) : activeTab === 'previous-members' ? (
                <PreviousMembersManager societyId={society._id} />
              ) : activeTab === 'sponsors' ? (
                <SponsorsManager societyId={society._id} />
              ) : activeTab === 'documentation' ? (
                <DocumentationPage societyId={society._id} />
              ) : activeTab === 'review-form' ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
                  {isRequestLoading ? (
                    <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
                  ) : societyRequest ? (
                    <ReadonlySocietyDetails request={societyRequest} />
                  ) : (
                    <div className="text-center py-12 text-slate-500">No original registration data available.</div>
                  )}
                </div>
              ) : activeTab === 'renewal-form' ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
                  {isRenewalLocked ? (
                    <ReadonlyRenewalDetails request={renewalRequest} />
                  ) : (
                    <ApplicationForm prefillSocietyName={society.name} />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 text-slate-400 animate-pulse">
                  Content for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} coming soon...
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default SocietyDashboard;
