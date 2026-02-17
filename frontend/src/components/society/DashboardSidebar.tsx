'use client';

import React from 'react';


interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onViewForm?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeTab, setActiveTab, onViewForm }) => {

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'members', label: 'Members', icon: '👥' },
    { id: 'teams', label: 'Teams', icon: '🛡️' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-[#1e293b]/50 border-r border-blue-500/10 backdrop-blur-sm flex flex-col h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-blue-500/10">
        <h2 className="text-xl font-bold text-blue-400">Society Admin</h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === item.id 
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                : 'text-slate-400 hover:bg-blue-900/10 hover:text-blue-200'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        <div className="my-4 border-t border-blue-500/10 mx-2"></div>
         
         <button
            onClick={onViewForm}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-purple-900/10 hover:text-purple-300 transition-all"
         >
            <span className="text-xl">📝</span>
            <span>View Creation Form</span>
         </button>

      </nav>

      <div className="p-4 border-t border-blue-500/10">
        <button className="w-full flex items-center gap-2 text-slate-500 hover:text-red-400 text-sm px-4">
          <span>🚪</span> Log Out
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
