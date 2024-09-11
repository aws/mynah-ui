import { DEFAULT_TOLERANCE } from "../helpers";

export const closeTab = async (browser: WebdriverIO.Browser): Promise<void> => {
  // Close the first tab
  await browser.$('.mynah-nav-tabs-wrapper > .mynah-toggle-container > span[key="mynah-main-tabs-tab-1"] button').click();

  // Save snapshot
  await expect(browser.$('#mynah-wrapper')).toMatchElementSnapshot('noTabs', DEFAULT_TOLERANCE);
};
