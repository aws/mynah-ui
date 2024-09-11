import { DEFAULT_TOLERANCE, waitForCardReveal } from '../helpers';

export const renderUserPrompt = async (browser: WebdriverIO.Browser): Promise<void> => {
    await browser.$('textarea.mynah-chat-prompt-input').addValue('This is a user Prompt');
    await browser.$('button.mynah-chat-prompt-button').click();

    const userCard = await browser.$('.mynah-chat-item-card.mynah-chat-item-prompt');
    await waitForCardReveal(browser, '.mynah-chat-item-card.mynah-chat-item-prompt');

    expect(userCard).toBeDefined();
    await expect(userCard).toMatchElementSnapshot('userCard', DEFAULT_TOLERANCE);
};
