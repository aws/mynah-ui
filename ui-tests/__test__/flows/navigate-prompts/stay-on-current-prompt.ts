import { expect, Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';

export const stayOnCurrentPrompt = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  // Write prompt without sending it
  await page.locator(getSelector(testIds.prompt.input)).fill('This is the first unsent user prompt');
  await waitForAnimationEnd(page);

  const promptInput = page.locator(`${getSelector(testIds.prompt.input)}`);
  await promptInput.press('ArrowUp');
  await waitForAnimationEnd(page);

  await promptInput.press('ArrowDown');
  await waitForAnimationEnd(page);

  expect(await promptInput.inputValue()).toBe('This is the first unsent user prompt');

  if (skipScreenshots !== true) {
    expect(await page.screenshot()).toMatchSnapshot();
  }
};
