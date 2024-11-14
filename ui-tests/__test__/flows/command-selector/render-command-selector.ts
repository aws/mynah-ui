import { Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';

export const renderCommandSelector = async (page: Page, mode?: 'command' | 'context', skipScreenshots?: boolean): Promise<void> => {
  // Type a '/' character
  const input = await page.locator(`${getSelector(testIds.prompt.input)}`);
  await input.focus();
  await input.press(mode === 'context' ? '@' : '/');
  await waitForAnimationEnd(page);

  // Check that the command selector is opened, and visible
  const commandSelector = await page.locator(`${getSelector(testIds.prompt.quickPicksWrapper)}`).nth(-1);
  expect(commandSelector).toBeDefined();
  expect(await commandSelector.isVisible()).toBeTruthy();

  if (skipScreenshots !== true) {
    expect(await page.screenshot()).toMatchImageSnapshot();
  }
};
