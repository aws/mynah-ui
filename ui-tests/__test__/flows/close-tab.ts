import { Page } from 'playwright/test';
import testIds from '../../../src/helper/test-ids';

export const closeTab = async (page: Page): Promise<void> => {
  await page.locator(`[${testIds.selector}="${testIds.tabBar.tabOptionWrapper}"]:nth-child(1) [${testIds.selector}="${testIds.tabBar.tabOptionCloseButton}"]`).click();

  expect(await page.screenshot()).toMatchImageSnapshot();
};
