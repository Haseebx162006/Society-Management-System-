'use client';

import React from 'react';
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

interface GrowthLineChartProps {
   data: {
    labels: string[];
    datasets: any[];
  };
}

const options = {
  responsive: true,
  plugins: {
    legend: {
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
  },
  elements: {
    line: {
        tension: 0.4
    }
  }
};

const GrowthLineChart: React.FC<GrowthLineChartProps> = ({ data }) => {
  return <Line options={options} data={data} />;
};

export default GrowthLineChart;
