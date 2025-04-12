'use client';

import { useState } from 'react';
import { KeywordAnalyticsProps } from '../types/keywords';
import { FaChartBar, FaSpinner, FaArrowUp, FaArrowDown, FaExclamationTriangle, FaArrowRight, FaChartLine, FaChartPie, FaTable } from 'react-icons/fa';

export default function KeywordAnalyticsSimple({ metrics, isLoading, onKeywordSelect }: KeywordAnalyticsProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortField, setSortField] = useState<string>('searchVolume');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaSpinner className="animate-spin h-8 w-8 mb-4 text-blue-500" />
        <p className="text-gray-500">Analyzing keywords...</p>
      </div>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaExclamationTriangle className="h-8 w-8 mb-4 text-yellow-500" />
        <p className="text-gray-500">No keyword data available. Please select keywords to analyze.</p>
      </div>
    );
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort metrics based on current sort field and direction
  const sortedMetrics = [...metrics].sort((a, b) => {
    let aValue: any = a[sortField as keyof typeof a];
    let bValue: any = b[sortField as keyof typeof b];
    
    if (aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
    if (bValue === undefined) return sortDirection === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate averages and totals for summary metrics
  const avgSearchVolume = Math.floor(sortedMetrics.reduce((sum, m) => sum + m.searchVolume, 0) / sortedMetrics.length);
  const avgCompetition = sortedMetrics.reduce((sum, m) => sum + m.competition, 0) / sortedMetrics.length;
  const avgCPC = sortedMetrics.reduce((sum, m) => sum + m.cpc, 0) / sortedMetrics.length;
  const avgDifficulty = Math.floor(sortedMetrics.reduce((sum, m) => sum + m.difficulty, 0) / sortedMetrics.length);

  // Get distribution of intents and categories
  const intentCounts = sortedMetrics.reduce((acc, metric) => {
    acc[metric.intent] = (acc[metric.intent] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryCounts = sortedMetrics.reduce((acc, metric) => {
    acc[metric.category] = (acc[metric.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Search Volume</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgSearchVolume.toLocaleString()}</p>
            </div>
            <FaChartBar className="h-10 w-10 text-blue-500 opacity-80" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Competition</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{(avgCompetition * 100).toFixed(1)}%</p>
            </div>
            <FaChartLine className="h-10 w-10 text-purple-500 opacity-80" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. CPC</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${avgCPC.toFixed(2)}</p>
            </div>
            <FaChartPie className="h-10 w-10 text-green-500 opacity-80" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Difficulty</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgDifficulty}</p>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  avgDifficulty < 30 
                    ? 'bg-green-100 text-green-800' 
                    : avgDifficulty < 70 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                }`}>
                  {avgDifficulty < 30 ? 'Easy' : avgDifficulty < 70 ? 'Medium' : 'Hard'}
                </span>
              </div>
            </div>
            <FaExclamationTriangle className="h-10 w-10 text-orange-500 opacity-80" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          <FaChartBar className="inline mr-2 text-blue-500" />
          Keyword Analysis Results
        </h3>
        <div className="flex gap-2">
          <span className="text-sm text-gray-500 mr-2 self-center">
            {metrics.length} keywords analyzed
          </span>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-md flex p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'table' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <FaTable className="inline mr-1 h-3 w-3" /> Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'cards' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <FaChartBar className="inline mr-1 h-3 w-3" /> Cards
            </button>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort('keyword')}
                >
                  <div className="flex items-center">
                    Keyword
                    {sortField === 'keyword' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? <FaArrowUp className="h-3 w-3" /> : <FaArrowDown className="h-3 w-3" />}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort('searchVolume')}
                >
                  <div className="flex items-center">
                    Search Volume
                    {sortField === 'searchVolume' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? <FaArrowUp className="h-3 w-3" /> : <FaArrowDown className="h-3 w-3" />}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort('competition')}
                >
                  <div className="flex items-center">
                    Competition
                    {sortField === 'competition' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? <FaArrowUp className="h-3 w-3" /> : <FaArrowDown className="h-3 w-3" />}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort('cpc')}
                >
                  <div className="flex items-center">
                    CPC
                    {sortField === 'cpc' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? <FaArrowUp className="h-3 w-3" /> : <FaArrowDown className="h-3 w-3" />}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort('difficulty')}
                >
                  <div className="flex items-center">
                    Difficulty
                    {sortField === 'difficulty' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? <FaArrowUp className="h-3 w-3" /> : <FaArrowDown className="h-3 w-3" />}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {sortField === 'category' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? <FaArrowUp className="h-3 w-3" /> : <FaArrowDown className="h-3 w-3" />}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort('intent')}
                >
                  <div className="flex items-center">
                    Intent
                    {sortField === 'intent' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? <FaArrowUp className="h-3 w-3" /> : <FaArrowDown className="h-3 w-3" />}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {sortedMetrics.map((metric) => (
                <tr key={metric.keyword} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {metric.keyword}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {metric.searchVolume.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(metric.competition * 100, 100)}%` }}
                        ></div>
                      </div>
                      {(metric.competition * 100).toFixed(0)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    ${metric.cpc.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span 
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${metric.difficulty < 30 
                          ? 'bg-green-100 text-green-800' 
                          : metric.difficulty < 70 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'}`}
                    >
                      {metric.difficulty < 30 
                        ? 'Easy' 
                        : metric.difficulty < 70 
                          ? 'Medium' 
                          : 'Hard'} 
                      ({metric.difficulty})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {metric.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {metric.intent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {onKeywordSelect && (
                      <button 
                        onClick={() => onKeywordSelect(metric.keyword)}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                      >
                        <span>Details</span>
                        <FaArrowRight className="ml-1 h-3 w-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Card View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMetrics.map((metric) => (
            <div key={metric.keyword} className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">{metric.keyword}</h4>
                {onKeywordSelect && (
                  <button 
                    onClick={() => onKeywordSelect(metric.keyword)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Volume:</span>
                  <span className="font-medium">{metric.searchVolume.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Competition:</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(metric.competition * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="font-medium">{(metric.competition * 100).toFixed(0)}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">CPC:</span>
                  <span className="font-medium">${metric.cpc.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Difficulty:</span>
                  <span 
                    className={`px-2 py-1 text-xs font-medium rounded-full 
                      ${metric.difficulty < 30 
                        ? 'bg-green-100 text-green-800' 
                        : metric.difficulty < 70 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'}`}
                  >
                    {metric.difficulty < 30 
                      ? 'Easy' 
                      : metric.difficulty < 70 
                        ? 'Medium' 
                        : 'Hard'} 
                    ({metric.difficulty})
                  </span>
                </div>
                
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                  <div>
                    <span className="text-xs text-gray-500">Category:</span>
                    <p className="text-sm font-medium">{metric.category}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Intent:</span>
                    <p className="text-sm font-medium">{metric.intent}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
        <h4 className="font-medium mb-2">Recommendations</h4>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Focus on keywords with high search volume and low competition for the best results.</li>
          <li>Informational keywords ({intentCounts['Informational'] || 0} found) are good for content marketing, while transactional keywords ({intentCounts['Transactional'] || 0} found) are better for conversion-focused pages.</li>
          <li>Consider the CPC as an indicator of commercial value - higher CPCs typically mean more valuable keywords.</li>
          {avgDifficulty < 30 ? (
            <li className="text-green-600">The selected keywords have low average difficulty, making them excellent opportunities for ranking.</li>
          ) : avgDifficulty < 70 ? (
            <li className="text-yellow-600">Most selected keywords have medium difficulty - focus on proper optimization for these terms.</li>
          ) : (
            <li className="text-red-600">Many selected keywords have high difficulty - consider focusing on longer-tail variations first.</li>
          )}
        </ul>
      </div>
    </div>
  );
} 