import { expect, Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';

export const cancelFeedbackForm = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  const cancelButton = page.locator(getSelector(testIds.feedbackForm.cancelButton));
  expect(cancelButton).toBeDefined();
  await cancelButton.click();
  await waitForAnimationEnd(page);

  if (skipScreenshots !== true) {
    expect(await page.screenshot()).toMatchSnapshot();
  }
};
