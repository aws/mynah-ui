import { Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';
import { closeTab } from '../close-tab';
import { openNewTab } from '../open-new-tab';

export const renderQuickPicks = async (page: Page, mode?: 'command' | 'context', skipScreenshots?: boolean): Promise<void> => {
  await closeTab(page, false, true);
  await openNewTab(page, false, true);

  // Clear the input
  const input = page.locator(getSelector(testIds.prompt.input));
  await input.clear();
  await waitForAnimationEnd(page);

  // Press '/' in the input
  await input.press(mode === 'context' ? '@' : '/');
  await waitForAnimationEnd(page);

  // Check that the command selector is opened, and visible
  const commandSelector = page.locator(getSelector(testIds.prompt.quickPicksWrapper)).nth(-1);
  expect(commandSelector).toBeDefined();
  expect(await commandSelector.isVisible()).toBeTruthy();

  if (skipScreenshots !== true) {
    expect(await page.screenshot()).toMatchImageSnapshot();
  }
};
