import axios from 'axios';
import { YouTubeVideoResponse } from '../types/youtube';
import { 
  YOUTUBE_API_KEY, 
  YOUTUBE_API_BASE_URL, 
  DEFAULT_REGION_CODE, 
  MAX_RESULTS 
} from '../config/api';
import { KeywordMetrics, KeywordCategory, KeywordIntent } from '../types/keywords';

/**
 * Fetches popular videos from YouTube API
 */
export async function fetchPopularVideos(
  regionCode = DEFAULT_REGION_CODE, 
  maxResults = MAX_RESULTS
): Promise<YouTubeVideoResponse> {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet',
        chart: 'mostPopular',
        regionCode,
        maxResults,
        fields: 'items(id,snippet(publishedAt,title,description,thumbnails,tags,channelTitle))'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular videos:', error);
    throw error;
  }
}

/**
 * Fetches specific video details with statistics
 */
export async function fetchVideoDetails(videoId: string): Promise<YouTubeVideoResponse> {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet,statistics',
        id: videoId,
        fields: 'items(id,snippet(publishedAt,title,description,thumbnails,tags,channelTitle),statistics(viewCount,likeCount,dislikeCount,commentCount))'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
}

/**
 * Fetches trending videos for a specific country
 */
export async function fetchTrendingVideosByCountry(
  regionCode: string,
  maxResults = MAX_RESULTS
): Promise<YouTubeVideoResponse> {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet,statistics',
        chart: 'mostPopular',
        regionCode,
        maxResults,
        fields: 'items(id,snippet(publishedAt,title,description,thumbnails,tags,channelTitle),statistics(viewCount,likeCount,commentCount))'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    throw error;
  }
}

/**
 * Fetches videos related to specific keywords to analyze competition
 */
export async function fetchKeywordAnalytics(keyword: string, maxResults = 10): Promise<any> {
  try {
    // Step 1: Search for videos with the keyword
    const searchResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet',
        q: keyword,
        type: 'video',
        maxResults,
        fields: 'items(id(videoId),snippet(title,channelTitle,publishedAt))'
      }
    });
    
    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return { keyword, videos: [], analytics: {} };
    }
    
    // Step 2: Get detailed statistics for those videos
    const videoIds = searchResponse.data.items.map((item: any) => item.id.videoId).join(',');
    
    const detailsResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet,statistics',
        id: videoIds,
        fields: 'items(id,snippet(title,channelTitle,publishedAt),statistics(viewCount,likeCount,commentCount))'
      }
    });
    
    // Step 3: Calculate analytics
    const videos = detailsResponse.data.items || [];
    
    // Calculate average views, likes, etc.
    const totalViews = videos.reduce((sum: number, video: any) => 
      sum + parseInt(video.statistics.viewCount || '0'), 0);
    
    const totalLikes = videos.reduce((sum: number, video: any) => 
      sum + parseInt(video.statistics.likeCount || '0'), 0);
    
    const totalComments = videos.reduce((sum: number, video: any) => 
      sum + parseInt(video.statistics.commentCount || '0'), 0);
    
    // Calculate estimated CPM (this is an approximation)
    // CPM varies by country, niche, etc. This is just a rough estimate
    const estimatedCpm = totalViews > 0 ? ((totalViews / 1000) * 2) : 0; // $2 per 1000 views is a rough estimate
    
    // Competition score (1-10) - higher number means more competition
    const competitionScore = videos.length > 0 ? Math.min(Math.ceil(videos.length / 2), 10) : 0;
    
    // Potential score (1-10) - higher number means more potential
    const potentialScore = totalViews > 0 
      ? Math.min(Math.ceil(Math.log10(totalViews / videos.length)), 10) 
      : 0;
    
    const analytics = {
      keyword,
      videoCount: videos.length,
      averageViews: videos.length > 0 ? Math.floor(totalViews / videos.length) : 0,
      averageLikes: videos.length > 0 ? Math.floor(totalLikes / videos.length) : 0,
      averageComments: videos.length > 0 ? Math.floor(totalComments / videos.length) : 0,
      estimatedCpm: estimatedCpm.toFixed(2),
      competitionScore,
      potentialScore
    };
    
    return { keyword, videos, analytics };
  } catch (error) {
    console.error(`Error analyzing keyword "${keyword}":`, error);
    throw error;
  }
}

