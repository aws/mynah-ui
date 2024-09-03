import { Page } from 'puppeteer';
import { createTempScreenShotBuffer, waitForTransitionEnd } from '../helpers';

export const clickToFollowup = async (page: Page): Promise<void> => {
  await page.waitForSelector('.mynah-chat-item-card[messageid="mynah-ui-test-followup"]');
  await waitForTransitionEnd(page, '.mynah-chat-item-card[messageid="mynah-ui-test-followup"]');

  await page.locator('.mynah-chat-item-card[messageid="mynah-ui-test-followup"] button.mynah-button').click();
  // await page.locator('.mynah-nav-tabs-wrapper').hover();
  await page.mouse.reset();

  await page.waitForSelector('.mynah-chat-wrapper:not(.loading)');

  await page.waitForSelector('.mynah-chat-item-card[messageid="mynah-ui-test-followup"]');
  await waitForTransitionEnd(page, '.mynah-chat-item-card[messageid="mynah-ui-test-followup"]');

  // send the buffer to toMatchImageSnapshot
  expect(await createTempScreenShotBuffer(page)).toMatchImageSnapshot();
};
