import { Page } from 'playwright/test';
import testIds from '../../../src/helper/test-ids';
import { getSelector } from '../helpers';

export const closeTab = async (page: Page): Promise<void> => {
  await page.locator(`${getSelector(testIds.tabBar.tabOptionWrapper)}:nth-child(1) ${getSelector(testIds.tabBar.tabOptionCloseButton)}`).click();

  expect(await page.screenshot()).toMatchImageSnapshot();
};