/**
 * Fetches video transcriptions
 * Note: This uses an external service since YouTube API doesn't directly provide transcripts
 */
export async function fetchVideoTranscript(videoId: string): Promise<any> {
  try {
    // For demonstration purposes, we're using a mock transcript
    // In a real application, you would use a third-party service like YouTube Transcript API
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Length of simulation transcript (number of entries)
    const transcriptLength = 50 + Math.floor(Math.random() * 100);
    
    // Generate mock transcript data
    const transcriptData = [];
    let currentTime = 0;
    
    const phrases = [
      "Welcome to this video",
      "Today we're going to talk about",
      "One important thing to note",
      "As you can see in this example",
      "Let me show you how this works",
      "This is a critical concept to understand",
      "Many people often ask about",
      "The key takeaway here is",
      "It's worth mentioning that",
      "Now let's move on to the next point",
      "If you look at the data",
      "Research shows that",
      "Industry experts agree that",
      "I've found that the best approach is",
      "Let's analyze this in more detail",
      "This brings us to an important question",
      "The implications of this are significant",
      "To summarize what we've covered",
      "Thank you for watching this video",
      "Don't forget to subscribe for more content"
    ];
    
    for (let i = 0; i < transcriptLength; i++) {
      const duration = 3 + Math.random() * 8; // Between 3 and 11 seconds
      const text = phrases[Math.floor(Math.random() * phrases.length)];
      
      transcriptData.push({
        start: currentTime,
        duration: duration,
        text: text + (Math.random() > 0.7 ? " about " + videoId.substring(0, 5) : "")
      });
      
      currentTime += duration;
    }
    
    return {
      id: videoId,
      transcript: transcriptData
    };
  } catch (error) {
    console.error('Error fetching video transcript:', error);
    throw error;
  }
}

/**
 * Fetches detailed keyword competitive analysis
 */
export async function fetchKeywordCompetitiveAnalysis(keyword: string): Promise<any> {
  try {
    // This would normally hit a specialized API for deeper keyword analytics
    // For demo purposes, we'll generate mock data based on the keyword
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Use the keyword's length to seed some "randomness" that's consistent for the same keyword
    const seed = keyword.length + keyword.charCodeAt(0) + (keyword.charCodeAt(keyword.length - 1) || 0);
    
    // Monthly search volume (higher for shorter, more common keywords)
    const searchVolume = Math.floor(10000 / (keyword.length + 1)) * (100 + (seed % 100));
    
    // Competition metrics (0-1 scale)
    const competition = Math.min(0.1 + (seed % 10) / 30 + (keyword.length < 10 ? 0.4 : 0), 1);
    
    // CPC (Cost Per Click) - in dollars
    const cpc = (0.5 + (seed % 20) / 10).toFixed(2);
    
    // Traffic potential
    const trafficPotential = Math.floor(searchVolume * (1 - competition / 2));
    
    // Historical trends (12 months of data)
    const monthlyTrends = Array.from({ length: 12 }, (_, month) => {
      // Create seasonal variation
      const seasonalFactor = 1 + 0.3 * Math.sin((month / 12) * Math.PI * 2);
      // Add some randomness
      const randomFactor = 0.8 + (((seed + month) % 10) / 20);
      // Calculate the value for this month
      return Math.floor(searchVolume * seasonalFactor * randomFactor);
    });
    
    // Related keywords
    const relatedKeywords = [
      { keyword: `best ${keyword}`, volume: Math.floor(searchVolume * 0.7) },
      { keyword: `${keyword} tutorial`, volume: Math.floor(searchVolume * 0.5) },
      { keyword: `${keyword} guide`, volume: Math.floor(searchVolume * 0.4) },
      { keyword: `how to ${keyword}`, volume: Math.floor(searchVolume * 0.6) },
      { keyword: `${keyword} tips`, volume: Math.floor(searchVolume * 0.3) }
    ];
    
    // Growth rate (percentage)
    const growthRate = (seed % 20) - 5; // Between -5% and 15%
    
    return {
      keyword,
      searchVolume,
      competition,
      competitionScore: Math.ceil(competition * 10),
      cpc,
      trafficPotential,
      monthlyTrends,
      relatedKeywords,
      growthRate,
      difficultyScore: Math.ceil((competition * 0.7 + (keyword.length / 20) * 0.3) * 10)
    };
  } catch (error) {
    console.error(`Error analyzing keyword competitiveness for "${keyword}":`, error);
    throw error;
  }
}

