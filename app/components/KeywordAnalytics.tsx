'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaSpinner, FaCopy, FaDownload, FaChartLine, FaChartBar, FaExclamationTriangle, FaLightbulb } from 'react-icons/fa';
import { fetchKeywordAnalytics, fetchKeywordCompetitiveAnalysis } from '../services/youtube';
import { YouTubeVideoItem } from '../types/youtube';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

interface KeywordAnalyticsProps {
  video: YouTubeVideoItem;
}

export default function KeywordAnalytics({ video }: KeywordAnalyticsProps) {
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [analyticsByKeyword, setAnalyticsByKeyword] = useState<any>({});
  const [competitiveData, setCompetitiveData] = useState<any>({});
  const [copySuccess, setCopySuccess] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  
  // Extract keywords from video tags and title
  useEffect(() => {
    if (video && video.snippet) {
      const tags = video.snippet.tags || [];
      const title = video.snippet.title || '';
      
      // Extract title words (filter out common words)
      const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like'];
      const titleWords = title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(' ')
        .filter(word => word.length > 3 && !commonWords.includes(word.toLowerCase()));
      
      // Combine tags and title words, remove duplicates
      const allKeywords = [...tags, ...titleWords];
      const uniqueKeywords = Array.from(new Set(allKeywords)); // Include all keywords
      
      setKeywords(uniqueKeywords);
    }
  }, [video]);
  
  // Function to analyze all keywords
  const analyzeKeywords = async () => {
    if (keywords.length === 0) return;
    
    setLoading(true);
    
    try {
      // Get basic analytics for all keywords
      const results = await Promise.all(
        keywords.map(async (keyword) => {
          const result = await fetchKeywordAnalytics(keyword);
          return { keyword, data: result };
        })
      );
      
      const analyticsMap = results.reduce((acc, { keyword, data }) => {
        acc[keyword] = data;
        return acc;
      }, {} as any);
      
      setAnalyticsByKeyword(analyticsMap);
      
      // If there's a selected keyword, fetch detailed competitive analysis
      if (selectedKeyword) {
        await fetchDetailedAnalytics(selectedKeyword);
      } else if (keywords.length > 0) {
        // Select the first keyword by default
        setSelectedKeyword(keywords[0]);
        await fetchDetailedAnalytics(keywords[0]);
      }
    } catch (error) {
      console.error('Error analyzing keywords:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch detailed analytics for a specific keyword
  const fetchDetailedAnalytics = async (keyword: string) => {
    try {
      const data = await fetchKeywordCompetitiveAnalysis(keyword);
      setCompetitiveData((prevData: Record<string, any>) => ({
        ...prevData,
        [keyword]: data
      }));
      
      setShowDetailedAnalysis(true);
    } catch (error) {
      console.error(`Error fetching detailed analytics for "${keyword}":`, error);
    }
  };
  
  // Function to copy all tags to clipboard
  const copyTagsToClipboard = () => {
    if (!video.snippet.tags) return;
    
    const tagsText = video.snippet.tags.join(', ');
    navigator.clipboard.writeText(tagsText).then(() => {
      setCopySuccess('Tags copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };
  
  // Function to download thumbnail
  const downloadThumbnail = () => {
    const thumbnailUrl = video.snippet.thumbnails.maxres?.url || 
                         video.snippet.thumbnails.high?.url || 
                         video.snippet.thumbnails.medium?.url;
    
    if (!thumbnailUrl) return;
    
    fetch(thumbnailUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        // Set filename
        const extension = thumbnailUrl.split('.').pop();
        a.download = `thumbnail-${video.id}.${extension}`;
        
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
  };
  
  // Score description based on value
  const getScoreDescription = (score: number, type: 'competition' | 'potential') => {
    if (type === 'competition') {
      if (score <= 3) return 'Low competition';
      if (score <= 7) return 'Moderate competition';
      return 'High competition';
    } else {
      if (score <= 3) return 'Low potential';
      if (score <= 7) return 'Moderate potential';
      return 'High potential';
    }
  };
  
  // Function to get recommendations based on competitive analysis
  const getRecommendations = (keyword: string) => {
    const data = competitiveData[keyword];
    if (!data) return [];
    
    const recommendations = [];
    
    // Competition-based recommendations
    if (data.competitionScore >= 8) {
      recommendations.push("High competition for this keyword. Consider using more specific long-tail variations.");
    } else if (data.competitionScore <= 3) {
      recommendations.push("Low competition for this keyword. Excellent opportunity to rank well.");
    }
    
    // Search volume recommendations
    if (data.searchVolume > 10000) {
      recommendations.push("High search volume indicates strong audience interest in this topic.");
    } else if (data.searchVolume < 1000) {
      recommendations.push("Low search volume. Consider using this as a secondary keyword.");
    }
    
    // Growth trend recommendations
    if (data.growthRate > 5) {
      recommendations.push("Positive growth trend shows increasing interest in this topic.");
    } else if (data.growthRate < 0) {
      recommendations.push("Negative growth trend suggests declining interest. Monitor performance closely.");
    }
    
    // If few recommendations, add a generic one
    if (recommendations.length < 2) {
      recommendations.push("Optimize your title and description with this keyword for better visibility.");
    }
    
    return recommendations;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Advanced Keyword Analytics</h2>
        
        <div className="flex gap-4">
          {video.snippet.tags && video.snippet.tags.length > 0 && (
            <button
              onClick={copyTagsToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Copy all tags"
            >
              <FaCopy /> Copy Tags
              {copySuccess && (
                <span className="text-xs bg-green-600 px-2 py-0.5 rounded ml-2">{copySuccess}</span>
              )}
            </button>
          )}
          
          <button
            onClick={downloadThumbnail}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            title="Download thumbnail"
          >
            <FaDownload /> Download Thumbnail
          </button>
        </div>
      </div>
      
      {keywords.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-700 dark:text-gray-300">
              {keywords.length} keywords extracted from video tags and title
            </p>
            
            <button
              onClick={analyzeKeywords}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              {loading ? 'Analyzing...' : 'Analyze Keywords'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 max-h-[500px] overflow-y-auto p-2">
            {keywords.map((keyword) => (
              <div
                key={keyword}
                onClick={() => {
                  setSelectedKeyword(keyword);
                  if (competitiveData[keyword]) {
                    setShowDetailedAnalysis(true);
                  } else if (analyticsByKeyword[keyword]) {
                    fetchDetailedAnalytics(keyword);
                  }
                }}
                className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md 
                  ${selectedKeyword === keyword ? 'ring-2 ring-purple-500 shadow-lg' : ''}`}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">{keyword}</h3>
                
                {analyticsByKeyword[keyword] ? (
                  <div className="text-sm">
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 text-xs flex justify-between">
                          <span>Videos:</span> 
                          <span className="font-medium">{analyticsByKeyword[keyword].analytics.videoCount}</span>
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-xs flex justify-between">
                          <span>Avg. Views:</span> 
                          <span className="font-medium">{analyticsByKeyword[keyword].analytics.averageViews.toLocaleString()}</span>
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-xs flex justify-between">
                          <span>Est. CPM:</span> 
                          <span className="font-medium">${analyticsByKeyword[keyword].analytics.estimatedCpm}</span>
                        </p>
                      </div>
                      <div>
                        <div className="mb-2">
                          <p className="text-gray-700 dark:text-gray-300 text-xs flex justify-between">
                            <span>Competition:</span>
                            <span className={`font-medium ${
                              analyticsByKeyword[keyword].analytics.competitionScore > 7 
                                ? 'text-red-700 dark:text-red-400' 
                                : analyticsByKeyword[keyword].analytics.competitionScore > 3
                                  ? 'text-yellow-700 dark:text-yellow-400'
                                  : 'text-green-700 dark:text-green-400'
                            }`}>
                              {analyticsByKeyword[keyword].analytics.competitionScore}/10
                            </span>
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                analyticsByKeyword[keyword].analytics.competitionScore > 7 
                                  ? 'bg-red-600' 
                                  : analyticsByKeyword[keyword].analytics.competitionScore > 3
                                    ? 'bg-yellow-500'
                                    : 'bg-green-600'
                              }`}
                              style={{ width: `${analyticsByKeyword[keyword].analytics.competitionScore * 10}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-700 dark:text-gray-300 text-xs flex justify-between">
                            <span>Potential:</span>
                            <span className={`font-medium ${
                              analyticsByKeyword[keyword].analytics.potentialScore > 7 
                                ? 'text-green-700 dark:text-green-400' 
                                : analyticsByKeyword[keyword].analytics.potentialScore > 3
                                  ? 'text-yellow-700 dark:text-yellow-400'
                                  : 'text-red-700 dark:text-red-400'
                            }`}>
                              {analyticsByKeyword[keyword].analytics.potentialScore}/10
                            </span>
                          </p>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                analyticsByKeyword[keyword].analytics.potentialScore > 7 
                                  ? 'bg-green-600' 
                                  : analyticsByKeyword[keyword].analytics.potentialScore > 3
                                    ? 'bg-yellow-500'
                                    : 'bg-red-600'
                              }`}
                              style={{ width: `${analyticsByKeyword[keyword].analytics.potentialScore * 10}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {loading ? 'Analyzing...' : 'Click "Analyze Keywords" to view analytics'}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          {showDetailedAnalysis && selectedKeyword && competitiveData[selectedKeyword] && (
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaChartLine className="text-purple-500" />
                In-depth Analysis: "{selectedKeyword}"
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 shadow-sm">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Search Metrics</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Monthly Search Volume</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {competitiveData[selectedKeyword].searchVolume.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Growth Rate</p>
                      <p className={`text-xl font-bold ${
                        competitiveData[selectedKeyword].growthRate > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {competitiveData[selectedKeyword].growthRate > 0 ? '+' : ''}
                        {competitiveData[selectedKeyword].growthRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Traffic Potential</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {competitiveData[selectedKeyword].trafficPotential.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 shadow-sm">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Competition Analysis</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Competition Level</p>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              competitiveData[selectedKeyword].competitionScore > 7 
                                ? 'bg-red-600' 
                                : competitiveData[selectedKeyword].competitionScore > 3
                                  ? 'bg-yellow-500'
                                  : 'bg-green-600'
                            }`}
                            style={{ width: `${competitiveData[selectedKeyword].competitionScore * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {competitiveData[selectedKeyword].competitionScore}/10
                        </span>
                      </div>
                      <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                        {getScoreDescription(competitiveData[selectedKeyword].competitionScore, 'competition')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Difficulty Score</p>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              competitiveData[selectedKeyword].difficultyScore > 7 
                                ? 'bg-red-600' 
                                : competitiveData[selectedKeyword].difficultyScore > 3
                                  ? 'bg-yellow-500'
                                  : 'bg-green-600'
                            }`}
                            style={{ width: `${competitiveData[selectedKeyword].difficultyScore * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {competitiveData[selectedKeyword].difficultyScore}/10
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Estimated CPC</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        ${competitiveData[selectedKeyword].cpc}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 shadow-sm">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Performance Indicators</h4>
                  <div className="h-56">
                    <Doughnut 
                      data={{
                        labels: ['Competition', 'Opportunity'],
                        datasets: [
                          {
                            data: [
                              competitiveData[selectedKeyword].competitionScore,
                              10 - competitiveData[selectedKeyword].competitionScore
                            ],
                            backgroundColor: [
                              'rgba(220, 53, 69, 0.7)',
                              'rgba(32, 201, 151, 0.7)'
                            ],
                            borderColor: [
                              'rgba(220, 53, 69, 1)',
                              'rgba(32, 201, 151, 1)'
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const value = context.raw as number;
                                const label = context.label || '';
                                return `${label}: ${value}/10`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 shadow-sm">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <FaChartBar className="text-blue-500" />
                    Monthly Search Trends
                  </h4>
                  <div className="h-64">
                    <Line 
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        datasets: [
                          {
                            label: 'Search Volume',
                            data: competitiveData[selectedKeyword].monthlyTrends,
                            borderColor: 'rgba(99, 102, 241, 1)',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            fill: true,
                            tension: 0.3,
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: false,
                            ticks: {
                              callback: function(value) {
                                if (typeof value === 'number') {
                                  if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                  } else if (value >= 1000) {
                                    return (value / 1000).toFixed(1) + 'K';
                                  }
                                  return value;
                                }
                              }
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
                                let value = context.raw as number;
                                if (value >= 1000000) {
                                  return 'Search Volume: ' + (value / 1000000).toFixed(1) + 'M';
                                } else if (value >= 1000) {
                                  return 'Search Volume: ' + (value / 1000).toFixed(1) + 'K';
                                }
                                return 'Search Volume: ' + value;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 shadow-sm">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <FaSearch className="text-green-500" />
                    Related Keywords
                  </h4>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: competitiveData[selectedKeyword].relatedKeywords.map((k: any) => k.keyword),
                        datasets: [
                          {
                            label: 'Search Volume',
                            data: competitiveData[selectedKeyword].relatedKeywords.map((k: any) => k.volume),
                            backgroundColor: 'rgba(16, 185, 129, 0.7)',
                            borderColor: 'rgba(16, 185, 129, 1)',
                            borderWidth: 1,
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        scales: {
                          x: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                if (typeof value === 'number') {
                                  if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                  } else if (value >= 1000) {
                                    return (value / 1000).toFixed(1) + 'K';
                                  }
                                  return value;
                                }
                              }
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
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg p-5 mb-6">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <FaExclamationTriangle className="text-yellow-500" />
                  Competitive Insights
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  This keyword has {competitiveData[selectedKeyword].competitionScore > 7 ? 'high' : competitiveData[selectedKeyword].competitionScore > 3 ? 'moderate' : 'low'} competition with {competitiveData[selectedKeyword].searchVolume.toLocaleString()} monthly searches.
                  {competitiveData[selectedKeyword].growthRate > 0 
                    ? ` Search volume is growing by ${competitiveData[selectedKeyword].growthRate}% showing increasing interest.` 
                    : ` Search volume is declining by ${Math.abs(competitiveData[selectedKeyword].growthRate)}% showing decreasing interest.`
                  }
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-5">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <FaLightbulb className="text-blue-500" />
                  Recommendations
                </h4>
                <ul className="space-y-2 pl-6 list-disc text-gray-700 dark:text-gray-300">
                  {getRecommendations(selectedKeyword).map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 p-6">
          No keywords/tags available for this video
        </p>
      )}
    </div>
  );
} 