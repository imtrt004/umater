'use client';

import Image from 'next/image';
import { FaEye, FaThumbsUp, FaComment, FaClock, FaUser, FaExternalLinkAlt } from 'react-icons/fa';
import { YouTubeVideoItem } from '../types/youtube';

interface VideoDetailsCardProps {
  video: YouTubeVideoItem;
}

export default function VideoDetailsCard({ video }: VideoDetailsCardProps) {
  const { snippet, statistics } = video;
  
  // Format view count with comma separators
  const formatNumber = (num: string | undefined) => {
    if (!num) return '0';
    return parseInt(num).toLocaleString();
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Calculate engagement rate
  const calculateEngagementRate = () => {
    if (!statistics) return '0';
    
    const views = parseInt(statistics.viewCount || '0');
    if (views === 0) return '0';
    
    const likes = parseInt(statistics.likeCount || '0');
    const comments = parseInt(statistics.commentCount || '0');
    
    return ((likes + comments) / views * 100).toFixed(2);
  };
  
  // Determine video URL
  const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden w-full max-w-4xl mx-auto border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="relative w-full h-0 pb-[56.25%]">
            {snippet.thumbnails.maxres ? (
              <Image
                src={snippet.thumbnails.maxres.url}
                alt={snippet.title}
                fill
                className="object-cover"
              />
            ) : snippet.thumbnails.high ? (
              <Image
                src={snippet.thumbnails.high.url}
                alt={snippet.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No thumbnail available</p>
              </div>
            )}
            
            <div className="absolute top-4 right-4">
              <a 
                href={videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-red-600 text-white rounded-full p-2 shadow-lg hover:bg-red-700 transition-colors"
                title="Open on YouTube"
              >
                <FaExternalLinkAlt />
              </a>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col h-full justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-3">{snippet.title}</h1>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                <FaUser className="mr-2 h-4 w-4" />
                <p className="font-semibold">{snippet.channelTitle}</p>
              </div>
              
              {snippet.publishedAt && (
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-6">
                  <FaClock className="mr-2 h-4 w-4" />
                  <span>{formatDate(snippet.publishedAt)}</span>
                </div>
              )}
            </div>
            
            {statistics && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mt-4">
                <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Key Metrics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="flex items-center text-blue-700 dark:text-blue-400">
                      <FaEye className="mr-2 h-4 w-4" />
                      <span className="font-semibold">Views</span>
                    </div>
                    <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{formatNumber(statistics.viewCount)}</p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="flex items-center text-green-700 dark:text-green-400">
                      <FaThumbsUp className="mr-2 h-4 w-4" />
                      <span className="font-semibold">Likes</span>
                    </div>
                    <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{formatNumber(statistics.likeCount)}</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <div className="flex items-center text-purple-700 dark:text-purple-400">
                      <FaComment className="mr-2 h-4 w-4" />
                      <span className="font-semibold">Comments</span>
                    </div>
                    <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{formatNumber(statistics.commentCount)}</p>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <div className="flex items-center text-yellow-700 dark:text-yellow-500">
                      <span className="font-semibold">Engagement</span>
                    </div>
                    <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{calculateEngagementRate()}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Description</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line max-h-40 overflow-y-auto rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4">
            {snippet.description || 'No description available.'}
          </p>
        </div>
        
        {snippet.tags && snippet.tags.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {snippet.tags.slice(0, 10).map((tag, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm shadow-sm"
                >
                  {tag}
                </span>
              ))}
              {snippet.tags.length > 10 && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm shadow-sm">
                  +{snippet.tags.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 