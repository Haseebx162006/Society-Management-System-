'use client';

import React from 'react';
import { Users2, ShieldAlert, CalendarRange, Users, TrendingUp } from 'lucide-react';

interface KPIStatsProps {
  totalMembers?: number;
  totalTeams?: number;
  eventsCount?: number;
  pendingRequestsCount?: number;
}

const KPIStats: React.FC<KPIStatsProps> = ({
  totalMembers = 0,
  totalTeams = 0,
  eventsCount = 0,
  pendingRequestsCount = 0,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Members */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-orange-50 rounded-xl text-orange-700">
            <Users2 className="w-6 h-6" />
          </div>
          {totalMembers > 0 && (
            <div className="flex items-center gap-1 text-orange-750 font-bold text-xs bg-orange-50 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              Active
            </div>
          )}
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Members</p>
        <h3 className="text-3xl font-extrabold text-slate-800 mb-4">{totalMembers}</h3>
        <div className="h-10 w-full">
          <svg className="w-full h-full text-orange-700" preserveAspectRatio="none" viewBox="0 0 100 30">
            <defs>
              <linearGradient id="kpi-grad-1" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(163, 57, 0, 0.15)" />
                <stop offset="100%" stopColor="rgba(163, 57, 0, 0)" />
              </linearGradient>
            </defs>
            <path
              d="M 0 30 L 0 25 C 15 25, 25 10, 40 15 C 55 20, 65 5, 80 8 C 90 10, 95 18, 100 12 L 100 30 Z"
              fill="url(#kpi-grad-1)"
            />
            <path
              d="M 0 25 C 15 25, 25 10, 40 15 C 55 20, 65 5, 80 8 C 90 10, 95 18, 100 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Active Teams */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Active Teams</p>
        <h3 className="text-3xl font-extrabold text-slate-800 mb-4">{totalTeams}</h3>
        <div className="h-10 w-full">
          <svg className="w-full h-full text-slate-500" preserveAspectRatio="none" viewBox="0 0 100 30">
            <defs>
              <linearGradient id="kpi-grad-2" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(100, 116, 139, 0.15)" />
                <stop offset="100%" stopColor="rgba(100, 116, 139, 0)" />
              </linearGradient>
            </defs>
            <path
              d="M 0 30 L 0 28 C 15 28, 25 15, 40 20 C 55 25, 70 8, 85 12 C 90 14, 95 6, 100 5 L 100 30 Z"
              fill="url(#kpi-grad-2)"
            />
            <path
              d="M 0 28 C 15 28, 25 15, 40 20 C 55 25, 70 8, 85 12 C 90 14, 95 6, 100 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Events Count */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-orange-50 text-orange-700 rounded-xl">
            <CalendarRange className="w-6 h-6" />
          </div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Events Held</p>
        <h3 className="text-3xl font-extrabold text-slate-800 mb-4">{eventsCount}</h3>
        <div className="mt-4 text-xs font-semibold text-slate-500">
          Total organized events
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-700/5 rounded-full -mr-8 -mt-8"></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-700 text-white rounded-xl shadow-md shadow-orange-100">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Pending Requests</p>
            <h3 className="text-3xl font-extrabold text-slate-800">{pendingRequestsCount}</h3>
          </div>
          <div className="mt-4 flex items-center text-orange-750 font-semibold text-sm">
            <span className="w-2 h-2 bg-orange-750 rounded-full mr-2 animate-pulse"></span>
            Awaiting your review
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPIStats;
