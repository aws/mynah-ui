import { expect, Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';

export const navigatePromptsDown = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  await page.locator(getSelector(testIds.prompt.input)).fill('This is the first user prompt');
  await page.locator(getSelector(testIds.prompt.send)).click();
  await waitForAnimationEnd(page);

  await page.locator(getSelector(testIds.prompt.input)).fill('This is the second user prompt');
  await page.locator(getSelector(testIds.prompt.send)).click();
  await waitForAnimationEnd(page);

  const promptInput = page.locator(getSelector(testIds.prompt.input));
  await promptInput.press('ArrowUp');
  await waitForAnimationEnd(page);

  await promptInput.press('ArrowUp');
  await waitForAnimationEnd(page);

  await promptInput.press('ArrowDown');
  await waitForAnimationEnd(page);

  expect(await promptInput.inputValue()).toBe('This is the second user prompt');

  if (skipScreenshots !== true) {
    expect(await page.screenshot()).toMatchSnapshot();
  }
};
