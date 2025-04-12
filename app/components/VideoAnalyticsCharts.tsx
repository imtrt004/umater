'use client';

import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  TooltipItem,
  ChartTypeRegistry
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { YouTubeVideoItem } from '../types/youtube';

// Register required Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

interface VideoAnalyticsChartsProps {
  video: YouTubeVideoItem;
  popularVideos: YouTubeVideoItem[];
}

export default function VideoAnalyticsCharts({ video, popularVideos }: VideoAnalyticsChartsProps) {
  // Only proceed if we have statistics
  if (!video.statistics) {
    return <div className="text-center p-6">No statistics available for analysis</div>;
  }

  const engagementData = {
    labels: ['Views', 'Likes', 'Comments'],
    datasets: [
      {
        label: 'Engagement Metrics',
        data: [
          parseInt(video.statistics.viewCount || '0'),
          parseInt(video.statistics.likeCount || '0'),
          parseInt(video.statistics.commentCount || '0')
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Calculate engagement ratio (likes + comments) / views
  const views = parseInt(video.statistics.viewCount || '0');
  const likes = parseInt(video.statistics.likeCount || '0');
  const comments = parseInt(video.statistics.commentCount || '0');
  
  const engagementRatio = views > 0 ? ((likes + comments) / views) * 100 : 0;
  
  const engagementRatioData = {
    labels: ['Engagement', 'Non-Engagement'],
    datasets: [
      {
        data: [engagementRatio, 100 - engagementRatio],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(201, 203, 207, 0.7)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(201, 203, 207, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Compare with popular videos
  let comparisonData = null;
  
  if (popularVideos && popularVideos.length > 0) {
    // Filter videos with statistics
    const videosWithStats = popularVideos.filter(v => v.statistics && v.id !== video.id).slice(0, 5);
    
    if (videosWithStats.length > 0) {
      // Add current video to the comparison
      videosWithStats.unshift(video);
      
      comparisonData = {
        labels: videosWithStats.map(v => v.snippet.title.substring(0, 20) + '...'),
        datasets: [
          {
            label: 'Views',
            data: videosWithStats.map(v => parseInt(v.statistics?.viewCount || '0')),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            label: 'Likes',
            data: videosWithStats.map(v => parseInt(v.statistics?.likeCount || '0')),
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-4xl">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Video Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Engagement Overview</h3>
          <div className="h-64">
            <Bar 
              data={engagementData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        const val = value as number;
                        if (val >= 1000000) {
                          return (val / 1000000).toFixed(1) + 'M';
                        } else if (val >= 1000) {
                          return (val / 1000).toFixed(1) + 'K';
                        }
                        return val;
                      }
                    }
                  }
                },
              }}
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Engagement Ratio</h3>
          <div className="h-64 flex justify-center items-center">
            <div className="w-48 h-48">
              <Doughnut 
                data={engagementRatioData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const value = context.raw as number;
                          return `${context.label}: ${value.toFixed(2)}%`;
                        }
                      }
                    },
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          </div>
          <div className="text-center text-gray-700 dark:text-gray-300 mt-2">
            <p>Engagement rate: {engagementRatio.toFixed(2)}%</p>
            <p className="text-xs mt-1">(Likes + Comments) / Views</p>
          </div>
        </div>
      </div>
      
      {comparisonData && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Comparison with Popular Videos</h3>
          <div className="h-80">
            <Bar 
              data={comparisonData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        const val = value as number;
                        if (val >= 1000000) {
                          return (val / 1000000).toFixed(1) + 'M';
                        } else if (val >= 1000) {
                          return (val / 1000).toFixed(1) + 'K';
                        }
                        return val;
                      }
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top',
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 