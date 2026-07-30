'use client';

import React, { useEffect, useState } from 'react';

interface TeamItem {
  name: string;
  count: number;
  percentage: number;
}

interface CategoryChartProps {
  teamsData?: {
    labels: string[];
    data: number[];
  } | null;
}

const CategoryChart: React.FC<CategoryChartProps> = ({ teamsData }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(timer);
  }, [teamsData]);

  // Compute values
  const teams: TeamItem[] = React.useMemo(() => {
    if (teamsData && teamsData.labels && teamsData.labels.length > 0) {
      const maxCount = Math.max(...teamsData.data, 1);
      return teamsData.labels.map((label, idx) => {
        const count = teamsData.data[idx] || 0;
        const percentage = Math.round((count / maxCount) * 100);
        return {
          name: label,
          count,
          percentage,
        };
      });
    }

    // Default Fallback values
    return [
      { name: 'Technology Team', count: 14, percentage: 85 },
      { name: 'Arts & Culture Team', count: 10, percentage: 65 },
      { name: 'Sports Management', count: 8, percentage: 50 },
      { name: 'Finance & Business', count: 7, percentage: 42 },
    ];
  }, [teamsData]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col justify-between">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Members by Team</h3>
        <p className="text-xs text-slate-400">Distribution of active members across subgroups</p>
      </div>
      <div className="space-y-5 flex-1 flex flex-col justify-center">
        {teams.map((team, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between text-sm font-semibold text-slate-700">
              <span>{team.name}</span>
              <span className="font-bold text-slate-900">{team.count}</span>
            </div>
            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-700 rounded-full transition-all duration-1000 ease-out"
                style={{ width: animated ? `${team.percentage}%` : '0%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryChart;
