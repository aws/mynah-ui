import { Page } from 'playwright/test';
import { getSelector, isVisible } from '../helpers';
import testIds from '../../../src/helper/test-ids';
import { closeTab } from './close-tab';
import { openNewTab } from './open-new-tab';

export const renderCharacterCount = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  await closeTab(page, false, true);
  await openNewTab(page, false, true);

  const characterCounter = page.locator(getSelector(testIds.prompt.remainingCharsIndicator));
  expect(characterCounter).toBeDefined();

  // Check if the element is not visible initially
  expect(await characterCounter.evaluate(isVisible)).toBe(false);

  // Fill the input with 3500 characters
  await page.locator(getSelector(testIds.prompt.input)).fill('z'.repeat(3500));
  expect(characterCounter).toBeDefined();

  // Check if the element is visible after filling the input
  expect(await characterCounter.evaluate(isVisible)).toBe(true);

  // Check that the value is set to 3500/4000
  expect(await characterCounter.innerText()).toBe('3500/4000');

  if (skipScreenshots !== true) {
    expect(await page.screenshot()).toMatchImageSnapshot();
  }
};
