import { browser } from '@wdio/globals';
import path from 'path';
import { initRender } from './flows/init-render';
import { renderUserPrompt } from './flows/render-user-prompt';
import { clickToFollowup } from './flows/click-followup';
import { closeTab } from './flows/close-tab';
import { openNewTab } from './flows/open-new-tab';

describe('Open MynahUI', () => {
    before(async () => {
        const htmlFilePath = path.join(__dirname, '../dist/index.html');
        const fileUrl = 'file://' + htmlFilePath;
        await browser.setWindowSize(500, 950);
        await browser.url(fileUrl);
    });
    after(async () => {
        await browser.browserClose({});
        await browser.sessionEnd({});
    });

    it('should render initial data', async () => {
        await initRender(browser);
    });

    it('should render user prompt', async () => {
        await renderUserPrompt(browser);
    });

    it('should render new card when followup click', async () => {
        await clickToFollowup(browser);
    });

    it('should close the tab', async () => {
        await closeTab(browser);
    });

    it('should open a new the tab', async () => {
        await openNewTab(browser);
    });
});
