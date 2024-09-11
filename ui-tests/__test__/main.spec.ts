import WebdriverIO, { Browser } from 'wdio';
import path from 'path';
import { deleteTempScreenShotBuffer } from './helpers';
import { initRender } from './flows/init-render';
import { renderUserPrompt } from './flows/render-user-prompt';
import { clickToFollowup } from './flows/click-followup';
import { closeTab } from './flows/close-tab';
import { openNewTab } from './flows/open-new-tab';

describe('Open MynahUI', () => {
  let browser: Browser;
  beforeAll(async () => {
    browser = await webdriverio.remote({
      capabilities: {
        browserName: process.env.BROWSER_NAME || 'chrome',
        'goog:chromeOptions': {
          args:
          process.env.HEADLESS === '1'
            ? [
                '--headless',
                '--disable-gpu',
                '--window-size=1280,800'
              ]
            : []
        }
      },
      // Wait for at most 10 seconds for elements to appear.
      waitforTimeout: 10000
    });
    const htmlFilePath = path.join(__dirname, '../dist/index.html');
    const fileUrl = 'file://' + htmlFilePath;
    await browser.navigateTo(fileUrl);
  });

  afterAll(async () => {
    await deleteTempScreenShotBuffer();
    await browser.end();
  });

  it('should render initial data', async () => {
    // await initRender(page);
  });

  it('should render user prompt', async () => {
    // await renderUserPrompt(page);
  });

  it('should render new card when followup click', async () => {
    // await clickToFollowup(page);
  });

  it('should close the tab', async () => {
    // await closeTab(page);
  });

  it('should open a new the tab', async () => {
    // await openNewTab(page);
  });
});
