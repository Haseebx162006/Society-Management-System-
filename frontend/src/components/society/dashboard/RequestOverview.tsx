'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const RequestOverview: React.FC = () => {
  const data = {
    labels: ['Registration', 'Annual Renewals'],
    datasets: [
      {
        data: [12, 8],
        backgroundColor: ['#a33900', '#bcc7de'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 10,
        borderRadius: 8,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center h-full">
      <h3 className="text-lg font-bold text-slate-800 self-start">Request Overview</h3>
      <p className="text-xs text-slate-400 self-start mb-6">Operational backlog status</p>
      
      <div className="relative w-44 h-44 mb-6 flex-shrink-0">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-slate-800 leading-none">20</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Pending</span>
        </div>
      </div>

      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-800"></div>
            <span className="text-sm font-semibold text-slate-600">Registration</span>
          </div>
          <span className="text-sm font-extrabold text-slate-800">12</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
            <span className="text-sm font-semibold text-slate-600">Annual Renewals</span>
          </div>
          <span className="text-sm font-extrabold text-slate-800">8</span>
        </div>
      </div>
    </div>
  );
};

export default RequestOverview;
