'use client';

import React from 'react';

interface HealthStatusProps {
  activeMembers?: number;
  reviewCount?: number;
  suspendedCount?: number;
  renewalApproved?: boolean;
}

const HealthStatus: React.FC<HealthStatusProps> = ({
  activeMembers = 40,
  reviewCount = 5,
  suspendedCount = 3,
  renewalApproved = true,
}) => {
  // Compute health percentages dynamically
  const total = activeMembers + reviewCount + suspendedCount;
  const activePercent = total > 0 ? Math.round((activeMembers / total) * 100) : 80;
  const reviewPercent = total > 0 ? Math.round((reviewCount / total) * 100) : 15;
  const suspendedPercent = total > 0 ? 100 - activePercent - reviewPercent : 5;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col justify-between">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Society Health &amp; Status</h3>
        <p className="text-xs text-slate-400">Activity and registration compliance indicators</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-100 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Active</p>
          <p className="text-2xl font-extrabold text-orange-700">{activeMembers}</p>
        </div>
        <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-100 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Review</p>
          <p className="text-2xl font-extrabold text-orange-500">{reviewCount}</p>
        </div>
        <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-100 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Suspended</p>
          <p className="text-2xl font-extrabold text-red-600">{suspendedCount}</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall System Health</p>
        <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100">
          <div className="h-full bg-orange-700" style={{ width: `${activePercent}%` }}></div>
          <div className="h-full bg-orange-400" style={{ width: `${reviewPercent}%` }}></div>
          <div className="h-full bg-red-500" style={{ width: `${suspendedPercent}%` }}></div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-700"></div> Excellent ({activePercent}%)
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div> Caution ({reviewPercent}%)
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Critical ({suspendedPercent}%)
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStatus;
