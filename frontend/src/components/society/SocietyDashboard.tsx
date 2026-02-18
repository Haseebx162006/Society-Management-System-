import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { MdGroups, MdEvent } from 'react-icons/md';
import { FaUsers, FaArrowRight, FaBell } from 'react-icons/fa';
import { useGetEventsBySocietyQuery } from '@/lib/features/events/eventApiSlice';

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


interface SocietyDashboardProps {
  society: {
    _id: string;
    name: string;
    description: string;
    members: any[];
    groups: any[];
    registration_fee: number;
    content_sections: any[];
    [key: string]: any;
  };
}

const SocietyDashboard: React.FC<SocietyDashboardProps> = ({ society }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const { data: events } = useGetEventsBySocietyQuery(society._id);

  // Determine current user's role
  const currentUserRole = useMemo(() => {
      if (!user || !society.members) return 'MEMBER';
      const userId = user._id || user.id;
      // Member objects usually have populated user_id object OR just string id
      const member = society.members.find((m: any) => {
          const mUserId = typeof m.user_id === 'object' ? m.user_id._id : m.user_id;
          return mUserId === userId;
      });
      return member?.role || 'MEMBER';
  }, [user, society.members]);

  // --- Process Dynamic Data ---

  // 1. Team Distribution
  const teamDistributionData = useMemo(() => {
    if (!society.groups || !society.members) return null;

    const groupCounts: Record<string, number> = {};
    const groupNames: Record<string, string> = {};

    console.log("Society Groups:", society.groups);
    console.log("Society Members sample:", society.members.slice(0, 3));

    // Initialize counts for all groups
    society.groups.forEach((g: any) => {
      // Ensure we use string IDs
      const gId = typeof g._id === 'object' ? g._id.toString() : g._id;
      groupCounts[gId] = 0;
      groupNames[gId] = g.name;
    });
    
    let unassignedCount = 0;

    society.members.forEach((m: any) => {
        let groupId: string | null = null;
        
        if (m.group_id) {
            // Handle populated object or string ID
            if (typeof m.group_id === 'object' && m.group_id._id) {
                groupId = m.group_id._id.toString();
            } else if (typeof m.group_id === 'object' && !m.group_id._id) { 
                 // It might be just the string ID wrapped in an object or something else? 
                 // Or if it was populated but structure is different. 
                 // Since we added populate('group_id', 'name'), it should have _id.
                 // But let's handle the toString if it's an ObjectId-like object
                 groupId = m.group_id.toString();
            } else {
                groupId = m.group_id.toString();
            }
        }

        console.log(`Member ${m.user_id?.name} GroupID: ${groupId} (Matching: ${groupId ? groupCounts[groupId] !== undefined : 'N/A'})`);

        if (groupId && groupCounts[groupId] !== undefined) {
            groupCounts[groupId]++;
        } else {
            console.log(`-> Unassigned or Group Not Found: ${groupId}`);
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
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(201, 203, 207, 0.6)' 
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(201, 203, 207, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [society.groups, society.members]);


  // 2. Growth Trend (Members joined over time)
  const growthData = useMemo(() => {
      if (!society.members) return null;

      // Sort members by join date
      const sortedMembers = [...society.members].sort((a, b) => 
        new Date(a.assigned_at).getTime() - new Date(b.assigned_at).getTime()
      );

      const monthsMap: Record<string, number> = {};
      let cumulativeCount = 0;

      sortedMembers.forEach((m) => {
          const date = new Date(m.assigned_at);
          const key = date.toLocaleString('default', { month: 'short' }); // e.g., "Jan", "Feb"
          cumulativeCount++;
          monthsMap[key] = cumulativeCount; // This is a simplified cumulative approach. 
          // For a true time-series we might need to bucket by specific month/year, 
          // but for this view, last 6 months buckets or just existing months is fine.
      });
      
      // Ensure we have labels for the keys found
      const labels = Object.keys(monthsMap);
      const dataPoints = Object.values(monthsMap);

      // If no data, show empty state or single point
      if (labels.length === 0) {
           return {
            labels: ['Start'],
            datasets: [{
                fill: true,
                label: 'Growth',
                data: [0],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
          },
        ],
      };
  }, [society.members]);

  // 3. Recent Activity (Latest members joined)
  const recentActivity = useMemo(() => {
      if (!society.members) return [];
      // Get last 5 members
      return [...society.members]
        .sort((a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime())
        .slice(0, 5);
  }, [society.members]);


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Sidebar - Fixed Left */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onViewForm={() => setShowCreateForm(true)}
        role={currentUserRole}
      />

      {/* Main Content - Pushed Right */}
      <div className="flex-1 ml-64 p-8 overflow-y-auto h-screen">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {society.name} <span className="text-blue-600">Dashboard</span>
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Welcome back, President {user?.name}</p>
          </div>
          {/* Removed Settings and View Society buttons as per request */}
        </div>

        {showCreateForm ? (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Edit Society Settings</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
            <CreateSocietyForm
              initialData={society}
              isEditing={true}
              isModal={false}
              key={society._id}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        ) : (
          <>
            {activeTab === 'overview' ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <StatCard title="Total Members" value={society.members?.length || 0} icon={<FaUsers />} color="blue" />
                  <StatCard title="Total Teams" value={society.groups?.length || 0} icon={<MdGroups />} color="indigo" />
                  <StatCard title="Events Held" value={events?.length || 0} icon={<MdEvent />} color="purple" /> 
                  {/* Revenue card removed as per request */}
                </div>

                {/* Charts Section */}
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
                        recentActivity.map((member: any) => (
                            <div key={member._id} className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-blue-50/50 transition-colors cursor-default">
                            <div className="w-10 h-10 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-600 text-lg shadow-sm">
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
                      {currentUserRole === 'PRESIDENT' && (
                          <>
                            <ActionButton label="Manage Teams" onClick={() => setActiveTab('teams')} />
                            <ActionButton label="Manage Events" onClick={() => setActiveTab('events')} />
                          </>
                      )}
                      {(currentUserRole === 'PRESIDENT' || currentUserRole === 'FINANCE MANAGER') && (
                        <ActionButton label="Approve Members" onClick={() => setActiveTab('join-requests')} />
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
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
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
  <button onClick={onClick} className="w-full text-left px-5 py-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl text-slate-700 hover:text-blue-700 transition-all flex justify-between items-center group font-medium">
    {label}
    <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform">
      <FaArrowRight />
    </span>
  </button>
);

export default SocietyDashboard;
