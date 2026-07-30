'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { LineChart as AddChartIcon } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface GrowthChartProps {
  data?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      [key: string]: any;
    }[];
  } | null;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  const chartRef = useRef<any>(null);
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  const defaultLabels = ['JAN', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV', 'DEC'];
  const defaultDataPoints = [5, 8, 12, 18, 22, 28, 35];

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const ctx = chart.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(163, 57, 0, 0.2)');
    gradient.addColorStop(1, 'rgba(163, 57, 0, 0)');

    const finalLabels = data?.labels && data.labels.length > 0 ? data.labels : defaultLabels;
    const finalDataPoints = data?.datasets?.[0]?.data && data.datasets[0].data.length > 0
      ? data.datasets[0].data
      : defaultDataPoints;

    setChartData({
      labels: finalLabels,
      datasets: [
        {
          label: 'Members Registered',
          data: finalDataPoints,
          borderColor: '#a33900',
          borderWidth: 3,
          pointBackgroundColor: '#a33900',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          backgroundColor: gradient,
          tension: 0.4,
        },
      ],
    });
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        borderRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: 'Manrope, sans-serif',
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: 'Manrope, sans-serif',
            size: 11,
            weight: 600 as any,
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Member Growth</h3>
          <p className="text-xs text-slate-400">Chronological registration and membership trends</p>
        </div>
        <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl font-bold text-xs">
          <AddChartIcon className="w-4 h-4" />
          Active Growth
        </div>
      </div>
      <div className="relative flex-1 min-h-[220px]">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default GrowthChart;
