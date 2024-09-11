import { Browser } from 'webdriverio';
import { createTempScreenShotBuffer, waitForTransitionEnd } from '../helpers';

export const initRender = async (browser: Browser): Promise<void> => {
  browser.execute(()=>{})
  await browser.waitUntil(, { timeout: 5_000 });
  await waitForTransitionEnd(browser, '.mynah-chat-item-card');

  // send the buffer to toMatchImageSnapshot
  expect(await createTempScreenShotBuffer(browser)).toMatchImageSnapshot();
};
