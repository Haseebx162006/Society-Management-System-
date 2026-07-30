'use client';

import React from 'react';
import { RefreshCw, Check, User } from 'lucide-react';

const ActivityFeed: React.FC = () => {
  const activities = [
    {
      id: 1,
      title: 'IEEE Society renewal request submitted.',
      time: '12 minutes ago',
      icon: <RefreshCw className="w-3.5 h-3.5 text-orange-600" />,
      iconBg: 'bg-orange-50',
    },
    {
      id: 2,
      title: 'Robotics Club registration approved.',
      time: '1 hour ago',
      icon: <Check className="w-3.5 h-3.5 text-white" />,
      iconBg: 'bg-orange-700 shadow-sm shadow-orange-700/40',
    },
    {
      id: 3,
      title: 'Ali Khan assigned as President of Data Science Soc.',
      time: '3 hours ago',
      icon: <User className="w-3.5 h-3.5 text-slate-600" />,
      iconBg: 'bg-slate-100',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col justify-between">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
      </div>
      <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 flex-1 flex flex-col justify-center">
        {activities.map((item) => (
          <div key={item.id} className="relative pl-10">
            <div
              className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ${item.iconBg}`}
            >
              {item.icon}
            </div>
            <div>
              <p className="text-sm text-slate-700 font-medium">
                {/* Style parts of text if matches society name */}
                {item.title.includes('IEEE Society') ? (
                  <>
                    <span className="font-bold text-slate-900">IEEE Society</span> renewal request submitted.
                  </>
                ) : item.title.includes('Robotics Club') ? (
                  <>
                    <span className="font-bold text-slate-900">Robotics Club</span> registration approved.
                  </>
                ) : item.title.includes('Ali Khan') ? (
                  <>
                    <span className="font-bold text-slate-900">Ali Khan</span> assigned as President of Data Science Soc.
                  </>
                ) : (
                  item.title
                )}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
