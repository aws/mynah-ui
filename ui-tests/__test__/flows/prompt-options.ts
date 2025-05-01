import { Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../helpers';
import testIds from '../../../src/helper/test-ids';
import { closeTab } from './close-tab';
import { openNewTab } from './open-new-tab';

export const promptOptions = async (page: Page): Promise<void> => {
  await closeTab(page, false, true);
  await openNewTab(page, false, true);

  const promptOptionsSelector = getSelector(testIds.prompt.options);
  await page.evaluate(() => {
    const selectedTabId = window.mynahUI.getSelectedTabId();
    if (selectedTabId != null) {
      window.mynahUI.updateStore(selectedTabId, {
        promptInputOptions: [
          {
            type: 'toggle',
            id: 'prompt-type',
            value: 'ask',
            options: [ {
              value: 'ask',
              icon: 'chat'
            }, {
              value: 'do',
              icon: 'flash'
            } ]
          }
        ],
        promptInputButtons: [
          {
            id: 'upgrade-q',
            icon: 'bug',
          }
        ]
      });
    }
  });
  const promptOptionsWrapper = (await page.waitForSelector(`${promptOptionsSelector}`));
  expect(await promptOptionsWrapper.isVisible()).toBeTruthy();
  await waitForAnimationEnd(page);

  // snap
  expect(await page.screenshot()).toMatchImageSnapshot();

  // Remove options
  await page.evaluate(() => {
    const selectedTabId = window.mynahUI.getSelectedTabId();
    if (selectedTabId != null) {
      window.mynahUI.updateStore(selectedTabId, {
        promptInputOptions: [],
        promptInputButtons: []
      });
    }
  });
  expect(await promptOptionsWrapper.isVisible()).toBeFalsy();
};
