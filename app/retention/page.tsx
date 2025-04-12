'use client';

import RetentionAnalyzer from '../components/RetentionAnalyzer';
import { FaChartLine, FaCrown } from 'react-icons/fa';

export default function RetentionPage() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-8 text-white shadow-xl">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaChartLine className="text-3xl text-purple-300" />
            <h1 className="text-3xl font-bold">Advanced Retention Analytics</h1>
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs px-2 py-1 rounded-full font-bold flex items-center">
              <FaCrown className="mr-1" /> PRO
            </div>
          </div>
          <p className="text-center text-lg text-purple-200 mb-6">
            Unlock powerful insights on viewer behavior and discover exactly where your audience drops off.
            Our million-dollar analytics engine helps you optimize your content for maximum engagement.
          </p>
        </div>
      </div>
      
      <RetentionAnalyzer />
      
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Why Retention Matters</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Algorithm Boost</h3>
            <p className="text-gray-300 text-sm">
              YouTube prioritizes videos with higher retention rates in recommendations, 
              helping your content reach more viewers organically.
            </p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Audience Growth</h3>
            <p className="text-gray-300 text-sm">
              When viewers watch more of your video, they're more likely to subscribe,
              comment, and engage with your channel long-term.
            </p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Revenue Impact</h3>
            <p className="text-gray-300 text-sm">
              Higher retention means more ad impressions and increased watch time,
              directly translating to improved monetization potential.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 