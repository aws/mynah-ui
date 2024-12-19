import { Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';
import { closeTab } from '../close-tab';
import { openNewTab } from '../open-new-tab';

export const navigatePromptsDown = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  await closeTab(page, false, true);
  await openNewTab(page, false, true);

  await page.locator(getSelector(testIds.prompt.input)).fill('This is the first user prompt');
  await page.locator(getSelector(testIds.prompt.send)).click();
  await waitForAnimationEnd(page);

  await page.locator(getSelector(testIds.prompt.input)).fill('This is the second user prompt');
  await page.locator(getSelector(testIds.prompt.send)).click();
  await waitForAnimationEnd(page);

  let promptInput = page.locator(getSelector(testIds.prompt.input));
  await promptInput.press('ArrowUp');
  await waitForAnimationEnd(page);

  await promptInput.press('ArrowUp');
  await waitForAnimationEnd(page);

  promptInput = page.locator(getSelector(testIds.prompt.input));
  await promptInput.press('ArrowDown');
  await waitForAnimationEnd(page);

  expect(await promptInput.inputValue()).toBe('This is the second user prompt');

  if (skipScreenshots !== true) {
    expect(await page.screenshot()).toMatchImageSnapshot();
  }
};
