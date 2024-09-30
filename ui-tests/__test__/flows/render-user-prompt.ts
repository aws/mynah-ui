import { Page } from 'playwright/test';
import { getSelector, waitForTransitionEnd } from '../helpers';
import testIds from '../../../src/helper/test-ids';

export const renderUserPrompt = async (page: Page): Promise<void> => {
  await page.locator(`${getSelector(testIds.prompt.input)}`).fill('This is a user Prompt');
  await page.locator(`${getSelector(testIds.prompt.send)}`).click();

  const userCardSelector = `${getSelector(testIds.chatItem.type.prompt)}`;
  const userCard = await page.waitForSelector(userCardSelector);
  await waitForTransitionEnd(page, userCardSelector);

  expect(userCard).toBeDefined();

  expect(await userCard.screenshot()).toMatchImageSnapshot();
};
