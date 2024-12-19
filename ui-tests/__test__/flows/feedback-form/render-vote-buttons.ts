import { Page } from 'playwright/test';
import { waitForAnimationEnd } from '../../helpers';
import { openNewTab } from '../open-new-tab';
import { closeTab } from '../close-tab';

export const renderVoteButtons = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  await closeTab(page, false, true);
  await openNewTab(page, false, true);

  await page.evaluate((body) => {
    const selectedTabId = window.mynahUI.getSelectedTabId();
    if (selectedTabId != null) {
      window.mynahUI.updateStore(selectedTabId, {
        chatItems: [],
      });

      window.mynahUI.addChatItem(selectedTabId, {
        type: 'answer' as any,
        snapToTop: true,
        body: 'This message is votable.',
        canBeVoted: true,
      });
    }
  });
  await waitForAnimationEnd(page);

  if (skipScreenshots !== true) {
    expect(await page.screenshot()).toMatchImageSnapshot();
  }
};
