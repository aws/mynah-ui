import { Page } from 'puppeteer';
import { createTempScreenShotBuffer } from '../helpers';

export const closeTab = async (page: Page): Promise<void> => {
  // Close the first tab
  await page.locator('.mynah-nav-tabs-wrapper > .mynah-toggle-container > span[key="mynah-main-tabs-tab-1"] button').click();

  // send the buffer to toMatchImageSnapshot
  expect(await createTempScreenShotBuffer(page)).toMatchImageSnapshot();
};
