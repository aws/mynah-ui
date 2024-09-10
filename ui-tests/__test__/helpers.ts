import { ElementHandle, Page } from 'playwright/test';
import fs from 'fs';

export const TEMP_SCREENSHOT_PATH = './temp-snapshot.png';

export async function waitForTransitionEnd (page: Page, element: string): Promise<void> {
  await page.evaluate(async (element: string) => {
    return await new Promise<void>((resolve) => {
      const transition = document.querySelector(element);
      if (transition != null) {
        const onEnd = (): void => {
          transition.removeEventListener('transitionend', onEnd);
          resolve();
        };
        transition.addEventListener('transitionend', onEnd);
      } else {
        resolve();
      }
    });
  }, element);
}

export async function createTempScreenShotBuffer (target: Page | ElementHandle<Element>): Promise<Buffer> {
  // Take the screenshot of the page with puppeteer
  // and write it to disk
  await target.screenshot({
    type: 'png',
    // captureBeyondViewport: false,
    // optimizeForSpeed: true,
    path: TEMP_SCREENSHOT_PATH
  });

  // read the screenshot as a buffer
  return fs.readFileSync(TEMP_SCREENSHOT_PATH);
}

export async function deleteTempScreenShotBuffer (): Promise<void> {
  return fs.unlinkSync(TEMP_SCREENSHOT_PATH);
}
