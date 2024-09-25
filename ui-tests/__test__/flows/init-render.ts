import { Page } from 'playwright/test';
import { waitForTransitionEnd } from '../helpers';
import testIds from '../../../src/helper/test-ids';

export const initRender = async (page: Page): Promise<void> => {
  const welcomeCardSelector = `[${testIds.selector}="${testIds.chatItem.type.answer}"]`;
  const welcomeCard = await page.waitForSelector(welcomeCardSelector);
  await waitForTransitionEnd(page, welcomeCardSelector);
  
  expect(welcomeCard).toBeDefined();

  expect(await page.screenshot()).toMatchImageSnapshot();
};
