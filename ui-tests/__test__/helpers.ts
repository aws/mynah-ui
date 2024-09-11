export const MAX_TRANSITION_DURATION = 2000;

export async function waitForTransitionEnd(browser: WebdriverIO.Browser, selector: string): Promise<void | unknown> {
    const elm = await browser.$(selector);
    if (elm != null) {
        return await browser.pause(MAX_TRANSITION_DURATION);
    }

    return await new Promise<void>((resolve, reject) => {
        reject();
    });
}

export async function waitChatStreamEnd(browser: WebdriverIO.Browser): Promise<void | unknown> {
    const chatWrapper = await browser.$('.mynah-chat-wrapper');
    if (chatWrapper != null) {
        return await await chatWrapper.waitUntil(
            async () => {
                const classList = await chatWrapper.getAttribute('class');
                return classList.split(' ').indexOf('loading') === -1;
            },
            {
                interval: 250,
                timeout: 5000,
            }
        );
    }

    return await new Promise<void>((resolve, reject) => {
        reject();
    });
}