import { Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';

export const submitFeedbackForm = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  await page.evaluate(() => {
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

  const thumbsDown = page.locator(getSelector(testIds.chatItem.vote.downvoteLabel));
  expect(thumbsDown).toBeDefined();
  await thumbsDown.click();
  await waitForAnimationEnd(page);

  const reportButton = page.locator(getSelector(testIds.chatItem.vote.reportButton));
  expect(reportButton).toBeDefined();
  await reportButton.click();
  await waitForAnimationEnd(page);

  const submitButton = page.locator(getSelector(testIds.feedbackForm.submitButton));
  expect(submitButton).toBeDefined();
  await submitButton.click();
  await waitForAnimationEnd(page);

  if (skipScreenshots !== true) {
    expect(await page.screenshot()).toMatchImageSnapshot();
  }
};
