'use client';

import React from 'react';
import { Building2, Users2, ClipboardCheck, RefreshCw, TrendingUp } from 'lucide-react';

interface KPIStatsProps {
  totalSocieties?: number;
  totalMembers?: number;
  pendingReviews?: number;
  pendingRenewals?: number;
}

const KPIStats: React.FC<KPIStatsProps> = ({
  totalSocieties = 48,
  totalMembers = 6842,
  pendingReviews = 12,
  pendingRenewals = 8,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Societies */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-1 text-orange-600 font-bold text-xs bg-orange-50 px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" />
            12.5%
          </div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Societies</p>
        <h3 className="text-3xl font-extrabold text-slate-800 mb-4">{totalSocieties}</h3>
        <div className="h-8 w-full text-orange-600/30">
          <svg className="w-full h-full text-orange-600" preserveAspectRatio="none" viewBox="0 0 100 30">
            <path
              d="M0 25 Q 10 15, 20 20 T 40 10 T 60 18 T 80 5 T 100 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>

      {/* Total Members */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
            <Users2 className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-1 text-orange-600 font-bold text-xs bg-orange-50 px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" />
            18.2%
          </div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Members</p>
        <h3 className="text-3xl font-extrabold text-slate-800 mb-4">{totalMembers.toLocaleString()}</h3>
        <div className="h-8 w-full text-slate-400/30">
          <svg className="w-full h-full text-slate-500" preserveAspectRatio="none" viewBox="0 0 100 30">
            <path
              d="M0 28 L 10 22 L 25 25 L 40 12 L 55 18 L 75 8 L 100 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>

      {/* Pending Reviews */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-8 -mt-8"></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-600 text-white rounded-xl shadow-md shadow-orange-100">
                <ClipboardCheck className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Pending Reviews</p>
            <h3 className="text-3xl font-extrabold text-slate-800">{pendingReviews}</h3>
          </div>
          <div className="mt-4 flex items-center text-orange-600 font-semibold text-sm">
            <span className="w-2 h-2 bg-orange-600 rounded-full mr-2 animate-pulse"></span>
            5 new this week
          </div>
        </div>
      </div>

      {/* Pending Renewals */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-slate-50 text-slate-500 rounded-xl">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Pending Renewals</p>
        <h3 className="text-3xl font-extrabold text-slate-800">{pendingRenewals}</h3>
        <div className="mt-4 text-slate-500 font-semibold text-sm">
          3 due this week
        </div>
      </div>
    </div>
  );
};

export default KPIStats;
