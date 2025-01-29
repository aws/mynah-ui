import { expect, Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../helpers';
import testIds from '../../../src/helper/test-ids';
import { closeTab } from './close-tab';
import { openNewTab } from './open-new-tab';

export const progressIndicator = async (page: Page): Promise<void> => {
  await closeTab(page, false, true);
  await openNewTab(page, false, true);

  const progressSelector = getSelector(testIds.prompt.progress);
  await page.evaluate(() => {
    const selectedTabId = window.mynahUI.getSelectedTabId();
    if (selectedTabId != null) {
      window.mynahUI.updateStore(selectedTabId, {
        promptInputProgress: {
          value: 10,
          text: 'Progress',
          valueText: '10%',
          status: 'info'
        }
      });
    }
  });
  const progressWrapper = await page.waitForSelector(`${progressSelector}:not(.no-content)`);
  expect(progressWrapper).toBeDefined();
  await waitForAnimationEnd(page);

  // snap
  expect(await page.screenshot()).toMatchSnapshot();

  // Remove the progress indicator
  await page.evaluate(() => {
    const selectedTabId = window.mynahUI.getSelectedTabId();
    if (selectedTabId != null) {
      window.mynahUI.updateStore(selectedTabId, {
        promptInputProgress: null
      });
    }
  });
  await waitForAnimationEnd(page);
  expect(await page.waitForSelector(`${progressSelector}.no-content`)).toBeDefined();
};
