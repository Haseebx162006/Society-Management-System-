import React, { useMemo } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { selectCurrentUser } from '@/lib/features/auth/authSlice';
import { useGetAllSocietiesQuery } from '@/lib/features/societies/societyApiSlice';
import { FaUniversity, FaUsers } from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';
import AdminRequests from './AdminRequests';
import AdminSocieties from './AdminSocieties';
import AdminPresidents from './AdminPresidents';
import AdminMembers from './AdminMembers';
import GrowthLineChart from '@/components/charts/GrowthLineChart';
import MemberBarChart from '@/components/charts/MemberBarChart';

const AdminDashboard: React.FC = () => {
  const user = useAppSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = React.useState('overview');
  
  const { data: societies, isLoading } = useGetAllSocietiesQuery(undefined);

  const totalSocieties = societies?.length || 0;
  
  const totalMembers = useMemo(() => {
    if (!societies) return 0;
    return societies.reduce((acc: number, society: any) => acc + (society.membersCount || 0), 0);
  }, [societies]);

  const societyDistributionData = useMemo(() => {
    if (!societies) return null;
    
    const labels = societies.map((s: any) => s.name);
    const data = societies.map((s: any) => s.membersCount || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Members per Society',
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
  }, [societies]);

  const growthData = useMemo(() => {
    if (!societies || societies.length === 0) return null;

    const sortedSocieties = [...societies].sort((a, b) => 
      new Date(a.created_at || new Date()).getTime() - new Date(b.created_at || new Date()).getTime()
    );

    const monthsMap: Record<string, number> = {};
    let cumulativeCount = 0;

    sortedSocieties.forEach((s) => {
        const date = new Date(s.created_at || new Date());
        const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
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
              label: 'Societies Growth',
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
          label: 'Societies Growth',
          data: dataPoints,
          borderColor: 'rgb(249, 115, 22)',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          tension: 0.4,
        },
      ],
    };
  }, [societies]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              System <span className="text-orange-600">Admin</span>
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Welcome back, {user?.name}</p>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Total Societies</p>
                    <h4 className="text-3xl font-bold text-slate-800">{isLoading ? '...' : totalSocieties}</h4>
                  </div>
                  <span className="text-2xl p-3 rounded-xl bg-orange-50 text-orange-600">
                    <FaUniversity />
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-sm font-medium mb-1">Total Platform Members</p>
                    <h4 className="text-3xl font-bold text-slate-800">{isLoading ? '...' : totalMembers}</h4>
                  </div>
                  <span className="text-2xl p-3 rounded-xl bg-orange-50 text-orange-600">
                    <FaUsers />
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Society Growth</h3>
                <div className="h-64">
                   {growthData && <GrowthLineChart data={growthData} />}
                </div>
              </div>
              
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Members by Society</h3>
                <div className="h-64 flex justify-center">
                  {societyDistributionData && <MemberBarChart data={societyDistributionData} />}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'members' ? (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <AdminMembers />
          </div>
        ) : activeTab === 'presidents' ? (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <AdminPresidents />
          </div>
        ) : activeTab === 'requests' ? (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <AdminRequests />
          </div>
        ) : activeTab === 'societies' ? (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <AdminSocieties />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdminDashboard;