/**
 * Fetches YouTube search suggestions for a given query
 */
export async function fetchYouTubeSearchSuggestions(query: string): Promise<string[]> {
  // In a production environment, this would be an actual API call
  // For this demo, we'll simulate the response with mock data
  
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate suggestions based on the query
  const baseQuery = query.toLowerCase().trim();
  
  const mockSuggestions = [
    `${baseQuery} tutorial`,
    `${baseQuery} for beginners`,
    `${baseQuery} advanced techniques`,
    `${baseQuery} tips and tricks`,
    `${baseQuery} vs alternatives`,
    `best ${baseQuery}`,
    `${baseQuery} review`,
    `how to use ${baseQuery}`,
    `${baseQuery} 2023`,
    `${baseQuery} examples`,
    `${baseQuery} software`,
    `${baseQuery} for professionals`,
    `${baseQuery} free download`,
    `${baseQuery} course`,
    `${baseQuery} certification`
  ];
  
  // Filter to remove duplicates and empty strings
  return mockSuggestions
    .filter(s => s.trim() !== '')
    .filter((s, i, arr) => arr.indexOf(s) === i);
}

/**
 * Analyzes keyword metrics for a given set of keywords
 */
export async function analyzeKeywordMetrics(keywords: string[]): Promise<KeywordMetrics[]> {
  // In a production environment, this would use a real SEO API
  // For this demo, we'll generate mock metrics
  
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  return keywords.map(keyword => {
    // Generate random but plausible metrics
    const searchVolume = Math.floor(Math.random() * 10000) + 500;
    const competition = parseFloat((Math.random() * 0.9 + 0.1).toFixed(2));
    const cpc = parseFloat((Math.random() * 2 + 0.5).toFixed(2));
    
    // Assign random categories and intents
    const categories: KeywordCategory[] = [
      'General', 'Software & Apps', 'Educational', 'Comparison', 'Shopping'
    ];
    
    const intents: KeywordIntent[] = [
      'Informational', 'Commercial', 'Transactional', 'Navigational'
    ];
    
    // Determine category based on keyword content
    let category: KeywordCategory = 'General';
    if (keyword.includes('software') || keyword.includes('app')) {
      category = 'Software & Apps';
    } else if (keyword.includes('tutorial') || keyword.includes('course') || keyword.includes('learn')) {
      category = 'Educational';
    } else if (keyword.includes('vs') || keyword.includes('comparison') || keyword.includes('alternative')) {
      category = 'Comparison';
    } else if (keyword.includes('buy') || keyword.includes('price') || keyword.includes('cost')) {
      category = 'Shopping';
    }
    
    // Determine intent based on keyword content
    let intent: KeywordIntent = 'Informational';
    if (keyword.includes('buy') || keyword.includes('purchase')) {
      intent = 'Transactional';
    } else if (keyword.includes('best') || keyword.includes('top') || keyword.includes('review')) {
      intent = 'Commercial';
    } else if (keyword.includes('login') || keyword.includes('sign in') || keyword.includes('website')) {
      intent = 'Navigational';
    }
    
    return {
      keyword,
      searchVolume,
      competition,
      cpc,
      category,
      intent,
      difficulty: Math.floor(competition * 100),
    };
  });
}

// Helper function to determine keyword category
function determineCategory(keyword: string): string {
  const keyword_lower = keyword.toLowerCase();
  
  if (keyword_lower.includes('app') || keyword_lower.includes('software') || keyword_lower.includes('tool')) {
    return 'Software & Apps';
  } else if (keyword_lower.includes('how to') || keyword_lower.includes('guide') || keyword_lower.includes('tutorial')) {
    return 'Educational';
  } else if (keyword_lower.includes('best') || keyword_lower.includes('top') || keyword_lower.includes('review')) {
    return 'Product Comparison';
  } else if (keyword_lower.includes('buy') || keyword_lower.includes('price') || keyword_lower.includes('cost')) {
    return 'Shopping';
  } else if (keyword_lower.includes('vs') || keyword_lower.includes('versus') || keyword_lower.includes('comparison')) {
    return 'Comparison';
  } else {
    return 'General';
  }
}

