import { Page } from 'puppeteer';
import { extractPointsFromPath } from './svgPathAnalysis';
import { processSVG } from './svg_processing';

/**
 * Interface for normalized segment data
 */
interface NormalizedSegment {
  startMillis: number;
  durationMillis: number;
  intensityScoreNormalized: number;
}

/**
 * Interface for heatmap data response
 */
interface HeatMapData {
  markerType: string;
  markers: NormalizedSegment[];
}

/**
 * Extract heatmap data from YouTube SVG
 * @param page Puppeteer Page object
 * @param videoId YouTube video ID
 * @param retryCount Current retry count
 * @param maxRetries Maximum number of retries
 * @returns Object with heat map data and video length, or null if not found
 */
export async function extractYoutubeSvgHeatmap(
  page: Page,
  videoId: string,
  retryCount: number = 0,
  maxRetries: number = 3
): Promise<{ 
  heatMapData: HeatMapData;
  videoLength: number;
} | null> {
  try {
    await page.waitForSelector(".ytp-heat-map-svg", { timeout: 5000 });
    await page.waitForSelector(".ytp-progress-bar", { timeout: 5000 });

    const videoLength = await page.evaluate(() => {
      const progressBar = document.querySelector(".ytp-progress-bar");
      return progressBar ? progressBar.getAttribute("aria-valuemax") || "0" : "0";
    });

    const heatMapContainers = await page.$$(".ytp-heat-map-svg");
    if (heatMapContainers.length > 0) {
      let combinedHeatMapSVG = "";

      for (const container of heatMapContainers) {
        const heatMapSVG = await page.evaluate((el) => el.outerHTML, container);
        combinedHeatMapSVG += heatMapSVG;
      }

      return {
        heatMapData: processHeatMapData(combinedHeatMapSVG, parseInt(videoLength, 10)),
        videoLength: parseInt(videoLength, 10)
      };
    } else {
      console.log("No heat map container found for video:", videoId);
      return null;
    }
  } catch (e) {
    if (retryCount < maxRetries) {
      console.log(`Retrying... Attempt ${retryCount + 1} of ${maxRetries}`);
      await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
      return extractYoutubeSvgHeatmap(page, videoId, retryCount + 1, maxRetries);
    } else {
      console.error(
        "Maximum retries reached. Unable to find required selectors:",
        e
      );
      return null;
    }
  }
}

/**
 * Process heat map SVG data to extract segment data
 * @param heatMapHTML Heat map SVG HTML
 * @param videoLength Video length in seconds
 * @returns Heat map data object
 */
function processHeatMapData(heatMapHTML: string, videoLength: number): HeatMapData {
  const pathData = processSVG(heatMapHTML);
  const segments = extractPointsFromPath(pathData);
  const replayedParts = analyzeSegments(segments, videoLength);
  return replayedParts;
}

/**
 * Analyze segments to normalize intensity values
 * @param segments Array of segments from SVG
 * @param videoLength Video length in seconds
 * @returns Heat map data with normalized segments
 */
function analyzeSegments(
  segments: Array<{x: number; y: number}>, 
  videoLength: number
): HeatMapData {
  const segmentDuration = videoLength / segments.length;
  const validSegments = segments.filter(
    (segment) => !isNaN(segment.y) && segment.y !== undefined
  );
  
  if (validSegments.length === 0) {
    return {
      markerType: "MARKER_TYPE_HEATMAP",
      markers: []
    };
  }
  
  const maxYValue = validSegments.reduce(
    (max, segment) => Math.max(max, segment.y),
    validSegments[0].y
  );

  const normalizedSegments = validSegments.map((segment, index) => {
    const normalizedIntensity = normalizeIntensity(segment.y, maxYValue);
    return {
      startMillis: index * segmentDuration * 1000,
      durationMillis: segmentDuration * 1000,
      intensityScoreNormalized: normalizedIntensity
    };
  });

  return {
    markerType: "MARKER_TYPE_HEATMAP",
    markers: normalizedSegments
  };
}

/**
 * Normalize intensity value based on max Y value
 * @param yValue Y value to normalize
 * @param maxYValue Maximum Y value for normalization
 * @returns Normalized intensity value
 */
function normalizeIntensity(yValue: number, maxYValue: number): number {
  if (isNaN(yValue) || yValue === undefined) {
    return 0;
  }

  const normalizedIntensity = yValue / maxYValue;
  return normalizedIntensity;
} 