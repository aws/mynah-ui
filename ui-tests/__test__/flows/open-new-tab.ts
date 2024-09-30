import { Page } from 'playwright';
import { getSelector, waitForTransitionEnd } from '../helpers';
import testIds from '../../../src/helper/test-ids';

export const openNewTab = async (page: Page): Promise<void> => {
  // Open new tab
  await page.locator(`${getSelector(testIds.tabBar.tabAddButton)}`).click();
  const welcomeCardSelector = `${getSelector(testIds.chatItem.type.answer)}`;
  const welcomeCard = await page.waitForSelector(welcomeCardSelector);
  await waitForTransitionEnd(page, welcomeCardSelector);
  
  expect(welcomeCard).toBeDefined();
  
  expect(await page.screenshot()).toMatchImageSnapshot();
};