// Helper function to determine search intent
function determineIntent(keyword: string): string {
  const keyword_lower = keyword.toLowerCase();
  
  if (keyword_lower.includes('how') || keyword_lower.includes('guide') || keyword_lower.includes('tutorial')) {
    return 'Informational';
  } else if (keyword_lower.includes('buy') || keyword_lower.includes('download') || keyword_lower.includes('get')) {
    return 'Transactional';
  } else if (keyword_lower.includes('best') || keyword_lower.includes('top') || keyword_lower.includes('vs')) {
    return 'Commercial';
  } else {
    return 'Navigational';
  }
}

/**
 * Fetches real YouTube search suggestions from YouTube's suggestion API
 */
export async function fetchRealYouTubeSuggestions(query: string): Promise<string[]> {
  try {
    const response = await axios.get(`https://suggestqueries.google.com/complete/search`, {
      params: {
        client: 'youtube',
        ds: 'yt',
        q: query,
        hl: 'en'
      },
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // Response is in the format [query, [suggestions]]
    if (response.data && Array.isArray(response.data) && response.data.length > 1) {
      return response.data[1] as string[];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching YouTube suggestions:', error);
    // Fallback to mock suggestions if the API call fails
    return fetchYouTubeSearchSuggestions(query);
  }
}

/**
 * Converts YouTube search suggestions to keyword metrics
 */
export async function suggestionsToKeywordMetrics(suggestions: string[]): Promise<KeywordMetrics[]> {
  // Filter out duplicates and empty strings
  const uniqueSuggestions = [...new Set(suggestions.filter(s => s.trim() !== ''))];
  
  return uniqueSuggestions.map(keyword => {
    // Generate relevant metrics based on keyword properties
    const wordCount = keyword.split(' ').length;
    
    // More specific (longer) keywords generally have lower search volume but are less competitive
    const searchVolume = Math.floor(10000 / Math.pow(wordCount, 1.2)) + 100;
    const competition = parseFloat((0.9 - (wordCount * 0.05)).toFixed(2));
    const cpc = parseFloat((Math.random() * 2 + 0.5).toFixed(2));
    
    // Calculate metrics
    const competitionScore = Math.ceil(competition * 10);
    const difficulty = Math.floor(competition * 100);
    const monthlyClicks = Math.floor(searchVolume * 0.3);
    const opportunityScore = Math.floor((searchVolume / 100) * (1 - competition) * 10);
    
    // Determine growth trend (-10 to +10)
    const growthTrend = Math.floor(Math.random() * 20) - 10;
    
    // Use helper functions to determine category and intent
    const category = determineCategory(keyword) as KeywordCategory;
    const intent = determineIntent(keyword) as KeywordIntent;
    
    return {
      keyword,
      searchVolume,
      competition,
      cpc,
      category,
      intent,
      difficulty,
      competitionScore,
      monthlyClicks,
      opportunityScore,
      growthTrend,
      wordCount
    };
  });
}

/**
 * Fetches YouTube most replayed data using the yt_most_replayed package
 * @param videoId YouTube video ID
 * @returns Processed heatmap data
 */
export async function fetchYoutubeMostReplayed(videoId: string) {
  try {
    // Call our internal API endpoint that uses yt_most_replayed
    const response = await fetch('/api/youtube-most-replayed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoId }),
    });

    // Even if response is not ok, read the JSON for error details
    const result = await response.json();

    if (!response.ok) {
      console.warn(`Error response from most-replayed API: ${response.status}`, result);
      return {
        found: false,
        message: result.message || `Error fetching most replayed data: ${response.statusText}`,
        data: [],
        rawData: []
      };
    }
    
    // Validate the structure of the result to ensure it's what we expect
    if (!result || typeof result !== 'object') {
      return {
        found: false,
        message: 'Invalid response from most-replayed API',
        data: [],
        rawData: []
      };
    }
    
    // Return the result directly - our API already formats it properly
    return result;
  } catch (error) {
    console.error('Error in fetchYoutubeMostReplayed:', error);
    return {
      found: false,
      message: error instanceof Error ? error.message : 'Unknown error in fetchYoutubeMostReplayed',
      data: [],
      rawData: []
    };
  }
} 