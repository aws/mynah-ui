import { Page } from 'playwright/test';
import { getSelector, waitForAllAnimationsEnd } from '../helpers';
import testIds from '../../../src/helper/test-ids';

export const clickToFollowup = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  const followupMessageSelector = `${getSelector(testIds.chatItem.type.answer)}[messageid="mynah-ui-test-followup"]`;
  await page.waitForSelector(followupMessageSelector);
  await waitForAllAnimationsEnd(page);

  await page.locator(`${followupMessageSelector} ${getSelector(testIds.chatItem.chatItemFollowup.optionButton)}:nth-child(1)`).click();
  // await page.mouse.move(0, 0);
  await page.mouse.click(0, 0);

  await page.waitForSelector(`${getSelector(testIds.chat.wrapper)}:not(.loading)`);
  (await page.waitForSelector(followupMessageSelector)).focus();
  await waitForAllAnimationsEnd(page);

  if (skipScreenshots !== true) {
    const chatItemsContainer = await page.waitForSelector(`${getSelector(testIds.chat.chatItemsContainer)}`);
    expect(await chatItemsContainer.screenshot()).toMatchImageSnapshot();
  }
};
