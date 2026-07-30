'use client';

import React from 'react';
import { User, Check, RefreshCw } from 'lucide-react';

interface ActivityItem {
  id: string | number;
  title: string;
  time: string;
  type?: 'join' | 'event' | 'renewal' | 'general';
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const defaultActivities = [
    {
      id: 1,
      title: 'IEEE Society renewal request submitted.',
      time: '12 minutes ago',
      type: 'renewal' as const,
    },
    {
      id: 2,
      title: 'Robotics Club registration approved.',
      time: '1 hour ago',
      type: 'event' as const,
    },
    {
      id: 3,
      title: 'Ali Khan assigned as President of Data Science Soc.',
      time: '3 hours ago',
      type: 'join' as const,
    },
  ];

  const displayList = activities && activities.length > 0 ? activities : defaultActivities;

  const getIcon = (type?: string) => {
    switch (type) {
      case 'renewal':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 text-orange-600" />,
          bg: 'bg-orange-50',
        };
      case 'event':
        return {
          icon: <Check className="w-3.5 h-3.5 text-white" />,
          bg: 'bg-orange-700 shadow-sm shadow-orange-700/40',
        };
      case 'join':
      default:
        return {
          icon: <User className="w-3.5 h-3.5 text-slate-605 text-slate-600" />,
          bg: 'bg-slate-100',
        };
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col justify-between">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
        <p className="text-xs text-slate-400">Timeline of the latest society actions</p>
      </div>
      <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 flex-1 flex flex-col justify-center">
        {displayList.map((item) => {
          const style = getIcon(item.type);
          return (
            <div key={item.id} className="relative pl-10">
              <div
                className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ${style.bg}`}
              >
                {style.icon}
              </div>
              <div>
                <p className="text-sm text-slate-700 font-semibold">{item.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
