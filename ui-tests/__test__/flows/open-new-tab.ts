import { Page } from 'playwright';
import { createTempScreenShotBuffer, waitForTransitionEnd } from '../helpers';

export const openNewTab = async (page: Page): Promise<void> => {
  // Open new tab
  await page.locator('.mynah-nav-tabs-wrapper > .mynah-toggle-container.mynah-toggle-type-tabs + button.mynah-button').click();
  await page.waitForSelector('.mynah-chat-item-card', { timeout: 5_000 });
  await waitForTransitionEnd(page, '.mynah-chat-item-card');

  // send the buffer to toMatchImageSnapshot
  expect(await createTempScreenShotBuffer(page)).toMatchImageSnapshot();
};
