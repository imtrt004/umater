'use client';

import { useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { FaComments, FaSmile, FaMeh, FaFrown, FaHashtag } from 'react-icons/fa';

interface CommentSentimentProps {
  commentAnalysis: {
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
    timestamps: {
      time: number;
      comment: string;
      likeCount: number;
    }[];
    topTopics?: string[];
  };
  onTimelineClick: (seconds: number) => void;
}

const CommentSentimentAnalysis = ({ commentAnalysis, onTimelineClick }: CommentSentimentProps) => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Prepare sentiment data for pie chart
  const sentimentData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          commentAnalysis.sentiment.positive,
          commentAnalysis.sentiment.neutral,
          commentAnalysis.sentiment.negative
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

  // Prepare timestamp distribution data
  const groupTimeStamps = () => {
    const distribution: Record<string, number> = {};
    const commentsByTime: Record<string, any[]> = {};
    
    commentAnalysis.timestamps.forEach(timestamp => {
      // Group by minute
      const minute = Math.floor(timestamp.time / 60);
      const timeKey = `${minute}:00`;
      
      if (!distribution[timeKey]) {
        distribution[timeKey] = 0;
        commentsByTime[timeKey] = [];
      }
      
      distribution[timeKey]++;
      commentsByTime[timeKey].push(timestamp);
    });
    
    return { distribution, commentsByTime };
  };
  
  const { distribution, commentsByTime } = groupTimeStamps();
  
  const timestampDistribution = {
    labels: Object.keys(distribution),
    datasets: [
      {
        label: 'Comments',
        data: Object.values(distribution),
        backgroundColor: 'rgba(65, 105, 225, 0.7)',
        borderColor: 'rgba(65, 105, 225, 1)',
        borderWidth: 1
      }
    ]
  };

  const filterTopicComments = () => {
    if (!selectedTopic) return commentAnalysis.timestamps;
    
    return commentAnalysis.timestamps.filter(
      timestamp => timestamp.comment.toLowerCase().includes(selectedTopic.toLowerCase())
    );
  };

  const filteredComments = filterTopicComments();

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Comment Sentiment Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-gray-800 rounded-xl p-6 shadow-lg">
          <h4 className="text-lg font-medium text-white mb-4">Sentiment Distribution</h4>
          <div className="h-64">
            <Pie 
              data={sentimentData} 
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
          
          <div className="grid grid-cols-3 gap-2 mt-6">
            <div className="flex flex-col items-center p-2 bg-gray-700 rounded-lg">
              <FaSmile className="text-green-400 mb-1" />
              <div className="text-sm font-medium text-white">{commentAnalysis.sentiment.positive}</div>
              <div className="text-xs text-gray-400">Positive</div>
            </div>
            <div className="flex flex-col items-center p-2 bg-gray-700 rounded-lg">
              <FaMeh className="text-blue-400 mb-1" />
              <div className="text-sm font-medium text-white">{commentAnalysis.sentiment.neutral}</div>
              <div className="text-xs text-gray-400">Neutral</div>
            </div>
            <div className="flex flex-col items-center p-2 bg-gray-700 rounded-lg">
              <FaFrown className="text-red-400 mb-1" />
              <div className="text-sm font-medium text-white">{commentAnalysis.sentiment.negative}</div>
              <div className="text-xs text-gray-400">Negative</div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2 bg-gray-800 rounded-xl p-6 shadow-lg">
          <h4 className="text-lg font-medium text-white mb-4">Comment Timeline Distribution</h4>
          <div className="h-64">
            <Bar 
              data={timestampDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
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
                  },
                  tooltip: {
                    callbacks: {
                      afterLabel: function(context) {
                        const timeKey = context.label;
                        if (commentsByTime[timeKey] && commentsByTime[timeKey].length > 0) {
                          return [
                            '',
                            '📝 Top comment:',
                            commentsByTime[timeKey][0].comment.substring(0, 50) + '...'
                          ];
                        }
                        return '';
                      }
                    }
                  }
                },
                onClick: (event, elements) => {
                  if (elements.length > 0) {
                    const index = elements[0].index;
                    const timeKey = Object.keys(distribution)[index];
                    const minutes = parseInt(timeKey.split(':')[0]);
                    onTimelineClick(minutes * 60);
                  }
                }
              }}
            />
          </div>
          
          <div className="mt-4 text-xs text-gray-400 flex items-center">
            <FaComments className="mr-1" /> 
            Click on any bar to seek the video to that timestamp
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-white">Key Topics & Timestamps</h4>
          
          {commentAnalysis.topTopics && commentAnalysis.topTopics.length > 0 && (
            <div className="flex items-center">
              <FaHashtag className="text-gray-400 mr-2" />
              <div className="flex flex-wrap gap-2">
                {commentAnalysis.topTopics.slice(0, 6).map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                    className={`px-2 py-1 text-xs rounded-full ${
                      selectedTopic === topic
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
                {selectedTopic && (
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {filteredComments.length > 0 ? (
            filteredComments.map((timestamp, index) => (
              <div 
                key={index}
                className="p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors cursor-pointer"
                onClick={() => onTimelineClick(timestamp.time)}
              >
                <div className="flex justify-between items-start">
                  <div className="text-blue-400 font-medium">
                    {Math.floor(timestamp.time / 60)}:{(timestamp.time % 60).toString().padStart(2, '0')}
                  </div>
                  {timestamp.likeCount > 0 && (
                    <div className="text-xs text-gray-400 flex items-center">
                      <FaSmile className="mr-1" /> {timestamp.likeCount} likes
                    </div>
                  )}
                </div>
                <p className="text-gray-300 text-sm mt-1">
                  {timestamp.comment.length > 120 
                    ? timestamp.comment.substring(0, 120) + '...' 
                    : timestamp.comment}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-400">
              No comments found {selectedTopic ? `with topic "${selectedTopic}"` : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSentimentAnalysis; 