import { Page } from 'playwright/test';
import { waitForTransitionEnd } from '../helpers';
import testIds from '../../../src/helper/test-ids';

export const renderUserPrompt = async (page: Page): Promise<void> => {
  await page.locator(`[${testIds.selector}="${testIds.prompt.input}"]`).fill('This is a user Prompt');
  await page.locator(`[${testIds.selector}="${testIds.prompt.send}"]`).click();

  const userCardSelector = `[${testIds.selector}="${testIds.chatItem.type.prompt}"]`;
  const userCard = await page.waitForSelector(userCardSelector);
  await waitForTransitionEnd(page, userCardSelector);

  expect(userCard).toBeDefined();

  expect(await userCard.screenshot()).toMatchImageSnapshot();
};
