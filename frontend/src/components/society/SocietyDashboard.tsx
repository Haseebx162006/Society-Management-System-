import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

import TeamDoughnutChart from '@/components/charts/TeamDoughnutChart';
import GrowthLineChart from '@/components/charts/GrowthLineChart';
import DashboardSidebar from '@/components/society/DashboardSidebar';
import CreateSocietyForm from '@/components/society/CreateSocietyForm';


interface SocietyDashboardProps {
  society: any;
}

const SocietyDashboard: React.FC<SocietyDashboardProps> = ({ society }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  // --- Prepare Chart Data ---
  
  // 1. Members per Team (using groups to simulate)
  const teamLabels = society.groups?.map((g: any) => g.name) || ['General'];
  
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
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
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
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
      };



  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex">
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
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-cyan-300">
            {society.name} Dashboard
          </h1>
          <p className="text-blue-300/60 mt-1">Welcome back, President {user?.name}</p>
        </div>
        <div className="flex gap-4">
             <button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-4 py-2 rounded-lg border border-blue-500/30 transition-all"
             >
                Settings
             </button>
             <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg shadow-blue-500/20 transition-all">
                View Society
             </button>
        </div>
      </div>

      {showCreateForm ? (
         <div className="animate-in fade-in slide-in-from-right-8 duration-500">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-200">Edit Society Settings</h2>
                <button 
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-white"
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
                        <StatCard title="Total Members" value={society.members?.length || 0} icon="👥" color="blue" />
                        <StatCard title="Total Teams" value={society.groups?.length || 0} icon="🛡️" color="cyan" />
                        <StatCard title="Events Held" value="0" icon="📅" color="purple" />
                        <StatCard title="Revenue" value={`PKR ${society.registration_fee * (society.members?.length || 0)}`} icon="💰" color="green" />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-[#1e293b]/50 border border-blue-500/10 rounded-2xl p-6 backdrop-blur-sm">
                            <h3 className="text-xl font-semibold text-blue-200 mb-4">Member Growth</h3>
                            <div className="h-64">
                                <GrowthLineChart data={growthData} />
                            </div>
                        </div>
                        <div className="bg-[#1e293b]/50 border border-blue-500/10 rounded-2xl p-6 backdrop-blur-sm">
                            <h3 className="text-xl font-semibold text-blue-200 mb-4">Team Distribution</h3>
                            <div className="h-64 flex justify-center">
                                <TeamDoughnutChart data={teamDistributionData} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-[#1e293b]/50 border border-blue-500/10 rounded-2xl p-6 backdrop-blur-sm">
                            <h3 className="text-xl font-semibold text-blue-200 mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {/* Placeholder Activity Items */}
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 bg-blue-900/10 rounded-lg border border-blue-500/5 hover:bg-blue-900/20 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300">
                                            🔔
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-100">New member joined the society</p>
                                            <p className="text-xs text-blue-400">2 hours ago</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-[#1e293b]/50 border border-blue-500/10 rounded-2xl p-6 backdrop-blur-sm">
                            <h3 className="text-xl font-semibold text-blue-200 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <ActionButton label="Create Event" />
                                <ActionButton label="Manage Teams" />
                                <ActionButton label="Approve Members" />
                                <ActionButton label="Send Announcement" />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-96 text-blue-400 animate-pulse">
                    Content for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} coming soon...
                </div>
            )}
        </>
      )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
    <div className={`bg-[#1e293b]/50 border border-${color}-500/20 rounded-xl p-6 backdrop-blur-sm hover:translate-y-[-2px] transition-transform duration-300`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-400 text-sm font-medium">{title}</p>
                <h4 className="text-2xl font-bold text-white mt-2">{value}</h4>
            </div>
            <span className={`text-2xl p-2 bg-${color}-500/10 rounded-lg`}>{icon}</span>
        </div>
    </div>
);

const ActionButton = ({ label }: { label: string }) => (
    <button className="w-full text-left px-4 py-3 bg-blue-900/10 hover:bg-blue-500/20 border border-blue-500/10 rounded-lg text-blue-200 transition-all flex justify-between items-center group">
        {label}
        <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
    </button>
);

export default SocietyDashboard;
