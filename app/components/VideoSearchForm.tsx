'use client';

import { FormEvent, useState } from 'react';
import { FaSearch, FaYoutube, FaSpinner } from 'react-icons/fa';

interface VideoSearchFormProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
}

export default function VideoSearchForm({ onSearch, isLoading }: VideoSearchFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }
    
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    
    setError('');
    onSearch(url);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText.includes('youtube.com') || clipboardText.includes('youtu.be')) {
        setUrl(clipboardText);
        setError('');
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const handleClear = () => {
    setUrl('');
    setError('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <FaYoutube className="w-6 h-6 text-red-500" />
          </div>
          <input
            type="url"
            className="block w-full p-5 pl-14 text-base text-gray-100 border-0 rounded-xl bg-white/20 backdrop-blur-sm focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-white/70 shadow-inner"
            placeholder="Enter YouTube URL (e.g., youtube.com/watch?v=... or youtube.com/shorts/...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          {url && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-24 bottom-1/2 translate-y-1/2 text-white/70 hover:text-white focus:outline-none"
            >
              ✕
            </button>
          )}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
            <button
              type="button"
              onClick={handlePaste}
              className="text-white/90 hover:text-white px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 focus:outline-none text-sm transition-colors"
            >
              Paste
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 font-medium rounded-lg text-sm px-6 py-2.5 flex items-center disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FaSearch className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-white bg-red-600/60 backdrop-blur-sm px-4 py-2 rounded-lg text-center">{error}</p>
        )}
        <p className="text-white/80 text-sm text-center">
          Paste any YouTube video or Shorts URL to analyze its performance, keywords, and competition
        </p>
      </form>
    </div>
  );
} 