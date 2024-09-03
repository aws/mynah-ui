import puppeteer, { Page } from 'puppeteer';
import path from 'path';
import fs from 'fs';
export const TEMP_SCREENSHOT_PATH = './temp-snapshot.png';
async function waitForTransitionEnd (page: Page, element: string): Promise<void> {
  await page.evaluate(async (element: string) => {
    return await new Promise<void>((resolve, reject) => {
      const transition = document.querySelector(element);
      if (transition != null) {
        const onEnd = (): void => {
          transition.removeEventListener('transitionend', onEnd);
          resolve();
        };
        transition.addEventListener('transitionend', onEnd);
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject();
      }
    });
  }, element);
}

describe('mynah-ui', () => {
  it('Should render default page', async () => {
    const browser = await puppeteer.launch({
      headless: false,
      args: [ '--no-sandbox', '--disable-setuid-sandbox' ],
      defaultViewport: null,
      timeout: 5000,
      dumpio: true
    });
    const page = await browser.newPage();
    const htmlFilePath = path.join(__dirname, '../dist/index.html');
    const fileUrl = 'file://' + htmlFilePath;
    await page.setViewport({ width: 500, height: 650 });
    const response = await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });

    // Be sure the page is displayed correctly with puppeteer & Jest
    expect(response?.status()).toBe(200);
    await page.waitForSelector('.mynah-chat-item-card', { timeout: 5_000 });
    await waitForTransitionEnd(page, '.mynah-chat-item-card');

    // Take the screenshot of the page with puppeteer
    // and write it to disk
    await page.screenshot({
      type: 'png',
      captureBeyondViewport: false,
      optimizeForSpeed: true,
      path: TEMP_SCREENSHOT_PATH
    });

    // read the screenshot as a buffer
    const ss = await fs.readFileSync(TEMP_SCREENSHOT_PATH);

    // send the buffer to toMatchImageSnapshot
    expect(ss).toMatchImageSnapshot();

    // remove the temp screenshot file
    await fs.unlinkSync(TEMP_SCREENSHOT_PATH);

    await browser.close();
  });
});
