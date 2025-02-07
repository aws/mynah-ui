// navigatePromptsUp.ts
import { Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';
import { closeTab } from '../close-tab';
import { openNewTab } from '../open-new-tab';

export const navigatePromptsUp = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  await closeTab(page, false, true);
  await openNewTab(page, false, true);

  await page.locator(getSelector(testIds.prompt.input)).fill('This is the first user prompt');
  await page.locator(getSelector(testIds.prompt.send)).click();
  await waitForAnimationEnd(page);

  const promptInput = page.locator(getSelector(testIds.prompt.input));
  await promptInput.press('ArrowUp');
  await waitForAnimationEnd(page);

  expect(await promptInput.innerText()).toBe('This is the first user prompt');

  if (skipScreenshots !== true) {
    expect(await page.screenshot()).toMatchImageSnapshot();
  }
};
