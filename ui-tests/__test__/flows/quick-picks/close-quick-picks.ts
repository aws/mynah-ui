import { Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';

export const closeQuickPicks = async (page: Page, method: 'blur' | 'escape', mode?: 'command' | 'context', skipScreenshots?: boolean): Promise<void> => {
  // Press '/' in the input
  const input = page.locator(getSelector(testIds.prompt.input));
  await input.focus();
  await waitForAnimationEnd(page);
  await input.press(mode === 'context' ? '@' : '/');
  await waitForAnimationEnd(page);

  // Find the command selector
  const commandSelector = page.locator(getSelector(testIds.prompt.quickPicksWrapper)).nth(-1);
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
  expect(await input.innerText()).toBe(mode === 'context' ? '@' : method === 'blur' ? '/' : '');

  if (skipScreenshots !== true) {
    expect(await page.screenshot()).toMatchImageSnapshot();
  }

  if (mode === 'context') {
    await input.clear();
    await input.press('Backspace');
  }
};
