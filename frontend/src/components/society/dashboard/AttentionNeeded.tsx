'use client';

import React from 'react';
import { FileText, RefreshCw, AlertTriangle } from 'lucide-react';

interface AttentionNeededProps {
  onAction?: (action: string) => void;
}

const AttentionNeeded: React.FC<AttentionNeededProps> = ({ onAction }) => {
  const items = [
    {
      id: 'registration',
      title: 'Registration Requests',
      description: '12 items pending review',
      icon: <FileText className="w-5 h-5 text-orange-600" />,
      iconBg: 'bg-orange-50',
      actionLabel: 'Review',
      buttonBg: 'bg-orange-700 hover:bg-orange-800 text-white',
    },
    {
      id: 'renewal',
      title: 'Renewal Requests',
      description: '8 societies awaiting update',
      icon: <RefreshCw className="w-5 h-5 text-slate-600" />,
      iconBg: 'bg-slate-100',
      actionLabel: 'Manage',
      buttonBg: 'bg-orange-700 hover:bg-orange-800 text-white',
    },
    {
      id: 'incomplete',
      title: 'Incomplete Info',
      description: '3 profiles missing documents',
      icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      iconBg: 'bg-orange-50',
      actionLabel: 'View Details',
      buttonBg: 'bg-orange-500 hover:bg-orange-600 text-white',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col justify-between">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Requires Your Attention</h3>
      </div>
      <div className="space-y-4 flex-1 flex flex-col justify-center">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-orange-50/50 transition-all border border-transparent hover:border-orange-100/50"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.iconBg}`}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-400 font-medium">{item.description}</p>
              </div>
            </div>
            <button
              onClick={() => onAction && onAction(item.id)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${item.buttonBg}`}
            >
              {item.actionLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttentionNeeded;
