'use client';

import Image from 'next/image';
import { YouTubeVideoItem } from '../types/youtube';
import { FaEye, FaThumbsUp, FaComment } from 'react-icons/fa';

interface PopularVideosListProps {
  videos: YouTubeVideoItem[];
  onSelectVideo: (videoId: string) => void;
}

export default function PopularVideosList({ videos, onSelectVideo }: PopularVideosListProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Popular Videos</h2>
        <p className="text-gray-500 dark:text-gray-400">No videos available at the moment.</p>
      </div>
    );
  }

  // Format view count with comma separators
  const formatNumber = (num: string | undefined) => {
    if (!num) return '0';
    const n = parseInt(num);
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1) + 'M';
    } else if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'K';
    }
    return n.toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Popular Videos</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div 
            key={video.id}
            className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelectVideo(video.id)}
          >
            <div className="relative w-full h-0 pb-[56.25%]">
              {video.snippet.thumbnails.high ? (
                <Image
                  src={video.snippet.thumbnails.high.url}
                  alt={video.snippet.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">No thumbnail</p>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white line-clamp-2">
                {video.snippet.title}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {video.snippet.channelTitle}
              </p>
              
              {video.statistics && (
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <FaEye className="mr-1 h-3 w-3" />
                    <span>{formatNumber(video.statistics.viewCount)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <FaThumbsUp className="mr-1 h-3 w-3" />
                    <span>{formatNumber(video.statistics.likeCount)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <FaComment className="mr-1 h-3 w-3" />
                    <span>{formatNumber(video.statistics.commentCount)}</span>
                  </div>
                </div>
              )}
              
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {new Date(video.snippet.publishedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 