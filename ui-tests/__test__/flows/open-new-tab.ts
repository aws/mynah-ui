import { Page } from 'playwright';
import { getSelector, waitForAnimationEnd } from '../helpers';
import testIds from '../../../src/helper/test-ids';
import { expect } from 'playwright/test';

export const openNewTab = async (page: Page, withMiddleClick?: boolean, skipScreenshots?: boolean): Promise<void> => {
  // Open new tab
  if (withMiddleClick !== true) {
    await page.locator(getSelector(testIds.tabBar.tabAddButton)).click();
  } else {
    await page.mouse.move(100, 10);
    await page.locator(getSelector(testIds.tabBar.wrapper)).dblclick({ position: { x: 100, y: 10 } });
  }
  await page.mouse.move(0, 0);
  const welcomeCardSelector = `${getSelector(testIds.chatItem.type.answer)}[messageid="welcome-message"]`;
  const welcomeCard = await page.waitForSelector(welcomeCardSelector);
  await waitForAnimationEnd(page);
  expect(welcomeCard).toBeDefined();

  if (skipScreenshots !== true) {
    // snap
    expect(await page.screenshot()).toMatchSnapshot();
  }
};
