import * as puppeteer from 'puppeteer';
import { checkForAds, waitForAdSkip } from './youtube_ads';
import { extractYoutubeJsonData } from './youtubeJsonExtractor';
import { extractYoutubeSvgHeatmap } from './youtubeSvgHeatmapExtractor';
import { getTopReplayedParts } from './youtubeHeatmapSorter';

/**
 * Get the most replayed parts of a YouTube video
 * @param videoId YouTube video ID
 * @param parts Number of parts to return (default: 1)
 * @returns Object with replayed parts and video length
 */
export async function getMostReplayedParts(
  videoId: string, 
  parts: number = 150
): Promise<{
  replayedParts: Array<{
    position: number;
    start: number;
    end: number;
  }>;
  videoLength: number | null;
}> {
  const browserOptions: puppeteer.LaunchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  };

  const browser = await puppeteer.launch(browserOptions);
  const page = await browser.newPage();
  await page.goto(`https://www.youtube.com/watch?v=${videoId}`);

  const adExists = await checkForAds(page);
  if (adExists) {
    await waitForAdSkip(page);
  }

  let data = await extractYoutubeJsonData(page);
  let videoLength = null;
  if (!data) {
    const result = await extractYoutubeSvgHeatmap(page, videoId);
    if (result) {
      data = result.heatMapData;
      videoLength = result.videoLength;
    }
  }

  await browser.close();

  // If we have data, get the top replayed parts
  if (data) {
    const replayedParts = getTopReplayedParts(data, parts);
    return { replayedParts, videoLength };
  }
  
  // Return empty result if no data found
  return { replayedParts: [], videoLength };
} 