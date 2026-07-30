'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';

const PlatformInsights: React.FC = () => {
  return (
    <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-orange-700 flex flex-col md:flex-row md:items-center gap-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 flex-shrink-0">
        <Lightbulb className="w-5 h-5 text-orange-700 animate-pulse" />
        <h4 className="font-bold text-slate-800 text-sm whitespace-nowrap">Platform Insights</h4>
      </div>
      <div className="h-4 w-[1px] bg-slate-200 hidden md:block"></div>
      <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-x-8 gap-y-2">
        <li className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-700 flex-shrink-0"></span>
          Peak registration activity occurs between <span className="font-extrabold text-slate-800 ml-1">14:00 - 16:00</span>.
        </li>
        <li className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-700 flex-shrink-0"></span>
          Tech societies have <span className="font-extrabold text-slate-800 ml-1">32% higher</span> engagement rates.
        </li>
        <li className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-700 flex-shrink-0"></span>
          System uptime maintained at <span className="font-extrabold text-slate-800 ml-1">99.98%</span> this month.
        </li>
      </ul>
    </div>
  );
};

export default PlatformInsights;
