'use client';

import React from 'react';

const HealthStatus: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col justify-between">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Society Health &amp; Status</h3>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-100 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Active</p>
          <p className="text-2xl font-extrabold text-orange-700">40</p>
        </div>
        <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-100 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Review</p>
          <p className="text-2xl font-extrabold text-orange-500">5</p>
        </div>
        <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-100 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Suspended</p>
          <p className="text-2xl font-extrabold text-red-600">3</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall System Health</p>
        <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100">
          <div className="h-full bg-orange-700" style={{ width: '80%' }}></div>
          <div className="h-full bg-orange-400" style={{ width: '15%' }}></div>
          <div className="h-full bg-red-500" style={{ width: '5%' }}></div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-700"></div> Excellent
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div> Caution
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Critical
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthStatus;
