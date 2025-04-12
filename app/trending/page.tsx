'use client';

import { useState } from 'react';
import { FaYoutube, FaGlobe, FaSpinner, FaFire } from 'react-icons/fa';
import TrendingVideosSelector, { COUNTRIES } from '../components/TrendingVideosSelector';
import VideoDetailsCard from '../components/VideoDetailsCard';
import { fetchVideoDetails } from '../services/youtube';
import { YouTubeVideoItem } from '../types/youtube';

export default function TrendingPage() {
  const [trendingVideos, setTrendingVideos] = useState<YouTubeVideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideoItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  const handleVideosLoaded = (videos: YouTubeVideoItem[], countryCode: string) => {
    setTrendingVideos(videos);
    setSelectedCountry(countryCode);
    
    // Always select the first video when new videos are loaded
    if (videos.length > 0) {
      handleVideoSelect(videos[0].id);
    }
  };

  const handleVideoSelect = async (videoId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const videoData = await fetchVideoDetails(videoId);
      
      if (!videoData.items || videoData.items.length === 0) {
        throw new Error('No video found with the provided ID');
      }
      
      setSelectedVideo(videoData.items[0]);
    } catch (err) {
      console.error('Error fetching video details:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white flex items-center justify-center gap-3">
          <FaFire className="text-red-500" />
          Trending <span className="text-red-600">Videos</span> Explorer
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Discover what's trending worldwide and analyze popular content across different countries.
        </p>
      </section>
      
      <TrendingVideosSelector onVideosLoaded={handleVideosLoaded} />
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-400">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}
      
      {loading && !selectedVideo && (
        <div className="flex justify-center items-center p-12">
          <div className="animate-pulse flex flex-col items-center">
            <FaYoutube className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading video data...</p>
          </div>
        </div>
      )}
      
      {selectedVideo && (
        <div className="flex flex-col gap-8">
          <VideoDetailsCard video={selectedVideo} />
        </div>
      )}
      
      {trendingVideos.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaGlobe className="text-blue-500" />
              Trending in {COUNTRIES.find((c: { code: string, name: string }) => c.code === selectedCountry)?.name || selectedCountry} ({trendingVideos.length} videos)
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingVideos.map((video) => (
              <div 
                key={video.id}
                onClick={() => handleVideoSelect(video.id)}
                className={`rounded-lg overflow-hidden shadow-md transition-all cursor-pointer hover:shadow-xl 
                  ${selectedVideo?.id === video.id ? 'ring-2 ring-red-500' : ''}`}
              >
                <div className="relative pb-[56.25%]">
                  <img
                    src={video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url}
                    alt={video.snippet.title}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium line-clamp-2 mb-1 text-gray-900 dark:text-white">
                    {video.snippet.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {video.snippet.channelTitle}
                  </p>
                  {video.statistics && (
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{parseInt(video.statistics.viewCount || '0').toLocaleString()} views</span>
                      <span>•</span>
                      <span>{parseInt(video.statistics.likeCount || '0').toLocaleString()} likes</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 