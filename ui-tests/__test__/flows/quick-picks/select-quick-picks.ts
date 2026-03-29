import { expect, Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';

export const selectQuickPicks = async (page: Page, method: 'click' | 'Tab' | 'Enter' | 'Space', mode?: 'command' | 'context', skipScreenshots?: boolean): Promise<void> => {
  // Clear the input
  const input = page.locator(getSelector(testIds.prompt.input));
  await input.press('Backspace');
  await input.press('Backspace');
  await waitForAnimationEnd(page);

  // Type a '/' character, followed by a first character
  await input.press(mode === 'context' ? '@' : '/');
  await waitForAnimationEnd(page);
  await input.press(mode === 'context' ? 'w' : 'h');
  await waitForAnimationEnd(page);
  // Wait for the debounced filter to render results (filter is debounced at 200ms)
  await page.locator(getSelector(testIds.prompt.quickPickItem)).first().waitFor({ state: 'visible', timeout: 5000 });
  if (method !== 'click') {
    await input.press(method);
  } else {
    await page.locator(getSelector(testIds.prompt.quickPickItem)).click();
  }
  await waitForAnimationEnd(page);

  if (skipScreenshots !== true) {
    expect(await page.screenshot()).toMatchSnapshot();
  }

  // Remove the selection again
  await input.press('Backspace');
  await waitForAnimationEnd(page);
};
