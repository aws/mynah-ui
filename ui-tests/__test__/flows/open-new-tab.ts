import { Page } from 'playwright';
import { getSelector, waitForAllAnimationsEnd } from '../helpers';
import testIds from '../../../src/helper/test-ids';

export const openNewTab = async (page: Page): Promise<void> => {
  // Open new tab
  await page.locator(`${getSelector(testIds.tabBar.tabAddButton)}`).click();
  await page.mouse.move(0, 0);
  const welcomeCardSelector = `${getSelector(testIds.chatItem.type.answer)}[messageid="welcome-message"]`;
  const welcomeCard = await page.waitForSelector(welcomeCardSelector);
  await waitForAllAnimationsEnd(page);

  expect(welcomeCard).toBeDefined();

  expect(await page.screenshot()).toMatchImageSnapshot();
};
