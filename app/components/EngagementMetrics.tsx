'use client';

import { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { FaRegClock, FaPercentage, FaEye, FaThumbsUp, FaComments, FaFireAlt } from 'react-icons/fa';

interface EngagementMetricsProps {
  averageViewDuration: number;
  avgRetentionRate: number;
  avgEngagementScore: number;
  likeViewRatio: string;
  commentCount?: number;
  viewCount?: number;
  likeCount?: number;
}

const EngagementMetrics = ({
  averageViewDuration,
  avgRetentionRate,
  avgEngagementScore,
  likeViewRatio,
  commentCount = 0,
  viewCount = 0,
  likeCount = 0
}: EngagementMetricsProps) => {
  const [activeMetric, setActiveMetric] = useState<'views' | 'engagement' | 'comments'>('engagement');

  // Calculate time watched in different formats
  const timeWatchedHours = (averageViewDuration * viewCount / 3600).toFixed(0);
  const timeWatchedDays = (averageViewDuration * viewCount / 86400).toFixed(1);

  // Engagement distribution chart
  const engagementDistribution = {
    labels: ['High Engagement', 'Medium Engagement', 'Low Engagement'],
    datasets: [
      {
        data: [
          avgRetentionRate > 70 ? 35 : avgRetentionRate > 50 ? 25 : 15, 
          avgRetentionRate > 60 ? 45 : avgRetentionRate > 40 ? 35 : 25,
          100 - (avgRetentionRate > 70 ? 35 : avgRetentionRate > 50 ? 25 : 15) - (avgRetentionRate > 60 ? 45 : avgRetentionRate > 40 ? 35 : 25)
        ],
        backgroundColor: [
          'rgba(46, 204, 113, 0.8)',
          'rgba(52, 152, 219, 0.8)',
          'rgba(231, 76, 60, 0.8)'
        ],
        borderColor: [
          'rgba(46, 204, 113, 1)',
          'rgba(52, 152, 219, 1)',
          'rgba(231, 76, 60, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Engagement score comparison
  const engagementScoreData = {
    labels: ['Your Score', 'Platform Average'],
    datasets: [
      {
        label: 'Engagement Score (1-10)',
        data: [avgEngagementScore, 5.2],
        backgroundColor: [
          'rgba(65, 105, 225, 0.7)',
          'rgba(150, 150, 150, 0.7)'
        ],
        borderColor: [
          'rgba(65, 105, 225, 1)',
          'rgba(150, 150, 150, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Audience interaction metrics
  const interactionData = {
    labels: ['Likes', 'Comments', 'Shares (est.)', 'Saves (est.)'],
    datasets: [
      {
        label: 'Percentage of Viewers',
        data: [
          (likeCount / viewCount * 100).toFixed(2),
          (commentCount / viewCount * 100).toFixed(2),
          ((likeCount * 0.3) / viewCount * 100).toFixed(2),
          ((likeCount * 0.2) / viewCount * 100).toFixed(2)
        ],
        backgroundColor: [
          'rgba(65, 105, 225, 0.7)',
          'rgba(46, 204, 113, 0.7)',
          'rgba(230, 126, 34, 0.7)',
          'rgba(142, 68, 173, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="w-full space-y-5">
      <h3 className="text-xl font-semibold text-white mb-4">Engagement Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <FaRegClock className="text-blue-400 w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Avg. View Duration</div>
              <div className="text-2xl font-semibold text-white">
                {Math.floor(averageViewDuration / 60)}:{(averageViewDuration % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-500 mb-1">Total Time Watched</div>
            <div className="text-lg text-gray-300">{timeWatchedHours} hours <span className="text-xs text-gray-500">({timeWatchedDays} days)</span></div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <FaPercentage className="text-green-400 w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Avg. Retention Rate</div>
              <div className="text-2xl font-semibold text-white">{avgRetentionRate}%</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-500 mb-1">Like-View Ratio</div>
            <div className="text-lg text-gray-300">{likeViewRatio}%</div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <FaFireAlt className="text-purple-400 w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Engagement Score</div>
              <div className="text-2xl font-semibold text-white">{avgEngagementScore}/10</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-500 mb-1">Performance Rating</div>
            <div className="text-lg text-gray-300">
              {avgEngagementScore >= 8 ? 'Excellent' : 
               avgEngagementScore >= 6 ? 'Good' : 
               avgEngagementScore >= 4 ? 'Average' : 'Needs Improvement'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h4 className="text-lg font-medium text-white mb-4">Audience Engagement Distribution</h4>
          <div className="h-64">
            <Doughnut 
              data={engagementDistribution} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: 'rgba(255, 255, 255, 0.7)',
                      font: { size: 12 }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h4 className="text-lg font-medium text-white mb-4">Engagement Metrics</h4>
          
          <div className="flex mb-4 border-b border-gray-700">
            <button
              onClick={() => setActiveMetric('engagement')}
              className={`pb-2 px-3 text-sm font-medium ${
                activeMetric === 'engagement' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Engagement Score
            </button>
            
            <button
              onClick={() => setActiveMetric('views')}
              className={`pb-2 px-3 text-sm font-medium ${
                activeMetric === 'views' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              View Analytics
            </button>
            
            <button
              onClick={() => setActiveMetric('comments')}
              className={`pb-2 px-3 text-sm font-medium ${
                activeMetric === 'comments' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Interaction
            </button>
          </div>
          
          <div className="h-52">
            {activeMetric === 'engagement' && (
              <Bar 
                data={engagementScoreData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 10,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            )}
            
            {activeMetric === 'views' && (
              <div className="flex flex-col h-full justify-center text-center">
                <div className="text-4xl font-bold text-blue-400">{viewCount.toLocaleString()}</div>
                <div className="text-gray-400 mt-2">Total Views</div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <div className="text-lg font-semibold text-white">{(viewCount / (Date.now() / 1000 - 1680483600) * 86400).toFixed(0)}</div>
                    <div className="text-xs text-gray-400">Daily Views</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {((likeCount / viewCount) * 100).toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-400">Like Ratio</div>
                  </div>
                </div>
              </div>
            )}
            
            {activeMetric === 'comments' && (
              <Bar 
                data={interactionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: function(value) {
                          return value + '%';
                        }
                      }
                    },
                    y: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return context.raw + '% of viewers';
                        }
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementMetrics; 