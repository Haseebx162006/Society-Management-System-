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
  user?: any;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose, role = 'MEMBER', renewal_approved = true, user }) => {
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

  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const navigationGroups = [
    {
      title: 'Main',
      items: [
        { id: 'overview', label: 'Overview', icon: <MdDashboard />, roles: ['PRESIDENT', 'FACULTY ADVISOR', 'FINANCE MANAGER', 'DOCUMENTATION MANAGER', 'LEAD', 'CO-LEAD', 'SPONSOR MANAGER', 'MEMBER', 'EVENT MANAGER'] },
      ]
    },
    {
      title: 'Membership',
      items: [
        { id: 'members', label: 'Active Members', icon: <FaUsers />, roles: ['PRESIDENT', 'FACULTY ADVISOR'] },
        { id: 'teams', label: 'Team Management', icon: <MdGroups />, roles: ['PRESIDENT', 'FACULTY ADVISOR', 'LEAD', 'CO-LEAD'] },
        { id: 'join-requests', label: 'Member Applications', icon: <FaClipboardList />, roles: ['PRESIDENT', 'FACULTY ADVISOR', 'FINANCE MANAGER'] },
        { id: 'previous-members', label: 'Previous Members', icon: <FaHistory />, roles: ['PRESIDENT', 'FACULTY ADVISOR'] },
      ]
    },
    {
      title: 'Events & Engagement',
      items: [
        { id: 'events', label: 'Manage Events', icon: <MdEvent />, roles: ['PRESIDENT', 'FACULTY ADVISOR', 'LEAD', 'CO-LEAD', 'MEMBER', 'EVENT MANAGER'] },
        { id: 'event-forms', label: 'Event Form Builder', icon: <FaWpforms />, roles: ['PRESIDENT', 'FACULTY ADVISOR', 'EVENT MANAGER'] },
        { id: 'sponsors', label: 'Sponsorships', icon: <FaHandshake />, roles: ['PRESIDENT', 'FACULTY ADVISOR', 'SPONSOR MANAGER'] },
      ]
    },
    {
      title: 'Administrative',
      items: [
        { id: 'documentation', label: 'Documents & Reports', icon: <FileText className="w-5 h-5" />, roles: ['PRESIDENT', 'FACULTY ADVISOR', 'DOCUMENTATION MANAGER', 'FINANCE MANAGER', 'EVENT MANAGER', 'SPONSOR MANAGER'] },
        { id: 'settings', label: 'Society Profile', icon: <MdSettings />, roles: ['PRESIDENT', 'FACULTY ADVISOR'] },
        { id: 'join-form', label: 'Membership Form', icon: <FaWpforms />, roles: ['PRESIDENT', 'FACULTY ADVISOR'] },
        { id: 'renewal-form', label: 'Annual Renewals', icon: <RefreshCw className="w-5 h-5" />, roles: ['PRESIDENT', 'FACULTY ADVISOR'] },
        { id: 'review-form', label: 'Society Reviews', icon: <FileText className="w-5 h-5" />, roles: ['PRESIDENT', 'FACULTY ADVISOR'] },
      ]
    }
  ];

  const filteredGroups = navigationGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.includes(role))
  })).filter(group => group.items.length > 0);

  return (
    <div className={`fixed inset-y-0 left-0 w-64 lg:w-20 lg:hover:w-64 bg-white border-r border-slate-200 flex flex-col h-screen overflow-y-auto overflow-x-hidden shadow-sm z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} group peer`}>
      <div className="p-6 lg:p-4 lg:group-hover:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 transition-all duration-300">
        <h2 className="text-xl font-extrabold text-orange-600 tracking-tight flex items-center gap-2">
          <span className="bg-orange-600 text-white rounded-lg p-1.5 text-xs flex-shrink-0">
             {role === 'PRESIDENT' ? 'SA' : role === 'FACULTY ADVISOR' ? 'FA' : role === 'FINANCE MANAGER' ? 'FM' : role === 'EVENT MANAGER' ? 'EM' : role === 'SPONSOR MANAGER' ? 'SM' : role === 'DOCUMENTATION MANAGER' ? 'DM' : 'MB'}
          </span>
          <span className="text-sm font-bold truncate max-w-[140px] lg:opacity-0 lg:max-w-0 lg:group-hover:opacity-100 lg:group-hover:max-w-[140px] transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap" title={role}>
             {role === 'PRESIDENT' ? 'Society Admin' : role === 'FACULTY ADVISOR' ? 'Faculty Advisor' : role.replace('_', ' ')}
          </span>
        </h2>
        <button 
          onClick={onClose}
          className="lg:hidden text-slate-400 hover:text-orange-600 p-2 rounded-lg transition-colors"
        >
          <MdClose size={24} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-6">
        {filteredGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 lg:opacity-0 lg:max-w-0 lg:group-hover:opacity-100 lg:group-hover:max-w-full transition-all duration-300 whitespace-nowrap overflow-hidden">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
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
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all font-medium text-sm group/btn ${
                      activeTab === item.id
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                        : isLocked 
                          ? 'text-slate-300 cursor-not-allowed opacity-60'
                          : 'text-slate-500 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg flex-shrink-0 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover/btn:text-orange-600'}`}>
                        {item.icon}
                      </span>
                      <span className="lg:opacity-0 lg:max-w-0 lg:group-hover:opacity-100 lg:group-hover:max-w-xs transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap">{item.label}</span>
                    </div>
                    {isLocked && (
                      <div className="lg:opacity-0 lg:max-w-0 lg:group-hover:opacity-100 lg:group-hover:max-w-xs transition-all duration-300 overflow-hidden">
                        <Lock className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-1 bg-slate-50/50">
        <button 
          onClick={() => router.push('/')}
          className="w-full flex items-center gap-3 text-slate-500 hover:text-orange-600 hover:bg-orange-50 p-2.5 rounded-xl transition-all font-medium text-sm group/btn"
        >
          <span className="text-lg text-slate-400 group-hover/btn:text-orange-600 flex-shrink-0"><FaHome /></span>
          <span className="lg:opacity-0 lg:max-w-0 lg:group-hover:opacity-100 lg:group-hover:max-w-xs transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap">Return Home</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-xl transition-all font-medium text-sm group/btn"
        >
          <span className="text-lg text-slate-400 group-hover/btn:text-red-600 flex-shrink-0"><FaSignOutAlt /></span>
          <span className="lg:opacity-0 lg:max-w-0 lg:group-hover:opacity-100 lg:group-hover:max-w-xs transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
