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

import { ChartData } from 'chart.js';

interface RevenueAreaChartProps {
   data: ChartData<'line'>;
}

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: false,
    },
  },
  scales: {
      y: {
          display: false,
      },
      x: {
          display: false,
      }
  },
    elements: {
        line: {
            tension: 0.4
        },
        point: {
            radius: 0
        }
    }

};

const RevenueAreaChart: React.FC<RevenueAreaChartProps> = ({ data }) => {
  return <Line options={options} data={data} />;
};

export default RevenueAreaChart;
