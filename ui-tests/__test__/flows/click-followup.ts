import { Page } from 'playwright/test';
import { waitForTransitionEnd } from '../helpers';
import testIds from '../../../src/helper/test-ids';

export const clickToFollowup = async (page: Page): Promise<void> => {
  const followupMessageSelector = `[${testIds.selector}="${testIds.chatItem.type.answer}"][messageid="mynah-ui-test-followup"]`;
  await page.waitForSelector(followupMessageSelector);
  await waitForTransitionEnd(page, followupMessageSelector);

  await page.locator(`${followupMessageSelector} [${testIds.selector}="${testIds.chatItem.chatItemFollowup.optionButton}"]:nth-child(1)`).click();
  await page.mouse.move(0, 0);

  await page.waitForSelector(`[${testIds.selector}="${testIds.chat.wrapper}"]:not(.loading)`);
  await page.waitForSelector(followupMessageSelector);
  await waitForTransitionEnd(page, followupMessageSelector);

  expect(await page.screenshot()).toMatchImageSnapshot();
};
