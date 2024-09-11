import { DEFAULT_TOLERANCE, waitForCardReveal } from "../helpers";

export const initRender = async (browser: WebdriverIO.Browser): Promise<void> => {
    await waitForCardReveal(browser, '.mynah-chat-item-card[messageid="mynah-ui-test-followup"]');
    await expect(browser.$('#mynah-wrapper')).toMatchElementSnapshot('initRender', DEFAULT_TOLERANCE);
};
