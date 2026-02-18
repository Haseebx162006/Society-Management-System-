import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { MdGroups, MdEvent, MdAttachMoney } from 'react-icons/md';
import { FaUsers, FaArrowRight, FaBell } from 'react-icons/fa';

import TeamDoughnutChart from '@/components/charts/TeamDoughnutChart';
import GrowthLineChart from '@/components/charts/GrowthLineChart';
import DashboardSidebar from '@/components/society/DashboardSidebar';
import CreateSocietyForm from '@/components/society/CreateSocietyForm';
import JoinFormManager from '@/components/society/JoinFormManager';
import JoinRequestManager from '@/components/society/JoinRequestManager';
import MembersManager from '@/components/society/MembersManager';
import TeamsManager from '@/components/society/TeamsManager';


interface SocietyDashboardProps {
  society: {
    _id: string;
    name: string;
    members: any[];
    groups: any[];
    registration_fee: number;
    [key: string]: any;
  };
}

const SocietyDashboard: React.FC<SocietyDashboardProps> = ({ society }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  // --- Prepare Chart Data ---

  // 1. Members per Team (using groups to simulate)
  const teamLabels = society.groups?.map((g: { name: string }) => g.name) || ['General'];

  /* 
     Fixing "impure function" error: 
     Math.random() behaves inconsistently during render in Strict Mode.
     Moving to useEffect ensures it runs as a side-effect.
  */
  const [teamData, setTeamData] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (society.groups) {
      const data = society.groups.map(() => Math.floor(Math.random() * 20) + 1);
      setTeamData(data);
    } else {
      setTeamData([1]);
    }
  }, [society.groups]);

  const teamDistributionData = {
    labels: teamLabels,
    datasets: [
      {
        label: '# of Members',
        data: teamData,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Growth Trend Mock
  const growthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        fill: true,
        label: 'Growth',
        data: [10, 25, 40, 55, 80, society.members?.length || 100],
        borderColor: 'rgb(59, 130, 246)', // Blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };



  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Sidebar - Fixed Left */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onViewForm={() => setShowCreateForm(true)}
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
          <div className="flex gap-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-white hover:bg-slate-50 text-slate-600 px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all font-medium"
            >
              Settings
            </button>
            <button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-medium">
              View Society
            </button>
          </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard title="Total Members" value={society.members?.length || 0} icon={<FaUsers />} color="blue" />
                  <StatCard title="Total Teams" value={society.groups?.length || 0} icon={<MdGroups />} color="indigo" />
                  <StatCard title="Events Held" value="0" icon={<MdEvent />} color="purple" />
                  <StatCard title="Revenue" value={`PKR ${society.registration_fee * (society.members?.length || 0)}`} icon={<MdAttachMoney />} color="emerald" />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Member Growth</h3>
                    <div className="h-64">
                      <GrowthLineChart data={growthData} />
                    </div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Team Distribution</h3>
                    <div className="h-64 flex justify-center">
                      <TeamDoughnutChart data={teamDistributionData} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                      {/* Placeholder Activity Items */}
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-blue-50/50 transition-colors cursor-default">
                          <div className="w-10 h-10 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-600 text-lg shadow-sm">
                            <FaBell />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">New member joined the society</p>
                            <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                      <ActionButton label="Create Event" />
                      <ActionButton label="Manage Teams" />
                      <ActionButton label="Approve Members" />
                      <ActionButton label="Send Announcement" />
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
  // Map color names to Tailwind classes dynamically without triggering "safelist" purge issues if possible, 
  // or use safe strictly mapped colors.
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

const ActionButton = ({ label }: { label: string }) => (
  <button className="w-full text-left px-5 py-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl text-slate-700 hover:text-blue-700 transition-all flex justify-between items-center group font-medium">
    {label}
    <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform">
      <FaArrowRight />
    </span>
  </button>
);

export default SocietyDashboard;
