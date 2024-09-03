import { Page } from 'puppeteer';
import { createTempScreenShotBuffer, waitForTransitionEnd } from '../helpers';

export const initRender = async (page: Page): Promise<void> => {
  await page.waitForSelector('.mynah-chat-item-card', { timeout: 5_000 });
  await waitForTransitionEnd(page, '.mynah-chat-item-card');

  // send the buffer to toMatchImageSnapshot
  expect(await createTempScreenShotBuffer(page)).toMatchImageSnapshot();
};
