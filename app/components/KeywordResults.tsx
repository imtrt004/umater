'use client';

import { useState } from 'react';
import { KeywordResultsProps } from '../types/keywords';
import { FaSearch, FaSpinner, FaChartLine, FaArrowRight } from 'react-icons/fa';

export default function KeywordResults({
  suggestions,
  selectedKeywords,
  onToggleKeyword,
  onAnalyze,
  isLoading,
  onKeywordSelect,
  keywordMetrics = []
}: KeywordResultsProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [hoveredKeyword, setHoveredKeyword] = useState<string | null>(null);
  
  const filteredSuggestions = searchFilter
    ? suggestions.filter(keyword => 
        keyword.toLowerCase().includes(searchFilter.toLowerCase()))
    : suggestions;

  const selectAll = () => {
    suggestions.forEach(keyword => {
      if (!selectedKeywords.includes(keyword)) {
        onToggleKeyword(keyword);
      }
    });
  };

  const deselectAll = () => {
    selectedKeywords.forEach(keyword => {
      onToggleKeyword(keyword);
    });
  };

  const getMetricsForKeyword = (keyword: string) => {
    return keywordMetrics.find(m => m.keyword === keyword);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-500';
    if (difficulty < 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-lg">
            {suggestions.length} Keywords Found
          </h3>
          <span className="px-2 py-1 text-xs border rounded-full text-gray-600 dark:text-gray-300">
            {selectedKeywords.length} selected
          </span>
        </div>

        <div className="flex gap-2">
          <button
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            onClick={selectAll}
            disabled={isLoading || suggestions.length === 0}
          >
            Select All
          </button>
          <button
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            onClick={deselectAll}
            disabled={isLoading || selectedKeywords.length === 0}
          >
            Deselect All
          </button>
          <button
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={() => onAnalyze(selectedKeywords)}
            disabled={isLoading || selectedKeywords.length === 0}
          >
            {isLoading ? (
              <>
                <FaSpinner className="inline mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FaSearch className="inline mr-2 h-4 w-4" />
                Analyze Selected
              </>
            )}
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Filter keywords..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md w-full"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <FaSearch className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Keyword
              </th>
              {keywordMetrics.length > 0 && (
                <>
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
                </>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {filteredSuggestions.map((keyword) => {
              const metrics = getMetricsForKeyword(keyword);
              
              return (
                <tr 
                  key={keyword} 
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedKeywords.includes(keyword) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onMouseEnter={() => setHoveredKeyword(keyword)}
                  onMouseLeave={() => setHoveredKeyword(null)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input 
                        type="checkbox"
                        checked={selectedKeywords.includes(keyword)}
                        className="h-4 w-4 accent-blue-500 mr-3"
                        onChange={() => onToggleKeyword(keyword)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="font-medium">{keyword}</span>
                    </div>
                  </td>
                  
                  {keywordMetrics.length > 0 && metrics && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {metrics.searchVolume.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(metrics.competition * 100, 100)}%` }}
                            ></div>
                          </div>
                          {(metrics.competition * 100).toFixed(0)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        ${metrics.cpc.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          metrics.difficulty < 30 
                            ? 'bg-green-100 text-green-800' 
                            : metrics.difficulty < 70 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {metrics.difficulty < 30 ? 'Easy' : metrics.difficulty < 70 ? 'Medium' : 'Hard'}
                        </span>
                      </td>
                    </>
                  )}
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {onKeywordSelect && (
                      <button 
                        onClick={() => onKeywordSelect(keyword)}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                      >
                        <span>Details</span>
                        <FaArrowRight className="ml-1 h-3 w-3" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredSuggestions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchFilter 
            ? 'No keywords match your filter' 
            : 'No keywords available'}
        </div>
      )}

      {selectedKeywords.length > 0 && (
        <button
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={() => onAnalyze(selectedKeywords)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="inline mr-2 h-4 w-4 animate-spin" />
              Analyzing {selectedKeywords.length} keywords...
            </>
          ) : (
            <>
              <FaSearch className="inline mr-2 h-4 w-4" />
              Analyze {selectedKeywords.length} selected keywords
            </>
          )}
        </button>
      )}
    </div>
  );
} 