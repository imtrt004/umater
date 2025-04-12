/**
 * Interface for marker data from YouTube
 */
interface Marker {
  startMillis: string | number;
  durationMillis: string | number;
  intensityScoreNormalized: number;
}

/**
 * Interface for heat map data from YouTube
 */
interface HeatMapData {
  markers?: Marker[];
  markerType?: string;
}

/**
 * Interface for replayed part
 */
interface ReplayedPart {
  position: number;
  start: number;
  end: number;
}

/**
 * Get top replayed parts from heat map data
 * @param data Heat map data
 * @param parts Number of parts to return
 * @returns Array of replayed parts sorted by intensity
 */
export function getTopReplayedParts(
  data: HeatMapData | null, 
  parts: number = 1
): ReplayedPart[] {
  if (!data || !data.markers) {
    return [];
  }

  // Sort the markers by intensityScoreNormalized in descending order
  const sortedMarkers = data.markers.sort(
    (a, b) => b.intensityScoreNormalized - a.intensityScoreNormalized
  );

  // Take the top 'parts' markers
  const topMarkers = sortedMarkers.slice(0, parts);

  // Format the output
  return topMarkers.map((marker, index) => ({
    position: index + 1,
    start: Math.round(Number(marker.startMillis) / 1000),
    end: Math.round(
      (Number(marker.startMillis) + Number(marker.durationMillis)) / 1000
    ),
  }));
} 