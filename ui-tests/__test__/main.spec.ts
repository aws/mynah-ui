import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import { deleteTempScreenShotBuffer } from './helpers';
import { initRender } from './flows/init-render';
import { renderUserPrompt } from './flows/render-user-prompt';
import { clickToFollowup } from './flows/click-followup';
import { closeTab } from './flows/close-tab';
import { openNewTab } from './flows/open-new-tab';

describe('Open MynahUI', () => {
  let browser: Browser;
  let page: Page;
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: [ '--no-sandbox', '--disable-setuid-sandbox' ],
      defaultViewport: null,
      timeout: 5000,
      dumpio: true
    });
    page = await browser.newPage();
    const htmlFilePath = path.join(__dirname, '../dist/index.html');
    const fileUrl = 'file://' + htmlFilePath;
    await page.setViewport({ width: 500, height: 950 });
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  });

  afterAll(async () => {
    await deleteTempScreenShotBuffer();
    await browser.close();
  });

  it('should render initial data', async () => {
    await initRender(page);
  });

  it('should render user prompt', async () => {
    await renderUserPrompt(page);
  });

  it('should render new card when followup click', async () => {
    await clickToFollowup(page);
  });

  it('should close the tab', async () => {
    await closeTab(page);
  });

  it('should open a new the tab', async () => {
    await openNewTab(page);
  });
});
