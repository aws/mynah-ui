import { Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';

export const closeCommandSelectorByEscape = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  // Clear the input
  const input = await page.locator(`${getSelector(testIds.prompt.input)}`);
  await input.clear();
  await waitForAnimationEnd(page);

  // Press '/' in the input
  await input.press('/');
  await waitForAnimationEnd(page);

  // Find the command selector
  const commandSelector = await page.locator(`${getSelector(testIds.prompt.quickPicksWrapper)}`).nth(-1);
  expect(commandSelector).toBeDefined();
  expect(await commandSelector.isVisible()).toBeTruthy();

  // Click out of the input
  await input.press('Escape');
  await waitForAnimationEnd(page);

  // Now the command selector should be closed, and the input should be emptied
  expect(await commandSelector.isVisible()).toBeFalsy();
  expect(await input.inputValue()).toBe('');

  if (skipScreenshots !== true) {
    expect(await page.screenshot()).toMatchImageSnapshot();
  }
};
