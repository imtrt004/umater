import { Page } from 'puppeteer';

/**
 * Extract YouTube heat map data from JSON in page scripts
 * @param page Puppeteer Page object
 * @returns Marker list JSON data or null if not found
 */
export async function extractYoutubeJsonData(page: Page): Promise<any | null> {
  await page
    .waitForSelector("script", { timeout: 5000 })
    .catch(() => console.log("Timeout waiting for script tags"));

  try {
    return await page.evaluate(() => {
      const scripts = Array.from(document.scripts);
      for (let script of scripts) {
        const content = script.textContent || '';
        if (content.includes("frameworkUpdates")) {
          // Using a regular expression that works with older TypeScript versions
          const match = content.match(/\{[\s\S]*\}/);
          if (match) {
            try {
              const json = JSON.parse(match[0]);
              if (
                json.frameworkUpdates?.entityBatchUpdate?.mutations[0]?.payload
                  ?.macroMarkersListEntity?.markersList
              ) {
                return json.frameworkUpdates.entityBatchUpdate.mutations[0]
                  .payload.macroMarkersListEntity.markersList;
              }
            } catch (parseError) {
              console.warn("Error parsing JSON from script:", parseError);
            }
          }
        }
      }
      return null;
    });
  } catch (e) {
    console.error("Error in JSON extraction:", e);
    return null;
  }
} 