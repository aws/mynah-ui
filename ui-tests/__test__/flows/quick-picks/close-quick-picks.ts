import { Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';

export const closeQuickPicks = async (page: Page, method: 'blur' | 'escape', mode?: 'command' | 'context', skipScreenshots?: boolean): Promise<void> => {
  // Clear the input
  const input = await page.locator(`${getSelector(testIds.prompt.input)}`);
  await input.clear();
  await waitForAnimationEnd(page);

  // Press '/' in the input
  await input.press(mode === 'context' ? '@' : '/');
  await waitForAnimationEnd(page);

  // Find the command selector
  const commandSelector = await page.locator(`${getSelector(testIds.prompt.quickPicksWrapper)}`).nth(-1);
  expect(commandSelector).toBeDefined();
  expect(await commandSelector.isVisible()).toBeTruthy();

  // Either click outside to blur, or press escape
  if (method === 'blur') {
    await page.mouse.click(100, 400);
  } else {
    await input.press('Escape');
  }
  await waitForAnimationEnd(page);

  // Now the command selector should be closed, but the input should still remain intact
  expect(await commandSelector.isVisible()).toBeFalsy();
  expect(await input.inputValue()).toBe(mode === 'context' ? '@' : method === 'blur' ? '/' : '');

  if (skipScreenshots !== true) {
    expect(await page.screenshot()).toMatchImageSnapshot();
  }
};
