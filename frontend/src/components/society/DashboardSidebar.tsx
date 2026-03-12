import { MdDashboard, MdEvent, MdSettings, MdGroups, MdClose } from 'react-icons/md';
import { FaSignOutAlt, FaUsers, FaWpforms, FaClipboardList, FaHome, FaHistory, FaHandshake } from 'react-icons/fa';
import { RefreshCw, FileText, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logOut, selectRefreshToken } from '@/lib/features/auth/authSlice';
import { useLogoutMutation } from '@/lib/features/auth/authApiSlice';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  role?: string;
  renewal_approved?: boolean;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose, role = 'MEMBER', renewal_approved = true }) => {
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
    { id: 'overview', label: 'Overview', icon: <MdDashboard />, roles: ['PRESIDENT', 'FACULTY ADVISOR', 'FINANCE MANAGER', 'DOCUMENTATION MANAGER', 'LEAD', 'CO-LEAD', 'SPONSOR MANAGER', 'MEMBER'] },
    { id: 'members', label: 'Members', icon: <FaUsers />, roles: ['PRESIDENT', 'FACULTY ADVISOR'] },
    { id: 'teams', label: 'Teams', icon: <MdGroups />, roles: ['PRESIDENT', 'FACULTY ADVISOR', 'LEAD', 'CO-LEAD'] },
    { id: 'join-form', label: 'Join Form', icon: <FaWpforms />, roles: ['PRESIDENT', 'FACULTY ADVISOR'] },
    { id: 'join-requests', label: 'Join Requests', icon: <FaClipboardList />, roles: ['PRESIDENT', 'FACULTY ADVISOR', 'FINANCE MANAGER'] },
    { id: 'previous-members', label: 'Previous Members', icon: <FaHistory />, roles: ['PRESIDENT', 'FACULTY ADVISOR'] },
    { id: 'events', label: 'Events', icon: <MdEvent />, roles: ['PRESIDENT', 'FACULTY ADVISOR', 'LEAD', 'CO-LEAD', 'MEMBER', 'EVENT MANAGER'] },
    { id: 'event-forms', label: 'Event Forms', icon: <FaWpforms />, roles: ['PRESIDENT', 'FACULTY ADVISOR', 'EVENT MANAGER'] },
    { id: 'sponsors', label: 'Sponsors', icon: <FaHandshake />, roles: ['PRESIDENT', 'FACULTY ADVISOR', 'SPONSOR MANAGER'] },
    { id: 'documentation', label: 'Documentation', icon: <FaClipboardList />, roles: ['PRESIDENT', 'FACULTY ADVISOR', 'DOCUMENTATION MANAGER', 'FINANCE MANAGER', 'EVENT MANAGER', 'SPONSOR MANAGER'] },
    { id: 'settings', label: 'Society Form', icon: <MdSettings />, roles: ['PRESIDENT', 'FACULTY ADVISOR'] },
    { id: 'renewal-form', label: 'Renewal Form', icon: <RefreshCw className="w-5 h-5" />, roles: ['PRESIDENT', 'FACULTY ADVISOR'] },
    { id: 'review-form', label: 'Review Form', icon: <FileText className="w-5 h-5" />, roles: ['PRESIDENT', 'FACULTY ADVISOR'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  return (
    <div className={`fixed inset-y-0 left-0 w-64 bg-[#fffdfa] border-r border-stone-200 flex flex-col h-screen overflow-y-auto shadow-sm z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 border-b border-stone-100 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-orange-600 tracking-tight flex items-center gap-2">
          <span className="bg-orange-600 text-white rounded-lg p-1 text-sm">
             {role === 'PRESIDENT' ? 'SA' : role === 'FACULTY ADVISOR' ? 'FA' : role === 'FINANCE MANAGER' ? 'FM' : role === 'EVENT MANAGER' ? 'EM' : role === 'SPONSOR MANAGER' ? 'SM' : role === 'DOCUMENTATION MANAGER' ? 'DM' : 'MB'}
          </span>
          <span className="text-sm truncate max-w-[140px]" title={role}>
             {role === 'PRESIDENT' ? 'Society Admin' : role === 'FACULTY ADVISOR' ? 'Faculty Advisor' : role.replace('_', ' ')}
          </span>
        </h2>
        <button 
          onClick={onClose}
          className="lg:hidden text-stone-500 hover:text-orange-600 p-2 rounded-lg transition-colors"
        >
          <MdClose size={24} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isLocked = !renewal_approved && item.id !== 'renewal-form' && item.id !== 'review-form';
          
          return (
            <button
              key={item.id}
              disabled={isLocked}
              onClick={() => {
                if (!isLocked) {
                  setActiveTab(item.id);
                  onClose();
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === item.id
                  ? 'bg-orange-50 text-orange-600 border border-orange-100 shadow-sm'
                  : isLocked 
                    ? 'text-stone-300 cursor-not-allowed opacity-60'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {isLocked && <Lock className="w-4 h-4 text-stone-300" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-stone-100 space-y-2">
        <button 
          onClick={() => router.push('/')}
          className="w-full flex items-center gap-2 text-stone-500 hover:text-orange-600 hover:bg-orange-50 p-3 rounded-xl transition-all font-medium text-sm"
        >
          <span className="text-xl">{<FaHome />}</span> Return Home
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-stone-500 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all font-medium text-sm"
        >
          <span className="text-xl">{<FaSignOutAlt />}</span> Log Out
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
