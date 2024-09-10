import { ElementHandle, Page } from 'playwright/test';
import { createTempScreenShotBuffer, waitForTransitionEnd } from '../helpers';

export const renderUserPrompt = async (page: Page): Promise<void> => {
  await page.locator('textarea.mynah-chat-prompt-input').fill('This is a user Prompt');
  await page.locator('button.mynah-chat-prompt-button').click();

  const userCard = await page.waitForSelector('.mynah-chat-item-card.mynah-chat-item-prompt');
  await waitForTransitionEnd(page, '.mynah-chat-item-card.mynah-chat-item-prompt');

  expect(userCard).toBeDefined();

  // read the screenshot as a buffer
  const screenShot = await createTempScreenShotBuffer(userCard as ElementHandle<Element>);

  // send the buffer to toMatchImageSnapshot
  expect(screenShot).toMatchImageSnapshot();
};
