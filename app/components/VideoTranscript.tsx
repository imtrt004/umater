'use client';

import { useState, useEffect } from 'react';
import { FaDownload, FaCopy, FaSpinner, FaHighlighter, FaFileAlt } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { transcribeYouTubeVideo } from '../services/transcription';

interface VideoTranscriptProps {
  videoId: string;
}

interface TranscriptSegment {
  start: string | number;
  duration?: string | number;
  text: string;
}

export default function VideoTranscript({ videoId }: VideoTranscriptProps) {
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState<Set<number>>(new Set());
  const [videoTitle, setVideoTitle] = useState<string>('');

  useEffect(() => {
    if (!videoId) return;
    
    const fetchTranscript = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use our transcription service
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const response = await transcribeYouTubeVideo(videoUrl, 'en', true);
        
        if (response.success && (response.captions || response.transcript)) {
          // If we got structured captions
          if (response.captions && response.captions.length > 0) {
            setTranscript(response.captions.map(caption => ({
              start: caption.start,
              duration: caption.dur,
              text: caption.text
            })));
          } 
          // If we got plain text transcript
          else if (response.transcript) {
            // Split by lines if it's already formatted with timestamps
            const lines = response.transcript.split('\n');
            if (lines.length > 1) {
              const parsedTranscript = lines.map((line, index) => {
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
              setTranscript(parsedTranscript);
            } else {
              // If it's just one big text, split into sentences
              const sentences = response.transcript
                .replace(/\.\s+/g, '.|')
                .replace(/\?\s+/g, '?|')
                .replace(/!\s+/g, '!|')
                .split('|')
                .filter(s => s.trim().length > 0);
              
              setTranscript(sentences.map((text, index) => ({
                start: index * 5, // approximate timestamp
                text: text.trim()
              })));
            }
          }
          
          if (response.title) {
            setVideoTitle(response.title);
          }
        } else {
          setError(response.error || 'No transcript available for this video.');
        }
      } catch (err) {
        console.error('Error fetching transcript:', err);
        setError('Failed to load transcript. This feature may not be available for all videos.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTranscript();
  }, [videoId]);

  const formatTime = (seconds: number | string) => {
    const totalSeconds = Number(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCopyTranscript = () => {
    const textToCopy = transcript
      .map((segment, index) => {
        const timestamp = showTimestamps ? `[${formatTime(segment.start)}] ` : '';
        return `${timestamp}${segment.text}`;
      })
      .join('\n');
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(220, 53, 69); // red color
    const title = videoTitle || `Video Transcript`;
    doc.text(title, 105, 15, { align: 'center' });
    
    // Add video ID as subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100); // gray color
    doc.text(`Video ID: ${videoId}`, 105, 25, { align: 'center' });
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });
    
    doc.setTextColor(0, 0, 0); // Reset to black text
    
    // Format transcript text
    const transcriptText = transcript.map((segment, index) => {
      const isHighlighted = selectedSegments.has(index);
      let text = segment.text;
      
      // Define whether this segment should be highlighted in the PDF
      return {
        text: text,
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

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-4xl mx-auto">
        <div className="flex justify-center items-center p-12">
          <div className="animate-pulse flex flex-col items-center">
            <FaSpinner className="w-10 h-10 text-red-500 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading transcript...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-800 dark:text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FaFileAlt className="text-red-500" />
          {videoTitle ? (
            <span>Video Transcript: {videoTitle}</span>
          ) : (
            <span>Video Transcript</span>
          )}
        </h2>
        
        <div className="flex gap-3">
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showTimestamps}
                onChange={() => setShowTimestamps(!showTimestamps)}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Show Timestamps</span>
            </label>
          </div>
          
          <button
            onClick={handleCopyTranscript}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Copy transcript to clipboard"
          >
            <FaCopy />
            Copy
            {copySuccess && (
              <span className="text-xs bg-green-600 px-2 py-0.5 rounded ml-1">{copySuccess}</span>
            )}
          </button>
          
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            title="Download transcript as PDF"
          >
            <FaDownload />
            Download PDF
          </button>
          
          <button
            onClick={() => setSelectedSegments(new Set())}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Clear highlights"
            disabled={selectedSegments.size === 0}
          >
            <FaHighlighter />
            Clear Highlights
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Click on any transcript segment to highlight it. Highlighted segments will be emphasized in the downloaded PDF.
        </p>
      </div>
      
      <div className="max-h-96 overflow-y-auto rounded-lg bg-gray-50 dark:bg-gray-700/30 p-6">
        {transcript.length > 0 ? (
          <div className="space-y-4">
            {transcript.map((segment, index) => (
              <div 
                key={index}
                onClick={() => toggleSegmentSelection(index)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedSegments.has(index) 
                    ? 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                {showTimestamps && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                    [{formatTime(segment.start)}]
                  </span>
                )}
                <span className={`${selectedSegments.has(index) ? 'font-semibold text-red-800 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                  {segment.text}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 p-6">
            No transcript available for this video.
          </p>
        )}
      </div>
    </div>
  );
} 