import { waitForTransitionEnd } from "../helpers";

export const initRender = async (browser: WebdriverIO.Browser): Promise<void> => {
    await waitForTransitionEnd(browser, '.mynah-chat-item-card[messageid="mynah-ui-test-followup"]');
    await expect(browser.$('#mynah-wrapper')).toMatchElementSnapshot('initRender');
};
