import { Page } from 'puppeteer';

/**
 * Check if an ad is currently playing on YouTube
 * @param page Puppeteer Page object
 * @returns Boolean indicating if an ad was detected
 */
export async function checkForAds(page: Page): Promise<boolean> {
  try {
    // Check for ad skip button
    const adSkipButton = await page.$('.ytp-ad-skip-button');
    
    // Check for ad overlay
    const adOverlay = await page.$('.ytp-ad-player-overlay');
    
    // Check for ad text
    const adText = await page.$('.ytp-ad-text');
    
    return !!(adSkipButton || adOverlay || adText);
  } catch (error) {
    console.error('Error checking for ads:', error);
    return false;
  }
}

/**
 * Wait for an ad to be skipped or completed
 * @param page Puppeteer Page object
 * @param maxWaitTime Maximum time to wait in milliseconds
 */
export async function waitForAdSkip(
  page: Page, 
  maxWaitTime: number = 30000
): Promise<void> {
  try {
    // Try to skip an ad if possible
    const skipButton = await page.$('.ytp-ad-skip-button');
    if (skipButton) {
      console.log('Ad detected, attempting to skip...');
      await skipButton.click();
      // Wait a moment for the skip to take effect
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    }
    
    // If there's an unskippable ad, wait for it to finish
    const adOverlay = await page.$('.ytp-ad-player-overlay');
    if (adOverlay) {
      console.log('Unskippable ad detected, waiting...');
      
      const startTime = Date.now();
      
      // Check every 2 seconds if the ad is still playing
      while (Date.now() - startTime < maxWaitTime) {
        const stillHasAd = await page.$('.ytp-ad-player-overlay');
        if (!stillHasAd) {
          console.log('Ad finished');
          break;
        }
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
      }
    }
  } catch (error) {
    console.error('Error handling ads:', error);
  }
} 