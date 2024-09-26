// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="jest-playwright-preset" />
import path from 'path';
import { initRender } from './flows/init-render';
import { renderUserPrompt } from './flows/render-user-prompt';
import { clickToFollowup } from './flows/click-followup';
import { closeTab } from './flows/close-tab';
import { openNewTab } from './flows/open-new-tab';
import { windowBoundary } from './flows/window-boundaries';
import { DEFAULT_VIEWPORT } from './helpers';
import { configureToMatchImageSnapshot } from 'jest-image-snapshot';
import { Page } from 'playwright';

describe('Open MynahUI', () => {
  let _page: Page;
  beforeAll(async () => {
    const browserName = await (await browser.browserType()).name();
    const toMatchImageSnapshot = configureToMatchImageSnapshot({
      failureThreshold: browserName === 'webkit' ? 0.01 : 0.1,
      comparisonMethod: 'pixelmatch',
      failureThresholdType: 'percent',
      customSnapshotsDir: `./__test__/__image_snapshots__/${browserName}`
    });

    expect.extend({ toMatchImageSnapshot });
    const htmlFilePath: string = path.join(__dirname, '../dist/index.html');
    const fileUrl = `file://${htmlFilePath}`;
    if (browserName === 'webkit') {
      _page = await browser.newPage({
        viewport: DEFAULT_VIEWPORT
      });
    } else {
      _page = page;
      await _page.setViewportSize(DEFAULT_VIEWPORT);
    }
    await _page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should render initial data', async () => {
    await initRender(_page);
  });

  it('should render user prompt', async () => {
    await renderUserPrompt(_page);
  });

  it('should render new card when followup click', async () => {
    await clickToFollowup(_page);
  });

  it('should close the tab', async () => {
    await closeTab(_page);
  });

  it('should open a new the tab', async () => {
    await openNewTab(_page);
  });

  it('should close the tab with middle click', async () => {
    await closeTab(_page, true, true);
  });

  it('should open a new tab with double click', async () => {
    await openNewTab(_page, true, true);
  });

  it('should keep the content inside window boundaries', async () => {
    await windowBoundary(_page);
  });
});
