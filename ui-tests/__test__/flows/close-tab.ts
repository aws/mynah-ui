import { Page } from 'playwright/test';
import testIds from '../../../src/helper/test-ids';
import { getSelector } from '../helpers';

export const closeTab = async (page: Page, withDblClick?: boolean): Promise<void> => {
  const firstTabSelector = `${getSelector(testIds.tabBar.tabOptionWrapper)}:nth-child(1)`;
  if (withDblClick !== true) {
    await page.locator(`${firstTabSelector} ${getSelector(testIds.tabBar.tabOptionCloseButton)}`).click();
  } else {
    await page.locator(`${firstTabSelector}`).click({ button: 'middle' });
  }

  // No tabs snap
  expect(await page.screenshot()).toMatchImageSnapshot();
};
