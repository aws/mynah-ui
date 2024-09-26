import { Page } from 'playwright/test';
import { getSelector, waitForAllAnimationsEnd } from '../helpers';
import testIds from '../../../src/helper/test-ids';

export const renderUserPrompt = async (page: Page): Promise<void> => {
  await page.locator(`${getSelector(testIds.prompt.input)}`).fill('This is a user Prompt');
  await page.locator(`${getSelector(testIds.prompt.send)}`).click();

  const userCardSelector = `${getSelector(testIds.chatItem.type.prompt)}`;
  const userCard = await page.waitForSelector(userCardSelector);
  await waitForAllAnimationsEnd(page);

  expect(userCard).toBeDefined();

  expect(await userCard.screenshot()).toMatchImageSnapshot();
};
