'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MemberBarChartProps {
  data: {
    labels: string[];
    datasets: any[];
  };
}

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: '#94a3b8'
      }
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      ticks: { color: '#94a3b8' },
      grid: { color: '#334155' }
    },
    x: {
      ticks: { color: '#94a3b8' },
      grid: { display: false }
    }
  }
};

const MemberBarChart: React.FC<MemberBarChartProps> = ({ data }) => {
  return <Bar options={options} data={data} />;
};

export default MemberBarChart;
