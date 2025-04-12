export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeThumbnails {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
}

export interface YouTubeVideoSnippet {
  publishedAt: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  tags?: string[];
  channelTitle: string;
}

export interface YouTubeVideoStatistics {
  viewCount: string;
  likeCount: string;
  dislikeCount?: string;
  commentCount: string;
}

export interface YouTubeVideoItem {
  id: string;
  snippet: YouTubeVideoSnippet;
  statistics?: YouTubeVideoStatistics;
}

export interface YouTubeVideoResponse {
  items: YouTubeVideoItem[];
} 