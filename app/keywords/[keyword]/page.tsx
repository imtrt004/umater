'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchKeywordCompetitiveAnalysis, analyzeKeywordMetrics, suggestionsToKeywordMetrics, fetchYouTubeSearchSuggestions } from '../../services/youtube';
import { KeywordMetrics } from '../../types/keywords';
import { FaChartBar, FaSpinner, FaChartLine, FaChartPie, FaArrowLeft, FaLightbulb, FaYoutube, FaSearch, FaArrowRight } from 'react-icons/fa';

export default function KeywordDetailPage() {
  const router = useRouter();
  const params = useParams();
  const keyword = typeof params.keyword === 'string' ? decodeURIComponent(params.keyword) : '';
  
  const [isLoading, setIsLoading] = useState(true);
  const [keywordData, setKeywordData] = useState<any>(null);
  const [metrics, setMetrics] = useState<KeywordMetrics | null>(null);
  const [relatedKeywords, setRelatedKeywords] = useState<KeywordMetrics[]>([]);
  const [relatedSuggestions, setRelatedSuggestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'related' | 'suggestions'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      if (!keyword) return;
      
      setIsLoading(true);
      try {
        // Fetch detailed competitive analysis
        const competitiveData = await fetchKeywordCompetitiveAnalysis(keyword);
        setKeywordData(competitiveData);
        
        // Get basic metrics
        const metricsData = await analyzeKeywordMetrics([keyword]);
        if (metricsData.length > 0) {
          setMetrics(metricsData[0]);
        }
        
        // Get related keywords and their metrics
        const relatedKeywordsList = competitiveData.relatedKeywords.map((k: any) => k.keyword);
        const relatedMetrics = await analyzeKeywordMetrics(relatedKeywordsList);
        setRelatedKeywords(relatedMetrics);
        
        // Get search suggestions
        const suggestions = await fetchYouTubeSearchSuggestions(keyword);
        setRelatedSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching keyword data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [keyword]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex flex-col items-center justify-center py-20">
          <FaSpinner className="animate-spin h-12 w-12 mb-6 text-blue-500" />
          <p className="text-xl">Analyzing keyword: <span className="font-semibold">{keyword}</span></p>
          <p className="text-gray-500 mt-2">This may take a few moments...</p>
        </div>
      </div>
    );
  }

  if (!keywordData || !metrics) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex flex-col items-center justify-center py-20">
          <FaExclamationTriangle className="h-12 w-12 mb-6 text-yellow-500" />
          <p className="text-xl">Could not load data for keyword: <span className="font-semibold">{keyword}</span></p>
          <button
            onClick={() => router.push('/keywords')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FaArrowLeft className="inline mr-2" /> Back to Keywords
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/keywords')}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold">Keyword Analysis</h1>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mb-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <div className="text-sm opacity-80 mb-1">KEYWORD</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{keyword}</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                {metrics.category}
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                {metrics.intent}
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                {metrics.wordCount || keyword.split(' ').length} words
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center">
            <a 
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center mr-3"
            >
              <FaYoutube className="mr-2" /> Search on YouTube
            </a>
            <a 
              href={`/transcribe?search=${encodeURIComponent(keyword)}`}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center mr-3"
            >
              <FaYoutube className="mr-2" /> Transcribe Videos
            </a>
            <a 
              href={`https://www.google.com/search?q=${encodeURIComponent(keyword)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-gray-800 px-4 py-2 rounded-md flex items-center"
            >
              <FaSearch className="mr-2" /> Search on Google
            </a>
          </div>
        </div>
      </div>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex flex-col">
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Search Volume</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{keywordData.searchVolume?.toLocaleString()}</div>
            <FaChartBar className="h-10 w-10 text-blue-500 opacity-80" />
          </div>
          <div className="mt-2 text-sm">
            <span className={`${keywordData.growthRate > 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
              {keywordData.growthRate > 0 ? '+' : ''}{keywordData.growthRate}%
            </span> growth rate
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex flex-col">
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Competition</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-2xl font-bold">{(keywordData.competition * 100).toFixed(0)}%</div>
              <div className={`ml-2 px-2 py-0.5 text-xs rounded-full 
                ${keywordData.competition < 0.3 
                  ? 'bg-green-100 text-green-800' 
                  : keywordData.competition < 0.7 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'}`}
              >
                {keywordData.competition < 0.3 
                  ? 'Low' 
                  : keywordData.competition < 0.7 
                    ? 'Medium' 
                    : 'High'}
              </div>
            </div>
            <FaChartLine className="h-10 w-10 text-purple-500 opacity-80" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className="bg-purple-600 h-2 rounded-full" 
              style={{ width: `${Math.min(keywordData.competition * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex flex-col">
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">CPC</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">${keywordData.cpc || metrics.cpc.toFixed(2)}</div>
            <FaChartPie className="h-10 w-10 text-green-500 opacity-80" />
          </div>
          <div className="mt-2 text-sm">
            Estimated cost per click
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex flex-col">
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Difficulty Score</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-2xl font-bold">{keywordData.difficultyScore || metrics.difficulty}</div>
              <div className={`ml-2 px-2 py-0.5 text-xs rounded-full 
                ${(keywordData.difficultyScore || metrics.difficulty) < 3 
                  ? 'bg-green-100 text-green-800' 
                  : (keywordData.difficultyScore || metrics.difficulty) < 7 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'}`}
              >
                {(keywordData.difficultyScore || metrics.difficulty) < 3 
                  ? 'Easy' 
                  : (keywordData.difficultyScore || metrics.difficulty) < 7 
                    ? 'Medium' 
                    : 'Hard'}
              </div>
            </div>
            <FaLightbulb className="h-10 w-10 text-yellow-500 opacity-80" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className={`h-2 rounded-full ${
                (keywordData.difficultyScore || metrics.difficulty) < 3 
                  ? 'bg-green-600' 
                  : (keywordData.difficultyScore || metrics.difficulty) < 7 
                    ? 'bg-yellow-600' 
                    : 'bg-red-600'
              }`} 
              style={{ width: `${Math.min(((keywordData.difficultyScore || metrics.difficulty) / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('related')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'related'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Related Keywords ({relatedKeywords.length})
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'suggestions'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Search Suggestions ({relatedSuggestions.length})
            </button>
          </nav>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Monthly Trends Chart */}
            <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
              <h3 className="text-lg font-medium mb-6 text-white">Monthly Search Volume Trends</h3>
              <div className="h-72 w-full relative">
                {keywordData.monthlyTrends && keywordData.monthlyTrends.length > 0 ? (
                  <>
                    {/* Line connecting data points */}
                    <svg className="absolute inset-0 w-full h-full z-10 overflow-visible" 
                         preserveAspectRatio="none" 
                         viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#818cf8" />
                          <stop offset="100%" stopColor="#c084fc" />
                        </linearGradient>
                      </defs>
                      
                      {/* Main trend line */}
                      {keywordData.monthlyTrends && keywordData.monthlyTrends.length > 1 && (
                        <path
                          d={`M ${keywordData.monthlyTrends.map((volume: number, index: number) => {
                            const maxVolume = Math.max(...keywordData.monthlyTrends);
                            const height = maxVolume > 0 ? 100 - Math.max((volume / maxVolume) * 85, 5) : 95;
                            const width = index * (100 / (keywordData.monthlyTrends.length - 1));
                            return `${index === 0 ? '' : 'L '}${width} ${height}`;
                          }).join(' ')}`}
                          fill="none"
                          stroke="url(#line-gradient)"
                          strokeWidth="0.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                      
                      {/* Small data point circles */}
                      {keywordData.monthlyTrends.map((volume: number, index: number) => {
                        const maxVolume = Math.max(...keywordData.monthlyTrends);
                        const height = maxVolume > 0 ? 100 - Math.max((volume / maxVolume) * 85, 5) : 95;
                        const width = keywordData.monthlyTrends.length > 1 
                          ? index * (100 / (keywordData.monthlyTrends.length - 1))
                          : 50; // Center a single point
                        
                        const isCurrentMonth = index === keywordData.monthlyTrends.length - 1;
                        const isPreviousMonth = index === keywordData.monthlyTrends.length - 2;
                        
                        // Only render dots for current and previous month
                        if (!isCurrentMonth && !isPreviousMonth) return null;
                        
                        return (
                          <circle
                            key={index}
                            cx={`${width}`}
                            cy={`${height}`}
                            r="0.6"
                            fill={isCurrentMonth ? "#60a5fa" : "#f472b6"}
                            stroke="#ffffff"
                            strokeWidth="0.2"
                          />
                        );
                      })}
                    </svg>
                    
                    {/* Month labels */}
                    <div className="h-full flex items-end justify-between relative mt-auto pt-8">
                      {keywordData.monthlyTrends.map((volume: number, index: number) => {
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const currentMonth = new Date().getMonth();
                        const monthIndex = (currentMonth - (11 - index) + 12) % 12;
                        
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <span className="text-xs text-gray-400">{months[monthIndex]}</span>
                            <span className="text-xs text-gray-500 mt-1">{volume.toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Current vs Previous Month Comparison Bars - POSITIONED AT CENTER */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 bottom-24 flex space-x-8 items-end h-1/2">
                      {/* Current Month Bar */}
                      {keywordData.monthlyTrends && keywordData.monthlyTrends.length > 1 && (
                        <>
                          <div className="flex flex-col items-center">
                            <div className="text-xs text-white mb-2 font-medium">Current</div>
                            <div className="w-16 bg-blue-500 rounded-t-sm" 
                                 style={{ 
                                   height: `${Math.max((keywordData.monthlyTrends[keywordData.monthlyTrends.length - 1] / 
                                   Math.max(...keywordData.monthlyTrends)) * 100, 10)}%` 
                                 }}>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                              {keywordData.monthlyTrends[keywordData.monthlyTrends.length - 1].toLocaleString()}
                            </div>
                          </div>
                          
                          {/* Previous Month Bar */}
                          <div className="flex flex-col items-center">
                            <div className="text-xs text-white mb-2 font-medium">Previous</div>
                            <div className="w-16 bg-pink-500 rounded-t-sm" 
                                 style={{ 
                                   height: `${Math.max((keywordData.monthlyTrends[keywordData.monthlyTrends.length - 2] / 
                                   Math.max(...keywordData.monthlyTrends)) * 100, 10)}%` 
                                 }}>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                              {keywordData.monthlyTrends[keywordData.monthlyTrends.length - 2].toLocaleString()}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400">No monthly trend data available</p>
                  </div>
                )}
              </div>
              <div className="mt-10 pt-4 text-sm text-gray-300 border-t border-gray-700">
                <div className="flex items-center justify-center space-x-8">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
                    <span>Current month</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-pink-500 rounded-sm mr-2"></div>
                    <span>Previous month</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-1 w-8 bg-gradient-to-r from-indigo-400 to-violet-400 rounded-sm mr-2"></div>
                    <span>Trend line</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Insights Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Keyword Insights</h3>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                  <h4 className="font-medium">Competition Analysis</h4>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    {keywordData.competition < 0.3 
                      ? `This keyword has low competition (${(keywordData.competition * 100).toFixed(0)}%), making it easier to rank for.` 
                      : keywordData.competition < 0.7 
                        ? `This keyword has medium competition (${(keywordData.competition * 100).toFixed(0)}%). You'll need quality content to rank.` 
                        : `This keyword has high competition (${(keywordData.competition * 100).toFixed(0)}%). Consider targeting related keywords with less competition.`}
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-r-lg">
                  <h4 className="font-medium">Search Volume Assessment</h4>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    {keywordData.searchVolume > 10000 
                      ? `With ${keywordData.searchVolume.toLocaleString()} monthly searches, this is a high-volume keyword.` 
                      : keywordData.searchVolume > 1000 
                        ? `With ${keywordData.searchVolume.toLocaleString()} monthly searches, this keyword has a decent search volume.` 
                        : `With ${keywordData.searchVolume.toLocaleString()} monthly searches, this is a low-volume keyword.`}
                    {keywordData.growthRate > 5 
                      ? ` It's growing at ${keywordData.growthRate}%, suggesting increasing popularity.` 
                      : keywordData.growthRate < 0 
                        ? ` It's declining at ${Math.abs(keywordData.growthRate)}%, suggesting decreasing interest.` 
                        : ` Its search volume is relatively stable.`}
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 rounded-r-lg">
                  <h4 className="font-medium">Intent Analysis</h4>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    {metrics.intent === 'Informational' 
                      ? 'This keyword has informational intent. Users are looking for answers or information. Create educational content to target this keyword.' 
                      : metrics.intent === 'Transactional' 
                        ? 'This keyword has transactional intent. Users are looking to make a purchase or take a specific action.' 
                        : metrics.intent === 'Commercial' 
                          ? 'This keyword has commercial investigation intent. Users are researching products or services before making a purchase decision.' 
                          : 'This keyword has navigational intent. Users are looking for a specific website or page.'}
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-r-lg">
                  <h4 className="font-medium">Optimization Recommendations</h4>
                  <ul className="mt-1 space-y-2 text-gray-600 dark:text-gray-300 list-disc pl-5">
                    <li>Include this keyword in your video title, description, and tags.</li>
                    <li>Consider creating content addressing the main user questions around this topic.</li>
                    {metrics.intent === 'Informational' && (
                      <li>Create educational content that thoroughly explains this topic.</li>
                    )}
                    {metrics.intent === 'Transactional' && (
                      <li>Include clear calls-to-action and purchase information in your content.</li>
                    )}
                    {metrics.intent === 'Commercial' && (
                      <li>Consider creating comparison or review content for this keyword.</li>
                    )}
                    {keywordData.competition > 0.7 && (
                      <li>Target more specific long-tail variations to reduce competition.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Related Keywords Tab */}
        {activeTab === 'related' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Keyword
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Search Volume
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Competition
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      CPC
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {relatedKeywords.map((relatedKeyword) => (
                    <tr key={relatedKeyword.keyword} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {relatedKeyword.keyword}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {relatedKeyword.searchVolume.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(relatedKeyword.competition * 100, 100)}%` }}
                            ></div>
                          </div>
                          {(relatedKeyword.competition * 100).toFixed(0)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        ${relatedKeyword.cpc.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span 
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${relatedKeyword.difficulty < 30 
                              ? 'bg-green-100 text-green-800' 
                              : relatedKeyword.difficulty < 70 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'}`}
                        >
                          {relatedKeyword.difficulty < 30 
                            ? 'Easy' 
                            : relatedKeyword.difficulty < 70 
                              ? 'Medium' 
                              : 'Hard'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button 
                          onClick={() => router.push(`/keywords/${encodeURIComponent(relatedKeyword.keyword)}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                        >
                          <span>View Details</span>
                          <FaArrowRight className="ml-1 h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedSuggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium truncate">{suggestion}</p>
                    <div className="flex items-center mt-1">
                      <FaYoutube className="text-red-500 mr-1 h-4 w-4" />
                      <a 
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(suggestion)}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Search on YouTube
                      </a>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/keywords/${encodeURIComponent(suggestion)}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Placeholder component for FaExclamationTriangle since it wasn't imported
function FaExclamationTriangle(props: any) {
  return (
    <svg 
      stroke="currentColor" 
      fill="currentColor" 
      strokeWidth="0" 
      viewBox="0 0 576 512" 
      height="1em" 
      width="1em" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path>
    </svg>
  );
} 