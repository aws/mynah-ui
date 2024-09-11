import { waitChatStreamEnd, waitForTransitionEnd } from '../helpers';

export const clickToFollowup = async (browser: WebdriverIO.Browser): Promise<void> => {
    await browser.$('.mynah-chat-item-card[messageid="mynah-ui-test-followup"]');
    await waitForTransitionEnd(browser, '.mynah-chat-item-card[messageid="mynah-ui-test-followup"]');

    await browser.$('.mynah-chat-item-card[messageid="mynah-ui-test-followup"] button.mynah-button').click();
    await browser.$('#mynah-wrapper').moveTo({ xOffset: 0, yOffset: 0 });

    await waitChatStreamEnd(browser);

    await browser.$('.mynah-chat-item-card[messageid="mynah-ui-test-followup"]');
    await waitForTransitionEnd(browser, '.mynah-chat-item-card[messageid="mynah-ui-test-followup"]');

    // send the buffer to toMatchImageSnapshot
    await expect(browser.$('#mynah-wrapper')).toMatchElementSnapshot('followupClick');
};
