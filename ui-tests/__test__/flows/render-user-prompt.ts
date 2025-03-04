import { expect, Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../helpers';
import testIds from '../../../src/helper/test-ids';

export const renderUserPrompt = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  await page.locator(getSelector(testIds.prompt.input)).fill('This is a user Prompt');
  await page.locator(getSelector(testIds.prompt.send)).click();
  const promptInput = await page.waitForSelector(getSelector(testIds.prompt.input));
  expect(await promptInput.getAttribute('disabled')).toEqual('disabled');

  const userCardSelector = getSelector(testIds.chatItem.type.prompt);
  const userCard = await page.waitForSelector(userCardSelector);
  expect(userCard).toBeDefined();
  await waitForAnimationEnd(page);
  await userCard.scrollIntoViewIfNeeded();
  expect(await promptInput.getAttribute('disabled')).toEqual(null);

  if (skipScreenshots !== true) {
    expect(await userCard.screenshot()).toMatchSnapshot();
  }
};
