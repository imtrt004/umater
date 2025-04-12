/**
 * Extracts the YouTube video ID from a YouTube URL
 * Supports various YouTube URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  // Regular expressions for different YouTube URL formats
  const regexPatterns = [
    // YouTube Shorts format - youtube.com/shorts/VIDEO_ID
    /youtube\.com\/shorts\/([^#&?]*)/,
    // Standard youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^#&?]*)/,
    // youtu.be/VIDEO_ID
    /youtu\.be\/([^#&?]*)/,
    // youtube.com/embed/VIDEO_ID
    /youtube\.com\/embed\/([^#&?]*)/,
    // youtube.com/v/VIDEO_ID
    /youtube\.com\/v\/([^#&?]*)/
  ];

  for (const pattern of regexPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
} 