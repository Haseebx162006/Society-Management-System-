'use client';

import React, { useEffect, useState } from 'react';

interface CategoryItem {
  name: string;
  count: number;
  percentage: number;
}

const CategoryChart: React.FC = () => {
  const [animated, setAnimated] = useState(false);

  const categories: CategoryItem[] = [
    { name: 'Technology', count: 14, percentage: 85 },
    { name: 'Arts & Culture', count: 10, percentage: 65 },
    { name: 'Sports', count: 8, percentage: 50 },
    { name: 'Business', count: 7, percentage: 42 },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col justify-between">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Societies by Category</h3>
      </div>
      <div className="space-y-5 flex-1 flex flex-col justify-center">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between text-sm font-semibold text-slate-700">
              <span>{cat.name}</span>
              <span className="font-bold text-slate-900">{cat.count}</span>
            </div>
            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-700 rounded-full transition-all duration-1000 ease-out"
                style={{ width: animated ? `${cat.percentage}%` : '0%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryChart;
