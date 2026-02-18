import { MdDashboard, MdEvent, MdSettings, MdGroups } from 'react-icons/md';
import { FaEdit, FaSignOutAlt, FaUsers, FaWpforms, FaClipboardList } from 'react-icons/fa';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onViewForm?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeTab, setActiveTab, onViewForm }) => {

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <MdDashboard /> },
    { id: 'members', label: 'Members', icon: <FaUsers /> },
    { id: 'teams', label: 'Teams', icon: <MdGroups /> },
    { id: 'join-form', label: 'Join Form', icon: <FaWpforms /> },
    { id: 'join-requests', label: 'Join Requests', icon: <FaClipboardList /> },
    { id: 'events', label: 'Events', icon: <MdEvent /> },
    { id: 'settings', label: 'Settings', icon: <MdSettings /> },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto shadow-sm z-50">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-extrabold text-blue-600 tracking-tight flex items-center gap-2">
          <span className="bg-blue-600 text-white rounded-lg p-1 text-sm">SA</span>
          Society Admin
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

        <div className="my-4 border-t border-slate-100 mx-2"></div>

        <button
          onClick={onViewForm}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-purple-50 hover:text-purple-600 transition-all font-medium"
        >
          <span className="text-xl">{<FaEdit />}</span>
          <span>View Creation Form</span>
        </button>

      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="w-full flex items-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all font-medium text-sm">
          <span className="text-xl">{<FaSignOutAlt />}</span> Log Out
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
