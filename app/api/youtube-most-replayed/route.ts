import { NextResponse } from 'next/server';
const { getMostReplayedParts } = require('yt_most_replayed');

// Define types to match the returned data format from yt_most_replayed
interface ReplayedPart {
  position: number;
  start: number;
  end: number;
}

interface MostReplayedResponse {
  replayedParts: ReplayedPart[];
  videoLength: number | null;
}

/**
 * API route handler to fetch YouTube most replayed sections
 */
export async function POST(request: Request) {
  try {
    const { videoId } = await request.json();
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch the most replayed parts data - we'll get 150 parts for detailed analysis
    try {
      console.log(`Fetching most replayed data for video ID: ${videoId}`);
      const response = await getMostReplayedParts(videoId, 150) as MostReplayedResponse;
      
      // Log what we got to help with debugging
      console.log('getMostReplayedParts response type:', typeof response);
      
      // Validate the response format
      if (!response || !response.replayedParts || !Array.isArray(response.replayedParts) || response.replayedParts.length === 0) {
        console.log('No replay data or invalid format returned:', response);
        return NextResponse.json({
          found: false,
          message: 'No most replayed data found for this video',
          data: []
        });
      }
      
      // Process the data into the format our app expects
      const rawData = response.replayedParts.map((part: ReplayedPart) => {
        // Calculate video length if not provided (use the highest end time)
        const videoLength = response.videoLength || 
          Math.max(...response.replayedParts.map((p: ReplayedPart) => p.end));
          
        // Calculate intensity based on position (1 is highest, 100 is lowest)
        // Convert to 0-1 range where 1 is highest intensity
        const maxPosition = response.replayedParts.length;
        const intensity = Math.max(0, 1 - ((part.position - 1) / maxPosition));
        
        // Format timestamp for display
        const formatTimeStamp = (seconds: number): string => {
          const minutes = Math.floor(seconds / 60);
          const secs = Math.floor(seconds % 60);
          return `${minutes}:${secs.toString().padStart(2, '0')}`;
        };
        
        return {
          position: part.position,
          startTimeSeconds: part.start,
          endTimeSeconds: part.end,
          durationSeconds: part.end - part.start,
          startTimeFormatted: formatTimeStamp(part.start),
          endTimeFormatted: formatTimeStamp(part.end),
          intensity: intensity,
          videoLengthSeconds: videoLength
        };
      });
      
      // Sort data by start time for timeline display
      const timelineData = [...rawData].sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
      
      // Create heatmap points for visualization
      const heatmapPoints = timelineData.map(part => ({
        time: part.startTimeSeconds,
        value: part.intensity * 100, // Scale to 0-100 range
        duration: part.durationSeconds
      }));
      
      return NextResponse.json({
        found: true,
        message: 'Successfully retrieved most replayed parts',
        data: heatmapPoints,
        rawData: rawData
      });
    } catch (packageError) {
      console.error('Error with yt_most_replayed package:', packageError);
      return NextResponse.json({
        found: false,
        message: 'Error with most replayed data extraction',
        error: packageError instanceof Error ? packageError.message : 'Unknown package error',
        data: []
      });
    }
  } catch (error) {
    console.error('Error fetching most replayed data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch most replayed data',
        message: error instanceof Error ? error.message : 'Unknown error',
        found: false,
        data: []
      },
      { status: 500 }
    );
  }
} 