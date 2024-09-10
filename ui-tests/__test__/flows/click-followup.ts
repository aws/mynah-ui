import { Page } from 'playwright/test';
import { createTempScreenShotBuffer, waitForTransitionEnd } from '../helpers';

export const clickToFollowup = async (page: Page): Promise<void> => {
  await page.waitForSelector('.mynah-chat-item-card[messageid="mynah-ui-test-followup"]');
  await waitForTransitionEnd(page, '.mynah-chat-item-card[messageid="mynah-ui-test-followup"]');

  await page.locator('.mynah-chat-item-card[messageid="mynah-ui-test-followup"] button.mynah-button:nth-child(1)').click();
  await page.mouse.move(0, 0);

  await page.waitForSelector('.mynah-chat-wrapper:not(.loading)');

  await page.waitForSelector('.mynah-chat-item-card[messageid="mynah-ui-test-followup"]');
  await waitForTransitionEnd(page, '.mynah-chat-item-card[messageid="mynah-ui-test-followup"]');

  // send the buffer to toMatchImageSnapshot
  expect(await createTempScreenShotBuffer(page)).toMatchImageSnapshot();
};
