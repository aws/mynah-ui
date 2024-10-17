import { Page } from 'playwright/test';
import { DEFAULT_VIEWPORT, getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';
import allMarkdown from './all-markdown-tags';

export const parseMarkdown = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  // Update viewport size
  await page.setViewportSize({
    width: DEFAULT_VIEWPORT.width,
    height: 2500
  });

  await page.evaluate((body) => {
    const selectedTabId = window.mynahUI.getSelectedTabId();
    if (selectedTabId != null) {
      window.mynahUI.updateStore(selectedTabId, {
        chatItems: [],
      });

      window.mynahUI.addChatItem(selectedTabId, {
        type: 'answer' as any,
        snapToTop: true,
        body
      });
    }
  }, allMarkdown);
  await waitForAnimationEnd(page);

  const answerCardSelector = `${getSelector(testIds.chatItem.type.answer)}`;
  const answerCard = await page.waitForSelector(answerCardSelector);

  if (skipScreenshots !== true) {
    await expect(await answerCard.screenshot()).toMatchImageSnapshot();
  }

  await page.evaluate(() => {
    const selectedTabId = window.mynahUI.getSelectedTabId();
    if (selectedTabId != null) {
      window.mynahUI.updateStore(selectedTabId, {
        loadingChat: false,
        chatItems: [],
      });
    }
  });

  await page.setViewportSize(DEFAULT_VIEWPORT);
};
