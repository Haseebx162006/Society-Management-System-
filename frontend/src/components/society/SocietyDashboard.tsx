import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { MdGroups, MdEvent } from 'react-icons/md';
import { FaUsers, FaArrowRight, FaBell, FaBars } from 'react-icons/fa';
import { useGetEventsBySocietyQuery } from '@/lib/features/events/eventApiSlice';
import { useGetSocietyRequestForSocietyQuery, useGetMySocietyRequestsQuery } from '@/lib/features/societies/societyApiSlice';
import { Lock, AlertCircle } from 'lucide-react';

import MemberBarChart from '@/components/charts/MemberBarChart';
import GrowthLineChart from '@/components/charts/GrowthLineChart';
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
  const { data: societyRequest, isLoading: isRequestLoading } = useGetSocietyRequestForSocietyQuery(society._id, { 
    skip: activeTab !== 'review-form'
  });
  const { data: myRequests = [] } = useGetMySocietyRequestsQuery(undefined, {
    skip: activeTab !== 'renewal-form'
  });

  const renewalRequest = (myRequests as { request_type: string, society_name: string, status: string, form_data: any }[]).find(
    (r) => r.request_type === 'RENEWAL' && r.society_name === society.name
  );
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

  const teamDistributionData = useMemo(() => {
    if (!society.groups || !society.members) return null;

    const groupCounts: Record<string, number> = {};
    const groupNames: Record<string, string> = {};

    society.groups.forEach((g: { _id: string | { toString(): string }; name: string }) => {
      const gId = typeof g._id === 'object' ? g._id.toString() : g._id;
      groupCounts[gId] = 0;
      groupNames[gId] = g.name;
    });
    
    let unassignedCount = 0;

    society.members.forEach((m: { group_id?: { _id?: string; toString(): string } | string; user_id?: { name?: string } }) => {
        let groupId: string | null = null;
        
        if (m.group_id) {
            if (typeof m.group_id === 'object' && m.group_id._id) {
                groupId = m.group_id._id.toString();
            } else if (typeof m.group_id === 'object' && !m.group_id._id) { 
                 groupId = m.group_id.toString();
            } else {
                groupId = m.group_id.toString();
            }
        }

        if (groupId && groupCounts[groupId] !== undefined) {
            groupCounts[groupId]++;
        } else {
            unassignedCount++;
        }
    });

    const labels = [...Object.values(groupNames), 'General Members'];
    const data = [...Object.values(groupCounts), unassignedCount];

    return {
      labels,
      datasets: [
        {
          label: '# of Members',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(249, 115, 22, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(249, 115, 22, 0.4)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(201, 203, 207, 0.6)' 
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(249, 115, 22, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(255, 159, 64, 1)',
            'rgba(201, 203, 207, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [society.groups, society.members]);

  const growthData = useMemo(() => {
      if (!society.members) return null;

      const sortedMembers = [...society.members].sort((a, b) => 
        new Date(a.assigned_at).getTime() - new Date(b.assigned_at).getTime()
      );

      const monthsMap: Record<string, number> = {};
      let cumulativeCount = 0;

      sortedMembers.forEach((m) => {
          const date = new Date(m.assigned_at);
          const key = date.toLocaleString('default', { month: 'short' });
          cumulativeCount++;
          monthsMap[key] = cumulativeCount;
      });

      const labels = Object.keys(monthsMap);
      const dataPoints = Object.values(monthsMap);


      if (labels.length === 0) {
           return {
            labels: ['Start'],
            datasets: [{
                fill: true,
                label: 'Growth',
                data: [0],
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                tension: 0.4,
            }]
           }
      }

      return {
        labels,
        datasets: [
          {
            fill: true,
            label: 'Growth',
            data: dataPoints,
            borderColor: 'rgb(249, 115, 22)',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            tension: 0.4,
          },
        ],
      };
  }, [society.members]);


  const recentActivity = useMemo(() => {
      return [...society.members]
        .sort((a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime())
        .slice(0, 5);
  }, [society.members]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        role={currentUserRole}
        renewal_approved={isApproved}
      />

      {/* Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 lg:ml-64 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-stone-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <FaBars size={24} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {society.name} <span className="text-orange-600">Dashboard</span>
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                <p className="text-slate-500 font-medium text-sm md:text-base">Welcome back, {currentUserRole === 'PRESIDENT' ? 'President' : currentUserRole === 'EVENT MANAGER' ? 'Event Manager' : currentUserRole === 'FINANCE MANAGER' ? 'Finance Manager' : ''} {user?.name}</p>
                {!isApproved && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                    <Lock className="w-3 h-3" /> Renewal Required
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {(!isApproved && activeTab !== 'renewal-form' && activeTab !== 'review-form') ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-6">
              <Lock className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Feature Locked</h3>
            <p className="text-slate-500 max-w-sm px-6">
              This feature is currently locked. You must submit and receive approval for your society&apos;s renewal request to regain full access to the dashboard.
            </p>
            <button 
              onClick={() => setActiveTab('renewal-form')}
              className="mt-8 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
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
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <StatCard title="Total Members" value={society.members?.length || 0} icon={<FaUsers />} color="orange" />
                  <StatCard title="Total Teams" value={society.groups?.length || 0} icon={<MdGroups />} color="stone" />
                  <StatCard title="Events Held" value={events?.length || 0} icon={<MdEvent />} color="orange" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Member Growth</h3>
                    <div className="h-64">
                       {growthData && <GrowthLineChart data={growthData} />}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Team Distribution</h3>
                    <div className="h-64 flex justify-center">
                      {teamDistributionData && <MemberBarChart data={teamDistributionData} />}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((member: SocietyMember, i: number) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-orange-50/50 transition-colors cursor-default">
                            <div className="w-10 h-10 rounded-full bg-orange-100/50 flex items-center justify-center text-orange-600 text-lg shadow-sm">
                                <FaBell />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-800">
                                   <span className="font-bold">{member.user_id?.name || "Unknown User"}</span> joined the society
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {new Date(member.assigned_at).toLocaleDateString()}
                                </p>
                            </div>
                            </div>
                        ))
                      ) : (
                          <div className="text-slate-400 text-center py-4">No recent activity</div>
                      )}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                      {(currentUserRole === 'PRESIDENT' || currentUserRole === 'EVENT MANAGER') && (
                          <>
                            {currentUserRole === 'PRESIDENT' && <ActionButton label="Manage Teams" onClick={() => setActiveTab('teams')} />}
                            <ActionButton label="Manage Events" onClick={() => setActiveTab('events')} />
                          </>
                      )}
                      {(currentUserRole === 'PRESIDENT' || currentUserRole === 'FINANCE MANAGER') && (
                        <ActionButton label="Approve Members" onClick={() => setActiveTab('join-requests')} />
                      )}
                      {currentUserRole === 'PRESIDENT' && (
                        <ActionButton label="Edit Society Settings" onClick={() => setActiveTab('settings')} />
                      )}
                    </div>
                  </div>
                </div>
              </>
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
      </div>
    </div>
  );
};


const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => {
  const colorMap: Record<string, string> = {
    orange: "bg-orange-50 text-orange-600",
    stone: "bg-stone-50 text-stone-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    green: "bg-green-50 text-green-600",
    cyan: "bg-cyan-50 text-cyan-600"
  };

  const iconClass = colorMap[color] || "bg-slate-100 text-slate-600";

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <h4 className="text-3xl font-bold text-slate-800">{value}</h4>
        </div>
        <span className={`text-2xl p-3 rounded-xl ${iconClass}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}

const ActionButton = ({ label, onClick }: { label: string, onClick?: () => void }) => (
  <button onClick={onClick} className="w-full text-left px-5 py-4 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-xl text-slate-700 hover:text-orange-700 transition-all flex justify-between items-center group font-medium">
    {label}
    <span className="text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-transform">
      <FaArrowRight />
    </span>
  </button>
);

export default SocietyDashboard;
