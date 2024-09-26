import { Page } from 'playwright';
import { getSelector, waitForAnimationEnd } from '../helpers';
import testIds from '../../../src/helper/test-ids';

export const openNewTab = async (page: Page, withMiddleClick?: boolean): Promise<void> => {
  // Open new tab
  if (withMiddleClick !== true) {
    await page.locator(`${getSelector(testIds.tabBar.tabAddButton)}`).click();
  } else {
    await page.mouse.move(10, 150);
    await page.locator(`${getSelector(testIds.tabBar.wrapper)}`).dblclick();
  }
  await page.mouse.move(0, 0);
  const welcomeCardSelector = `${getSelector(testIds.chatItem.type.answer)}[messageid="welcome-message"]`;
  const welcomeCard = await page.waitForSelector(welcomeCardSelector);
  await waitForAnimationEnd(page);

  expect(welcomeCard).toBeDefined();

  expect(await page.screenshot()).toMatchImageSnapshot();
};
