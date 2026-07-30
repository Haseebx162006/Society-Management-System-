'use client';

import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

interface TopBarProps {
  user: {
    name?: string;
    email?: string;
    profilePicture?: string;
    [key: string]: any;
  } | null;
  role?: string;
  onOpenSidebar?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ user, role = 'System Administrator', onOpenSidebar }) => {
  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  return (
    <header className="fixed top-0 left-0 lg:left-20 right-0 h-20 bg-white/80 backdrop-blur-xl z-40 border-b border-slate-100 px-6 md:px-8 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
          <input
            type="text"
            className="w-full bg-slate-50 border-0 rounded-full py-2 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-slate-800 placeholder-slate-400"
            placeholder="Search societies or members..."
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r border-slate-100 pr-6">
          <button className="relative p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-600 rounded-full ring-2 ring-white"></span>
          </button>
        </div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-slate-400 font-medium capitalize">{role.toLowerCase().replace('_', ' ')}</p>
          </div>
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-10 h-10 rounded-full border border-slate-100 object-cover shadow-sm group-hover:border-orange-200 transition-colors"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm border border-orange-200 shadow-sm group-hover:bg-orange-200 transition-colors">
              {userInitials}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
