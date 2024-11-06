// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="jest-playwright-preset" />
import path from 'path';
import { initRender } from './flows/init-render';
import { renderUserPrompt } from './flows/render-user-prompt';
import { clickToFollowup } from './flows/click-followup';
import { closeTab } from './flows/close-tab';
import { openNewTab } from './flows/open-new-tab';
import { checkContentInsideWindowBoundaries } from './flows/window-boundaries';
import { DEFAULT_VIEWPORT } from './helpers';
import { configureToMatchImageSnapshot } from 'jest-image-snapshot';
import { renderCharacterCount } from './flows/render-character-count';
import { progressIndicator } from './flows/prompt-progress-indicator';
import { parseMarkdown } from './flows/markdown-parser/markdown-parser';
import { renderInformationCard } from './flows/render-information-card';
import { renderTabbedCard } from './flows/render-tabbed-card';
import { welcomeMode } from './flows/welcome-mode';
import { renderButtons } from './flows/render-buttons';

describe('Open MynahUI', () => {
  beforeAll(async () => {
    const browserName = await (await browser.browserType()).name();
    const toMatchImageSnapshot = configureToMatchImageSnapshot({
      failureThreshold: 0.1,
      allowSizeMismatch: true,
      failureThresholdType: 'percent',
      storeReceivedOnFailure: true,
      customSnapshotsDir: `./__test__/__image_snapshots__/${browserName as string}`
    });

    expect.extend({ toMatchImageSnapshot });
    const htmlFilePath: string = path.join(__dirname, '../dist/index.html');
    const fileUrl = `file://${htmlFilePath}`;
    await page.setViewportSize(DEFAULT_VIEWPORT);
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should render initial data', async () => {
    await initRender(page);
  });

  it('should render welcome structure', async () => {
    await welcomeMode(page);
  });

  it('should show progress indicator', async () => {
    await progressIndicator(page);
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

  it('should close the tab with middle click', async () => {
    await closeTab(page, true, true);
  });

  it('should open a new tab with double click', async () => {
    await openNewTab(page, true, true);
  });

  it('should render character limit counter', async () => {
    await renderCharacterCount(page);
  });

  it('should render information cards correctly', async () => {
    await renderInformationCard(page);
  });

  it('should render tabbed cards correctly', async () => {
    await renderTabbedCard(page);
  });

  it('should render buttons on cards correctly', async () => {
    await renderButtons(page);
  });

  it('should keep the content inside window boundaries', async () => {
    await checkContentInsideWindowBoundaries(page);
  });

  it('should parse markdown', async () => {
    await parseMarkdown(page);
  });
});
