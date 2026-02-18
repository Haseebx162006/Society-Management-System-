import { MdDashboard, MdEvent, MdSettings, MdGroups } from 'react-icons/md';
import { FaEdit, FaSignOutAlt, FaUsers, FaWpforms, FaClipboardList, FaHome } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logOut, selectRefreshToken } from '@/lib/features/auth/authSlice';
import { useLogoutMutation } from '@/lib/features/auth/authApiSlice';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onViewForm?: () => void;
  role?: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeTab, setActiveTab, onViewForm, role = 'MEMBER' }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const refreshToken = useAppSelector(selectRefreshToken);
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await logoutApi({ refreshToken }).unwrap();
      }
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      dispatch(logOut());
      router.push("/");
    }
  };

  const allNavItems = [
    { id: 'overview', label: 'Overview', icon: <MdDashboard />, roles: ['PRESIDENT', 'FINANCE MANAGER', 'LEAD', 'CO-LEAD', 'GENERAL SECRETARY', 'MEMBER'] },
    { id: 'members', label: 'Members', icon: <FaUsers />, roles: ['PRESIDENT', 'GENERAL SECRETARY'] },
    { id: 'teams', label: 'Teams', icon: <MdGroups />, roles: ['PRESIDENT', 'LEAD', 'CO-LEAD'] },
    { id: 'join-form', label: 'Join Form', icon: <FaWpforms />, roles: ['PRESIDENT'] },
    { id: 'join-requests', label: 'Join Requests', icon: <FaClipboardList />, roles: ['PRESIDENT', 'FINANCE MANAGER'] }, // FINANCE MANAGER added here
    { id: 'events', label: 'Events', icon: <MdEvent />, roles: ['PRESIDENT', 'LEAD', 'CO-LEAD', 'GENERAL SECRETARY', 'MEMBER'] },
    { id: 'settings', label: 'Settings', icon: <MdSettings />, roles: ['PRESIDENT'] },
  ];

  // Filter items based on role
  const navItems = allNavItems.filter(item => item.roles.includes(role));

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto shadow-sm z-50">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-extrabold text-blue-600 tracking-tight flex items-center gap-2">
          <span className="bg-blue-600 text-white rounded-lg p-1 text-sm">
             {role === 'PRESIDENT' ? 'SA' : role === 'FINANCE MANAGER' ? 'FM' : 'SM'}
          </span>
          <span className="text-sm truncate max-w-[140px]" title={role}>
             {role === 'PRESIDENT' ? 'Society Admin' : role.replace('_', ' ')}
          </span>
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === item.id
                ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        {role === 'PRESIDENT' && (
            <>
                <div className="my-4 border-t border-slate-100 mx-2"></div>
                <button
                onClick={onViewForm}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-purple-50 hover:text-purple-600 transition-all font-medium"
                >
                <span className="text-xl">{<FaEdit />}</span>
                <span>View Creation Form</span>
                </button>
            </>
        )}

      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <button 
          onClick={() => router.push('/')}
          className="w-full flex items-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-xl transition-all font-medium text-sm"
        >
          <span className="text-xl">{<FaHome />}</span> Return Home
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all font-medium text-sm"
        >
          <span className="text-xl">{<FaSignOutAlt />}</span> Log Out
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
