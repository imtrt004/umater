/**
 * YouTube Video Transcription Service
 * Uses the Tactiq API to transcribe YouTube videos
 */

interface CaptionItem {
  start: string;
  dur: string;
  text: string;
}

interface TranscriptionData {
  title?: string;
  captions?: CaptionItem[];
  transcript?: string;
  text?: string;
  error?: string;
}

interface TranscriptionResponse {
  success: boolean;
  title?: string;
  transcript?: string;
  captions?: CaptionItem[];
  error?: string;
}

/**
 * Formats seconds into a readable timestamp (MM:SS)
 */
const formatTimestamp = (seconds: string | number): string => {
  const totalSeconds = Number(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = Math.floor(totalSeconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formats captions into a readable transcript with timestamps
 */
const formatCaptionsWithTimestamps = (captions: CaptionItem[]): string => {
  return captions.map(caption => 
    `[${formatTimestamp(caption.start)}] ${caption.text}`
  ).join('\n');
};

/**
 * Formats captions into a plain text transcript without timestamps
 */
const formatCaptionsPlainText = (captions: CaptionItem[]): string => {
  return captions.map(caption => caption.text).join(' ');
};

/**
 * Normalizes a YouTube URL to ensure it works with the API
 * @param url - The original YouTube URL
 */
const normalizeYouTubeUrl = (url: string): string => {
  const videoId = extractYouTubeVideoId(url);
  
  if (!videoId) {
    console.error('Could not extract video ID from URL:', url);
    return url; // Return original if we can't extract ID
  }

  // Check if it's a search results URL
  if (url.includes('youtube.com/results')) {
    // Extract a video from search (this would require a different approach)
    return url;
  }
  
  // Convert shorts to normal video format for API compatibility
  if (url.includes('youtube.com/shorts/')) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
  
  // Ensure URL is in the standard format the API expects
  return `https://www.youtube.com/watch?v=${videoId}`;
};

/**
 * Transcribes a YouTube video using the Tactiq API through our server-side proxy
 * @param videoUrl - Full YouTube video URL
 * @param langCode - Language code (default: 'en')
 * @param includeTimestamps - Whether to include timestamps in the transcript (default: true)
 */
export const transcribeYouTubeVideo = async (
  videoUrl: string,
  langCode: string = 'en',
  includeTimestamps: boolean = true
): Promise<TranscriptionResponse> => {
  try {
    // Normalize the URL to ensure API compatibility
    const normalizedUrl = normalizeYouTubeUrl(videoUrl);
    
    console.log('Transcribing URL:', normalizedUrl);
    
    // Call our server-side proxy endpoint instead of directly calling the API
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrl: normalizedUrl,
        langCode
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data: TranscriptionData = await response.json();
    
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    // Check for API error response
    if (data.error) {
      return {
        success: false,
        error: data.error
      };
    }
    
    // Handle structured captions format
    if (data.captions && data.captions.length > 0) {
      return {
        success: true,
        title: data.title,
        captions: data.captions,
        transcript: includeTimestamps 
          ? formatCaptionsWithTimestamps(data.captions)
          : formatCaptionsPlainText(data.captions)
      };
    }
    
    // Handle plain text format
    if (data.transcript || data.text) {
      return {
        success: true,
        title: data.title,
        transcript: data.transcript || data.text || ''
      };
    }
    
    // If we got here, something unexpected happened
    return {
      success: false,
      error: 'No transcript or captions found in the API response'
    };
  } catch (error) {
    console.error('Transcription error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Extracts video ID from a YouTube URL
 * @param url - YouTube URL
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  // Handle YouTube Shorts URLs
  if (url.includes('youtube.com/shorts/')) {
    const shortsMatch = url.match(/youtube\.com\/shorts\/([^/?&]+)/);
    if (shortsMatch && shortsMatch[1]) return shortsMatch[1];
  }
  
  // Handle youtu.be format
  if (url.includes('youtu.be/')) {
    const youtubeMatch = url.match(/youtu\.be\/([^/?&]+)/);
    if (youtubeMatch && youtubeMatch[1]) return youtubeMatch[1];
  }
  
  // Handle regular YouTube URLs
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7] && match[7].length === 11) ? match[7] : null;
};

/**
 * Validates if a URL is a valid YouTube URL
 * @param url - URL to validate
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  // If it's a YouTube URL of any kind (including search results)
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    // If it's a search results URL, allow it but will be handled differently
    if (url.includes('youtube.com/results')) {
      return true;
    }
    
    // Otherwise check if we can extract a video ID
    const videoId = extractYouTubeVideoId(url);
    return videoId !== null;
  }
  
  return false;
}; 