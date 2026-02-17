'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

import { ChartData } from 'chart.js';

interface TeamDoughnutChartProps {
   data: ChartData<'doughnut'>;
}

const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#94a3b8'
        }
      },
    },
    cutout: '70%',
};

const TeamDoughnutChart: React.FC<TeamDoughnutChartProps> = ({ data }) => {
  return <Doughnut data={data} options={options} />;
};

export default TeamDoughnutChart;
