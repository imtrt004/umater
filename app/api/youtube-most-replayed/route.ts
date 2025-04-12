import { NextResponse } from 'next/server';
import { getMostReplayedParts } from '../../services/yt_most_replayed/index';

// Define types to match the returned data format
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
    
    try {
      console.log(`Fetching most replayed data for video ID: ${videoId}`);
      const response = await getMostReplayedParts(videoId, 150) as MostReplayedResponse;
      
      // Log what we got to help with debugging
      console.log('getMostReplayedParts response type:', typeof response);
      console.log(`Found ${response.replayedParts?.length || 0} replayed parts`);
      
      // Validate the response format
      if (!response || !response.replayedParts || !Array.isArray(response.replayedParts) || response.replayedParts.length === 0) {
        console.log('No replay data or invalid format returned:', response);
        return NextResponse.json({
          found: false,
          message: 'No most replayed data found for this video',
          data: [],
          rawData: []
        });
      }
      
      // Process the data into the format our app expects
      const rawData = response.replayedParts.map((part: ReplayedPart) => {
        // Calculate video length if not provided (use the highest end time)
        const videoLength = response.videoLength || 
          Math.max(...response.replayedParts.map((p: ReplayedPart) => p.end));
          
        // Calculate intensity based on position (1 is highest, 150 is lowest)
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
      
      // Generate heatmap points for visualization
      const heatmapPoints = generateHeatmapPoints(timelineData, response.videoLength || 0);
      
      return NextResponse.json({
        found: true,
        message: 'Successfully retrieved most replayed parts',
        data: heatmapPoints,
        rawData: rawData,
        videoLength: response.videoLength
      });
    } catch (extractionError) {
      console.error('Error with most replayed extraction:', extractionError);
      return NextResponse.json({
        found: false,
        message: 'Error with most replayed data extraction',
        error: extractionError instanceof Error ? extractionError.message : 'Unknown extraction error',
        data: [],
        rawData: []
      });
    }
  } catch (error) {
    console.error('Error fetching most replayed data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch most replayed data',
        message: error instanceof Error ? error.message : 'Unknown error',
        found: false,
        data: [],
        rawData: []
      },
      { status: 500 }
    );
  }
} 

/**
 * Generate heatmap points for visualization based on the most replayed parts
 * This creates a more continuous and visually appealing heatmap
 */
function generateHeatmapPoints(
  timelineData: any[], 
  videoLength: number
): Array<{time: number; value: number; duration: number}> {
  if (!timelineData.length || !videoLength) {
    return [];
  }
  
  // First, generate basic points from the most replayed parts
  const basicPoints = timelineData.map(part => ({
    time: part.startTimeSeconds,
    value: part.intensity * 100, // Scale to 0-100 range
    duration: part.durationSeconds
  }));
  
  // For a more continuous visualization, add interpolated points
  const interpolatedPoints: Array<{time: number; value: number; duration: number}> = [];
  
  // Add points at the beginning and end of the video
  if (timelineData[0]?.startTimeSeconds > 10) {
    interpolatedPoints.push({
      time: 0,
      value: 10, // Low baseline value
      duration: 5
    });
  }
  
  // Add interpolated points between segments to create a smoother curve
  for (let i = 0; i < timelineData.length; i++) {
    const current = timelineData[i];
    interpolatedPoints.push({
      time: current.startTimeSeconds,
      value: current.intensity * 100,
      duration: current.durationSeconds
    });
    
    // Add point at the end of this segment
    interpolatedPoints.push({
      time: current.endTimeSeconds,
      value: current.intensity * 80, // Slightly lower at the end of the segment
      duration: 2
    });
    
    // If there's another segment and there's a gap, add a low point in between
    if (i < timelineData.length - 1) {
      const next = timelineData[i + 1];
      if (next.startTimeSeconds - current.endTimeSeconds > 20) {
        interpolatedPoints.push({
          time: current.endTimeSeconds + (next.startTimeSeconds - current.endTimeSeconds) / 2,
          value: 15, // Low value for non-replayed sections
          duration: 5
        });
      }
    }
  }
  
  // Add a point at the end of the video if needed
  const lastPoint = timelineData[timelineData.length - 1];
  if (lastPoint && videoLength - lastPoint.endTimeSeconds > 10) {
    interpolatedPoints.push({
      time: videoLength - 5,
      value: 10, // Low baseline value
      duration: 5
    });
  }
  
  // Combine both sets of points and sort by time
  return [...basicPoints, ...interpolatedPoints]
    .sort((a, b) => a.time - b.time);
} 