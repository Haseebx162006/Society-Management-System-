import { MdDashboard, MdClose } from 'react-icons/md';
import { FaSignOutAlt, FaHome, FaClipboardList, FaUniversity, FaUserTie, FaUsers } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logOut, selectRefreshToken } from '@/lib/features/auth/authSlice';
import { useLogoutMutation } from '@/lib/features/auth/authApiSlice';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
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

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <MdDashboard /> },
    { id: 'members', label: 'Members', icon: <FaUsers /> },
    { id: 'presidents', label: 'Presidents', icon: <FaUserTie /> },
    { id: 'requests', label: 'Requests', icon: <FaClipboardList /> },
    { id: 'societies', label: 'Societies', icon: <FaUniversity /> },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 w-64 bg-[#fffdfa] border-r border-stone-200 flex flex-col h-screen overflow-y-auto shadow-sm z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 border-b border-stone-100 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-orange-600 tracking-tight flex items-center gap-2">
          <span className="bg-orange-600 text-white rounded-lg p-1 text-sm">
             SA
          </span>
          <span className="text-sm truncate max-w-[140px]" title="Super Admin">
             System Admin
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
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              activeTab === item.id
                ? 'bg-orange-50 text-orange-600 border border-orange-100 shadow-sm'
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-stone-100 space-y-2">
        <button 
          onClick={() => router.push('/')}
          className="w-full flex items-center gap-2 text-stone-500 hover:text-orange-600 hover:bg-orange-50 p-3 rounded-xl transition-all font-medium text-sm"
        >
          <span className="text-xl"><FaHome /></span> Return Home
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-stone-500 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all font-medium text-sm"
        >
          <span className="text-xl"><FaSignOutAlt /></span> Log Out
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
