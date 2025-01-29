import { expect, Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';
import { closeTab } from '../close-tab';
import { openNewTab } from '../open-new-tab';

export const stayOnCurrentPrompt = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  await closeTab(page, false, true);
  await openNewTab(page, false, true);

  // Write prompt without sending it
  await page.locator(getSelector(testIds.prompt.input)).fill('This is the first unsent user prompt');
  await waitForAnimationEnd(page);

  let promptInput = page.locator(`${getSelector(testIds.prompt.input)}`);
  await promptInput.press('ArrowUp');
  await waitForAnimationEnd(page);

  promptInput = page.locator(`${getSelector(testIds.prompt.input)}`);
  await promptInput.press('ArrowDown');
  await waitForAnimationEnd(page);

  expect(await promptInput.innerText()).toBe('This is the first unsent user prompt');

  if (skipScreenshots !== true) {
    expect(await page.screenshot()).toMatchSnapshot();
  }
};
