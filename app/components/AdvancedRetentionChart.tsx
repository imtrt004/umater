'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { FaInfoCircle } from 'react-icons/fa';

interface AdvancedRetentionChartProps {
  retentionCurve: number[];
  labels: string[];
  dropOffPoints: { timestamp: number; drop: number }[];
  benchmarkData?: number[];
  videoId: string;
  onTimelineClick: (seconds: number) => void;
}

const AdvancedRetentionChart = ({
  retentionCurve,
  labels,
  dropOffPoints,
  benchmarkData,
  videoId,
  onTimelineClick
}: AdvancedRetentionChartProps) => {
  const [industryAverage, setIndustryAverage] = useState<number[]>([]);
  const [annotationMode, setAnnotationMode] = useState<'all' | 'major' | 'none'>('major');
  
  useEffect(() => {
    // Generate industry average based on typical retention curves
    // This would ideally come from your backend analytics service
    const avgRetention = [];
    for (let i = 0; i < labels.length; i++) {
      const percentComplete = i / (labels.length - 1);
      // Industry standard retention curve - starts at 100%, drops to ~30-40% by end
      const value = 100 * Math.exp(-1.1 * percentComplete);
      avgRetention.push(value);
    }
    setIndustryAverage(avgRetention);
  }, [labels]);

  // Configuration for retention chart
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Your Video',
        data: retentionCurve,
        borderColor: 'rgba(65, 105, 225, 1)',
        backgroundColor: 'rgba(65, 105, 225, 0.2)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: (ctx: { dataIndex: any; }) => {
          // Make drop-off points bigger
          const index = ctx.dataIndex;
          const isDropOff = dropOffPoints.some(
            p => Math.abs(p.timestamp - index * (labels.length > 1 ? (600 / (labels.length - 1)) : 30)) < 5
          );
          return isDropOff && (annotationMode === 'all' || annotationMode === 'major') ? 6 : 3;
        },
        pointBackgroundColor: (ctx: { dataIndex: any; }) => {
          const index = ctx.dataIndex;
          const isDropOff = dropOffPoints.some(
            p => Math.abs(p.timestamp - index * (labels.length > 1 ? (600 / (labels.length - 1)) : 30)) < 5
          );
          return isDropOff ? 'rgba(255, 0, 0, 0.8)' : 'rgba(65, 105, 225, 1)';
        },
        pointBorderColor: (ctx: { dataIndex: any; }) => {
          const index = ctx.dataIndex;
          const isDropOff = dropOffPoints.some(
            p => Math.abs(p.timestamp - index * (labels.length > 1 ? (600 / (labels.length - 1)) : 30)) < 5
          );
          return isDropOff ? 'rgba(255, 0, 0, 1)' : 'rgba(65, 105, 225, 1)';
        }
      },
      {
        label: 'Industry Average',
        data: industryAverage,
        borderColor: 'rgba(150, 150, 150, 0.7)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      },
      ...(benchmarkData ? [{
        label: 'Top Performers',
        data: benchmarkData,
        borderColor: 'rgba(46, 204, 113, 0.7)',
        backgroundColor: 'transparent',
        borderDash: [3, 3],
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      }] : [])
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const datasetLabel = context.dataset.label || '';
            const value = context.raw.toFixed(1);
            return `${datasetLabel}: ${value}% watching`;
          },
          afterLabel: function(context: any) {
            const index = context.dataIndex;
            const isDropOff = dropOffPoints.some(
              p => Math.abs(p.timestamp - index * (labels.length > 1 ? (600 / (labels.length - 1)) : 30)) < 5
            );
            if (isDropOff && context.dataset.label === 'Your Video') {
              const dropOff = dropOffPoints.find(
                p => Math.abs(p.timestamp - index * (labels.length > 1 ? (600 / (labels.length - 1)) : 30)) < 5
              );
              return `Drop-off: ${dropOff?.drop.toFixed(1)}% (Click to view)`;
            }
            return '';
          }
        }
      },
      legend: {
        display: true,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return `${value}%`;
          }
        },
        title: {
          display: true,
          text: 'Audience Retention'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Video Timeline'
        }
      }
    },
    onClick: (event: any, elements: any) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const timeInSeconds = index * (labels.length > 1 ? (600 / (labels.length - 1)) : 30);
        onTimelineClick(timeInSeconds);
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Audience Retention Analysis</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm">
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
            <span className="text-gray-300">Drop-off Points</span>
          </div>
          <select 
            className="bg-gray-700 text-gray-300 text-sm px-2 py-1 rounded border border-gray-600"
            value={annotationMode}
            onChange={(e) => setAnnotationMode(e.target.value as 'all' | 'major' | 'none')}
          >
            <option value="major">Show Major Drop-offs</option>
            <option value="all">Show All Annotations</option>
            <option value="none">Hide Annotations</option>
          </select>
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="text-xs text-gray-400 mb-2 flex items-center">
          <FaInfoCircle className="mr-1" /> 
          Click on any point in the graph to seek the video to that timestamp
        </div>
        <div className="h-80">
          <Line data={chartData} options={chartOptions as any} />
        </div>
      </div>
      
      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
        <h4 className="text-md font-medium text-white mb-2">Performance Insights</h4>
        <p className="text-gray-300 text-sm">
          {retentionCurve[Math.floor(retentionCurve.length * 0.5)] > industryAverage[Math.floor(industryAverage.length * 0.5)] ?
            `Your video is outperforming industry averages by ${(retentionCurve[Math.floor(retentionCurve.length * 0.5)] - industryAverage[Math.floor(industryAverage.length * 0.5)]).toFixed(1)}% at the midpoint.` :
            `Your video is underperforming industry averages by ${(industryAverage[Math.floor(industryAverage.length * 0.5)] - retentionCurve[Math.floor(retentionCurve.length * 0.5)]).toFixed(1)}% at the midpoint.`
          }
          {dropOffPoints.length > 0 && ` There are ${dropOffPoints.length} significant drop-off points that should be addressed for improved retention.`}
        </p>
      </div>
    </div>
  );
};

export default AdvancedRetentionChart; 