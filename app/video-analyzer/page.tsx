'use client';

import { useState } from 'react';
import { FaYoutube, FaSearch, FaChartLine, FaFileAlt, FaChartBar } from 'react-icons/fa';
import VideoSearchForm from '../components/VideoSearchForm';
import VideoDetailsCard from '../components/VideoDetailsCard';
import VideoAnalyticsCharts from '../components/VideoAnalyticsCharts';
import KeywordAnalytics from '../components/KeywordAnalytics';
import PopularVideosList from '../components/PopularVideosList';
import VideoTranscript from '../components/VideoTranscript';
import { fetchPopularVideos, fetchVideoDetails } from '../services/youtube';
import { extractYouTubeVideoId } from '../utils/youtube';
import { YouTubeVideoItem } from '../types/youtube';

export default function VideoAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoDetails, setVideoDetails] = useState<YouTubeVideoItem | null>(null);
  const [popularVideos, setPopularVideos] = useState<YouTubeVideoItem[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'keywords' | 'transcript' | 'similar'>('analytics');

  const analyzeVideo = async (url: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const videoId = extractYouTubeVideoId(url);
      
      if (!videoId) {
        throw new Error('Could not extract YouTube video ID from the provided URL');
      }
      
      // Fetch video details
      const videoData = await fetchVideoDetails(videoId);
      
      if (!videoData.items || videoData.items.length === 0) {
        throw new Error('No video found with the provided ID');
      }
      
      setVideoDetails(videoData.items[0]);
      
      // Fetch popular videos for comparison
      const popularVideosData = await fetchPopularVideos();
      
      if (popularVideosData.items && popularVideosData.items.length > 0) {
        // Add statistics to popular videos by fetching details for each
        const videosWithStats = await Promise.all(
          popularVideosData.items.map(async (video) => {
            try {
              const detailsData = await fetchVideoDetails(video.id);
              if (detailsData.items && detailsData.items.length > 0) {
                return detailsData.items[0];
              }
              return video;
            } catch (error) {
              console.error(`Error fetching details for video ${video.id}:`, error);
              return video;
            }
          })
        );
        
        setPopularVideos(videosWithStats);
      }
    } catch (err) {
      console.error('Error analyzing video:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePopularVideoSelect = async (videoId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const videoData = await fetchVideoDetails(videoId);
      
      if (!videoData.items || videoData.items.length === 0) {
        throw new Error('No video found with the provided ID');
      }
      
      setVideoDetails(videoData.items[0]);
    } catch (err) {
      console.error('Error fetching video details:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-gradient-to-r from-red-500 to-red-700 text-white p-12 rounded-xl shadow-lg mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 flex items-center justify-center gap-4">
            <FaYoutube className="h-12 w-12" />
            <span>YouTube <span className="text-yellow-300">Analytics</span> Pro</span>
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Uncover advanced insights from any YouTube video. Analyze keywords, competition, engagement metrics, and more.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-inner">
            <VideoSearchForm onSearch={analyzeVideo} isLoading={loading} />
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-400">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}
      
      {loading && !videoDetails && (
        <div className="flex justify-center items-center p-12">
          <div className="animate-pulse flex flex-col items-center">
            <FaYoutube className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Analyzing video data...</p>
          </div>
        </div>
      )}
      
      {videoDetails && (
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <FaChartLine />
            <h2>Video Analytics Dashboard</h2>
          </div>
          
          <VideoDetailsCard video={videoDetails} />
          
          {/* Tab navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <ul className="flex flex-wrap text-sm font-medium text-center">
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg ${
                    activeTab === 'analytics'
                      ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                      : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                  }`}
                >
                  <FaChartBar />
                  Engagement Metrics
                </button>
              </li>
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab('keywords')}
                  className={`inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg ${
                    activeTab === 'keywords'
                      ? 'text-purple-600 border-purple-600 dark:text-purple-500 dark:border-purple-500'
                      : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                  }`}
                >
                  <FaSearch />
                  Keyword Analysis
                </button>
              </li>
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg ${
                    activeTab === 'transcript'
                      ? 'text-red-600 border-red-600 dark:text-red-500 dark:border-red-500'
                      : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                  }`}
                >
                  <FaFileAlt />
                  Transcript
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('similar')}
                  className={`inline-flex items-center gap-2 p-4 border-b-2 rounded-t-lg ${
                    activeTab === 'similar'
                      ? 'text-green-600 border-green-600 dark:text-green-500 dark:border-green-500'
                      : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                  }`}
                >
                  <FaYoutube />
                  Similar Videos
                </button>
              </li>
            </ul>
          </div>
          
          {/* Tab content */}
          <div className="tab-content">
            {activeTab === 'analytics' && (
              <VideoAnalyticsCharts video={videoDetails} popularVideos={popularVideos} />
            )}
            
            {activeTab === 'keywords' && (
              <KeywordAnalytics video={videoDetails} />
            )}
            
            {activeTab === 'transcript' && (
              <VideoTranscript videoId={videoDetails.id} />
            )}
            
            {activeTab === 'similar' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                  <FaSearch className="text-blue-500" />
                  Similar Popular Videos
                </h2>
                
                <PopularVideosList videos={popularVideos} onSelectVideo={handlePopularVideoSelect} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 