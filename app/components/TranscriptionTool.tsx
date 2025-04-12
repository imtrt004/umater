'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaYoutube, FaSpinner, FaCopy, FaDownload, FaClock, FaSearch, FaExclamationTriangle, FaHighlighter, FaFileAlt } from 'react-icons/fa';
import { transcribeYouTubeVideo, isValidYouTubeUrl, extractYouTubeVideoId } from '../services/transcription';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface TranscriptSegment {
  start: string | number;
  duration?: string | number;
  dur?: string | number;
  text: string;
}

const TranscriptionTool = () => {
  const searchParams = useSearchParams();
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedTranscript, setParsedTranscript] = useState<TranscriptSegment[]>([]);
  const [videoTitle, setVideoTitle] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const [selectedSegments, setSelectedSegments] = useState<Set<number>>(new Set());
  const [rawCaptions, setRawCaptions] = useState<TranscriptSegment[]>([]);

  useEffect(() => {
    // Check if there's a search keyword in URL params
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      // Automatically fill the search query but don't auto-search
      setVideoUrl(`https://www.youtube.com/results?search_query=${searchQuery}`);
    }
    
    // Add click outside listener for search results
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchParams]);

  // Parse transcript text into segments when transcript changes
  useEffect(() => {
    if (!transcript) {
      setParsedTranscript([]);
      return;
    }

    // If we have raw captions, use those
    if (rawCaptions && rawCaptions.length > 0) {
      setParsedTranscript(rawCaptions.map(caption => ({
        start: caption.start,
        duration: caption.dur,
        text: caption.text
      })));
      return;
    }

    // Otherwise parse the transcript text
    const lines = transcript.split('\n');
    
    if (lines.length > 1) {
      const parsed = lines.map((line, index) => {
        // Try to extract timestamp if in format [MM:SS]
        const timestampMatch = line.match(/\[(\d+:\d+)\]/);
        if (timestampMatch) {
          const [minutes, seconds] = timestampMatch[1].split(':').map(Number);
          const start = minutes * 60 + seconds;
          const text = line.replace(/\[\d+:\d+\]\s*/, '').trim();
          return { start, text };
        }
        // If no timestamp, just use index as placeholder
        return { start: index * 5, text: line };
      });
      setParsedTranscript(parsed);
    } else {
      // If it's just one big text, split into sentences
      const sentences = transcript
        .replace(/\.\s+/g, '.|')
        .replace(/\?\s+/g, '?|')
        .replace(/!\s+/g, '!|')
        .split('|')
        .filter(s => s.trim().length > 0);
      
      setParsedTranscript(sentences.map((text, index) => ({
        start: index * 5, // approximate timestamp
        text: text.trim()
      })));
    }
  }, [transcript, rawCaptions]);

  const handleSearchYouTube = async () => {
    if (!videoUrl.includes('youtube.com/results')) {
      return; // Not a search URL
    }
    
    setIsLoading(true);
    try {
      // This is a mock implementation - in a real app, you'd use YouTube API
      // For demo purposes, we'll just show some mock video options
      const query = new URL(videoUrl).searchParams.get('search_query') || '';
      
      // Mock search results
      setSearchResults([
        `Video about ${query} - Part 1`,
        `${query} tutorial - Beginner friendly`,
        `Learn ${query} in 10 minutes`,
        `${query} explained simply`,
      ]);
      setShowSearchResults(true);
      setError('');
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search for videos. Please try a direct video URL.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectSearchResult = (index: number) => {
    // In a real app, we would use actual video IDs from the YouTube API
    const mockVideoIds = ['dQw4w9WgXcQ', 'jNQXAC9IVRw', '9bZkp7q19f0', 'kJQP7kiw5Fk'];
    const videoId = mockVideoIds[index % mockVideoIds.length];
    
    // Set the video URL and close the search results
    setVideoUrl(`https://www.youtube.com/watch?v=${videoId}`);
    setShowSearchResults(false);
  };

  const handleTranscribe = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!isValidYouTubeUrl(videoUrl)) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    
    // If it's a search URL, show search results instead
    if (videoUrl.includes('youtube.com/results')) {
      handleSearchYouTube();
      return;
    }

    setError('');
    setIsLoading(true);
    setTranscript('');
    setVideoTitle('');
    setRawCaptions([]);
    setParsedTranscript([]);
    setSelectedSegments(new Set());

    try {
      const result = await transcribeYouTubeVideo(videoUrl, 'en', includeTimestamps);
      
      if (result.success) {
        if (result.transcript) {
          setTranscript(result.transcript);
        }
        
        if (result.captions && result.captions.length > 0) {
          setRawCaptions(result.captions);
        }
        
        if (result.title) {
          setVideoTitle(result.title);
        }
      } else {
        setError(result.error || 'Failed to transcribe the video. Please try again with a different video.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTimestamps = async () => {
    setIncludeTimestamps(!includeTimestamps);
    
    // If we already have a transcript, refresh it with the new timestamp setting
    if (transcript || rawCaptions.length > 0) {
      setIsLoading(true);
      try {
        const result = await transcribeYouTubeVideo(videoUrl, 'en', !includeTimestamps);
        if (result.success) {
          if (result.transcript) {
            setTranscript(result.transcript);
          }
          if (result.captions && result.captions.length > 0) {
            setRawCaptions(result.captions);
          }
        }
      } catch (err) {
        console.error('Error toggling timestamps:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatTime = (seconds: number | string) => {
    const totalSeconds = Number(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCopyTranscript = () => {
    let textToCopy = transcript;

    // If we have parsed segments but no transcript text, build the transcript
    if (!transcript && parsedTranscript.length > 0) {
      textToCopy = parsedTranscript
        .map((segment) => {
          const timestamp = includeTimestamps ? `[${formatTime(segment.start)}] ` : '';
          return `${timestamp}${segment.text}`;
        })
        .join('\n');
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTranscript = () => {
    const videoId = extractYouTubeVideoId(videoUrl) || 'transcript';
    const element = document.createElement('a');
    
    let textToDownload = transcript;
    
    // If we have parsed segments but no transcript text, build the transcript
    if (!transcript && parsedTranscript.length > 0) {
      textToDownload = parsedTranscript
        .map((segment) => {
          const timestamp = includeTimestamps ? `[${formatTime(segment.start)}] ` : '';
          return `${timestamp}${segment.text}`;
        })
        .join('\n');
    }
    
    const file = new Blob([textToDownload], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `youtube-${videoTitle ? videoTitle.replace(/\s+/g, '-').toLowerCase() : videoId}-transcript.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(220, 53, 69); // red color
    const title = videoTitle || `Video Transcript`;
    doc.text(title, 105, 15, { align: 'center' });
    
    // Add video ID
    const videoId = extractYouTubeVideoId(videoUrl) || '';
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100); // gray color
    doc.text(`Video ID: ${videoId}`, 105, 25, { align: 'center' });
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });
    
    doc.setTextColor(0, 0, 0); // Reset to black text
    
    // Format transcript text
    const transcriptText = parsedTranscript.map((segment, index) => {
      const isHighlighted = selectedSegments.has(index);
      return {
        text: segment.text,
        highlighted: isHighlighted
      };
    });
    
    // Add transcript content with proper formatting
    doc.setFontSize(11);
    let yPosition = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const textWidth = pageWidth - (2 * margin);
    
    transcriptText.forEach((item) => {
      // Split text into lines that fit the page width
      const textLines = doc.splitTextToSize(item.text, textWidth);
      
      // Check if we need to add a new page
      if (yPosition + (textLines.length * 7) > 280) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Set text styling based on highlighting
      if (item.highlighted) {
        doc.setTextColor(220, 53, 69); // red for highlighted text
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setTextColor(0, 0, 0); // black for normal text
        doc.setFont('helvetica', 'normal');
      }
      
      // Add the text
      doc.text(textLines, margin, yPosition);
      yPosition += textLines.length * 7 + 3; // Add spacing between segments
    });
    
    // Save the PDF
    const filename = videoTitle 
      ? `transcript-${videoTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
      : `transcript-${videoId}.pdf`;
    doc.save(filename);
  };

  const toggleSegmentSelection = (index: number) => {
    const newSelection = new Set(selectedSegments);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedSegments(newSelection);
  };

  const videoId = extractYouTubeVideoId(videoUrl);
  const isShorts = videoUrl.includes('/shorts/');
  const isSearchResults = videoUrl.includes('youtube.com/results');
  const hasTranscript = transcript || parsedTranscript.length > 0;

  return (
    <div className="bg-gray-900 rounded-lg shadow-md border border-gray-800 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">YouTube Video Transcription</h2>
        
        <div className="flex mb-4 relative">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaYoutube className="text-red-500" />
            </div>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Enter YouTube URL (e.g., https://www.youtube.com/watch?v=... or Shorts URL)"
              className="w-full pl-10 pr-4 py-2 rounded-l border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleTranscribe}
            disabled={isLoading}
            className="px-4 py-2 rounded-r bg-blue-600 hover:bg-blue-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : isSearchResults ? <FaSearch /> : 'Transcribe'}
          </button>
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div 
              ref={searchResultsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10"
            >
              <div className="p-2 border-b border-gray-700 text-sm text-gray-400">
                Select a video to transcribe:
              </div>
              <ul>
                {searchResults.map((result, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white"
                    onClick={() => handleSelectSearchResult(index)}
                  >
                    <div className="flex items-center">
                      <FaYoutube className="text-red-500 mr-2" />
                      {result}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center mb-4">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={includeTimestamps}
                onChange={handleToggleTimestamps}
                disabled={isLoading}
              />
              <div className={`block w-10 h-6 rounded-full ${includeTimestamps ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${includeTimestamps ? 'translate-x-4' : ''}`}></div>
            </div>
            <div className="ml-3 text-gray-300 flex items-center">
              <FaClock className="mr-1" />
              Include timestamps
            </div>
          </label>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 flex items-start">
            <FaExclamationTriangle className="text-red-400 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Main content area - show video and transcript in 2-column layout when we have transcript */}
        {videoId && (
          <div className={`${hasTranscript ? 'md:grid md:grid-cols-2 md:gap-6' : ''}`}>
            {/* Video column - always visible */}
            <div className={`${hasTranscript ? '' : 'mb-4'}`}>
              <div className="aspect-video mb-4">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}${isShorts ? '?loop=1' : ''}`}
                  className="w-full h-full rounded"
                  title="YouTube video"
                  allowFullScreen
                ></iframe>
              </div>
              
              {videoTitle && (
                <h3 className="text-lg font-medium text-gray-200 mb-2">{videoTitle}</h3>
              )}
            </div>

            {/* Transcript column */}
            {hasTranscript && (
              <div className="mt-6 md:mt-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <FaFileAlt className="text-red-500" />
                    Transcript
                  </h3>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleCopyTranscript}
                      className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white"
                    >
                      <FaCopy className="mr-1" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button 
                      onClick={handleDownloadTranscript}
                      className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm text-white"
                    >
                      <FaDownload className="mr-1" />
                      Text
                    </button>
                    <button 
                      onClick={handleDownloadPDF}
                      className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm text-white"
                    >
                      <FaDownload className="mr-1" />
                      PDF
                    </button>
                    {selectedSegments.size > 0 && (
                      <button 
                        onClick={() => setSelectedSegments(new Set())}
                        className="flex items-center px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm text-white"
                      >
                        <FaHighlighter className="mr-1" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-800/50 border border-gray-700 p-2 mb-3 rounded text-sm text-gray-300">
                  Click on text segments to highlight them for PDF export
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded p-4 h-96 overflow-y-auto">
                  {/* If we have parsed transcript segments, display those with highlighting */}
                  {parsedTranscript.length > 0 ? (
                    <div className="space-y-2">
                      {parsedTranscript.map((segment, index) => (
                        <div 
                          key={index}
                          onClick={() => toggleSegmentSelection(index)}
                          className={`p-2 rounded cursor-pointer ${
                            selectedSegments.has(index) 
                              ? 'bg-red-900/30 border border-red-700' 
                              : 'hover:bg-gray-700/50'
                          }`}
                        >
                          {includeTimestamps && (
                            <span className="text-sm text-gray-400 mr-2">
                              [{formatTime(segment.start)}]
                            </span>
                          )}
                          <span className={`${selectedSegments.has(index) ? 'text-red-400 font-medium' : 'text-gray-300'}`}>
                            {segment.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre className="text-gray-300 whitespace-pre-wrap font-sans">{transcript}</pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionTool; 