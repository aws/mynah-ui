import { Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../helpers';
import testIds from '../../../src/helper/test-ids';
import { closeTab } from './close-tab';
import { openNewTab } from './open-new-tab';

export const renderUserPrompt = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  await closeTab(page, false, true);
  await openNewTab(page, false, true);

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
    expect(await userCard.screenshot()).toMatchImageSnapshot();
  }
};
