'use client';

import { useState, KeyboardEvent, ChangeEvent, useEffect, useRef } from 'react';
import { fetchYouTubeSearchSuggestions, analyzeKeywordMetrics, suggestionsToKeywordMetrics } from '../services/youtube';
import { KeywordMetrics } from '../types/keywords';
import KeywordResults from '../components/KeywordResults';
import KeywordAnalyticsSimple from '../components/KeywordAnalyticsSimple';
import { FaSearch, FaSpinner, FaTimes, FaArrowRight, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function KeywordsMaker() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsMetrics, setSuggestionsMetrics] = useState<KeywordMetrics[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<KeywordMetrics[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsLoadingSuggestions(true);
    
    // Debounce search to prevent excessive API calls
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await fetchYouTubeSearchSuggestions(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
        
        // Get metrics for suggestions
        const metricsData = await suggestionsToKeywordMetrics(results);
        setSuggestionsMetrics(metricsData);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoadingSuggestions(true);
    try {
      const results = await fetchYouTubeSearchSuggestions(searchQuery);
      setSuggestions(results);
      setSelectedKeywords([]);
      
      // Pre-select the main keyword
      if (!results.includes(searchQuery)) {
        results.unshift(searchQuery);
      }
      handleToggleKeyword(searchQuery);
      
      // Analyze immediately
      handleAnalyzeKeywords([searchQuery]);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (keyword: string) => {
    setSearchQuery(keyword);
    setShowSuggestions(false);
    handleSearch();
  };

  const handleToggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const handleAnalyzeKeywords = async (keywords: string[]) => {
    if (keywords.length === 0) return;
    
    setIsLoadingAnalytics(true);
    setActiveTab('analytics');
    
    try {
      const results = await analyzeKeywordMetrics(keywords);
      setMetrics(results);
    } catch (error) {
      console.error('Error analyzing keywords:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleKeywordSelect = (keyword: string) => {
    setSelectedKeyword(keyword);
    router.push(`/keywords/${encodeURIComponent(keyword)}`);
  };

  const getMetricsForSuggestion = (suggestionText: string) => {
    return suggestionsMetrics.find(metric => metric.keyword === suggestionText);
  };

  const getDifficultyLevel = (difficultyScore: number) => {
    if (difficultyScore < 30) return 'Easy';
    if (difficultyScore < 70) return 'Medium';
    return 'Hard';
  };

  // Function to highlight matching text in suggestions
  const highlightMatchingText = (text: string, query: string) => {
    if (!query) return text;
    
    // Escape special characters for regex
    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };
    
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? <span key={i} className="bg-yellow-300 text-black">{part}</span> : part
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-white">YouTube Keyword Explorer</h1>
      
      <div className="bg-gray-900 rounded-lg shadow-md mb-8 overflow-hidden border border-gray-800 min-h-[500px]">
        <div className="border-b border-gray-800 px-6 py-5">
          <h2 className="text-xl font-semibold text-white">Enter Keyword to Analyze</h2>
        </div>
        <div className="p-8">
          <div className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter a keyword (e.g., best video)"
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                className="w-full pl-10 pr-20 py-4 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-lg"
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }} 
                  className="absolute inset-y-0 right-12 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              )}
              <button 
                onClick={handleSearch} 
                disabled={isLoadingSuggestions || !searchQuery.trim()}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-blue-400 hover:text-blue-300"
              >
                {isLoadingSuggestions ? (
                  <FaSpinner className="h-5 w-5 animate-spin" />
                ) : (
                  <FaArrowRight className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {/* Suggestion dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute mt-2 w-full rounded-md shadow-lg z-50 bg-black/90 backdrop-filter backdrop-blur-sm border border-gray-700 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
              >
                <ul className="py-2">
                  {suggestions.map((suggestion, index) => {
                    // Get metrics for this suggestion
                    const metrics = getMetricsForSuggestion(suggestion);
                    // Default values if metrics not available
                    const difficulty = metrics?.difficulty || 50;
                    const searchVolume = metrics?.searchVolume || 0;
                    const cpc = metrics?.cpc || 0;
                    // Get the difficulty level based on the difficulty score
                    const difficultyLevel = getDifficultyLevel(difficulty);
                    
                    return (
                      <li 
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-6 py-4 hover:bg-gray-800 cursor-pointer border-b border-gray-700 last:border-b-0"
                      >
                        <div className="flex flex-col">
                          <div className="font-medium text-white text-base mb-2">
                            {highlightMatchingText(suggestion, searchQuery)}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="flex items-center text-gray-400">
                              <FaChartLine className="mr-1.5 text-blue-400" />
                              <span>Vol: {searchVolume.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center text-gray-400">
                              <FaMoneyBillWave className="mr-1.5 text-green-400" />
                              <span>CPC: ${cpc.toFixed(2)}</span>
                            </span>
                            <span className="flex items-center">
                              <span 
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  difficultyLevel === 'Easy' ? 'bg-green-100 text-green-800' :
                                  difficultyLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                {difficultyLevel}
                              </span>
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <button 
              onClick={handleSearch} 
              disabled={isLoadingSuggestions || !searchQuery.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoadingSuggestions ? 'Searching...' : 'Get Suggestions'}
            </button>
            <button 
              onClick={() => {
                const randomKeywords = [
                  "youtube marketing", 
                  "how to grow channel", 
                  "video seo tips",
                  "best video editor",
                  "youtube algorithm"
                ];
                const random = Math.floor(Math.random() * randomKeywords.length);
                setSearchQuery(randomKeywords[random]);
                handleSearch();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Try Example
            </button>
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="w-full">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 w-full">
              <button
                className={`py-3 text-center font-medium ${
                  activeTab === 'suggestions' 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('suggestions')}
              >
                Suggestions
              </button>
              <button
                className={`py-3 text-center font-medium ${
                  activeTab === 'analytics' 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('analytics')}
                disabled={selectedKeywords.length === 0 && !isLoadingAnalytics}
              >
                Analytics
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            {activeTab === 'suggestions' && (
              <KeywordResults
                suggestions={suggestions}
                selectedKeywords={selectedKeywords}
                onToggleKeyword={handleToggleKeyword}
                onAnalyze={() => handleAnalyzeKeywords(selectedKeywords)}
                isLoading={isLoadingSuggestions}
                onKeywordSelect={handleKeywordSelect}
                keywordMetrics={suggestionsMetrics}
              />
            )}
            
            {activeTab === 'analytics' && (
              <KeywordAnalyticsSimple 
                metrics={metrics} 
                isLoading={isLoadingAnalytics} 
                onKeywordSelect={handleKeywordSelect}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
} 