import { DEFAULT_TOLERANCE, waitForCardReveal } from '../helpers';

export const openNewTab = async (browser: WebdriverIO.Browser): Promise<void> => {
  // Open new tab
  await browser.$('.mynah-nav-tabs-wrapper > .mynah-toggle-container.mynah-toggle-type-tabs + button.mynah-button').click();
  await browser.$('.mynah-chat-item-card');
  await waitForCardReveal(browser, '.mynah-chat-item-card');

  // send the buffer to toMatchImageSnapshot
  await expect(browser.$('#mynah-wrapper')).toMatchElementSnapshot('newTab', DEFAULT_TOLERANCE);
};
