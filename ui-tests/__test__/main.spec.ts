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
import { renderQuickPicks } from './flows/quick-picks/render-quick-picks';
import { closeQuickPicks } from './flows/quick-picks/close-quick-picks';
import { filterQuickPicks } from './flows/quick-picks/filter-quick-picks';
import { selectQuickPicks } from './flows/quick-picks/select-quick-picks';
import { renderCharacterCount } from './flows/render-character-count';
import { progressIndicator } from './flows/prompt-progress-indicator';
import { parseMarkdown } from './flows/markdown-parser/markdown-parser';
import { renderInformationCard } from './flows/render-information-card';
import { renderTabbedCard } from './flows/render-tabbed-card';
import { welcomeMode } from './flows/welcome-mode';
import { renderButtons } from './flows/render-buttons';
import { navigatePromptsDown } from './flows/navigate-prompts/navigatePromptsDown';
import { navigatePromptsUp } from './flows/navigate-prompts/navigatePromptsUp';
import { navigatePromptsToEmpty } from './flows/navigate-prompts/navigatePromptsToEmpty';
import { hoverOverLink } from './flows/link-hover-preview';
import { showFileTree } from './flows/file-tree/show-file-tree';
import { collapseExpandFileTree } from './flows/file-tree/collapse-file-tree';
import { showFileTooltip } from './flows/file-tree/show-file-tooltip';
import { triggerFileActions } from './flows/file-tree/trigger-file-action';
import { renderFileDetails } from './flows/file-tree/render-file-details';
import { renderFormElements } from './flows/form/render-form-elements';
import { disableForm } from './flows/form/disable-form';
import { removeForm } from './flows/form/remove-form';

describe('Open MynahUI', () => {
  beforeAll(async () => {
    const browserName = browser.browserType().name();
    const toMatchImageSnapshot = configureToMatchImageSnapshot({
      failureThreshold: 0.01,
      allowSizeMismatch: true,
      failureThresholdType: 'percent',
      storeReceivedOnFailure: true,
      customSnapshotsDir: `./__test__/__image_snapshots__/${browserName}`
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

  describe('Tabs', () => {
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

  describe('Quick command selector', () => {
    it('should render the quick command selector', async () => {
      await renderQuickPicks(page);
    });
    it('should close the quick command selector by clicking outside', async () => {
      await closeQuickPicks(page, 'blur');
    });
    it('should close the quick command selector by pressing escape', async () => {
      await closeQuickPicks(page, 'escape');
    });
    it('should filter quick command selector list', async () => {
      await filterQuickPicks(page);
    });
    it('should select quick command selector item by clicking', async () => {
      await selectQuickPicks(page, 'click');
    });
    it('should select quick command selector item with tab', async () => {
      await selectQuickPicks(page, 'Tab');
    });
    it('should select quick command selector item with space', async () => {
      await selectQuickPicks(page, 'Space');
    });
    it('should select quick command selector item with enter', async () => {
      await selectQuickPicks(page, 'Enter');
    });
  });

  describe('Context selector', () => {
    it('should render the context selector', async () => {
      await renderQuickPicks(page, 'context');
    });
    it('should close the context selector by clicking outside', async () => {
      await closeQuickPicks(page, 'blur', 'context');
    });
    it('should close the context selector by pressing escape', async () => {
      await closeQuickPicks(page, 'escape', 'context');
    });
    it('should filter context selector list', async () => {
      await filterQuickPicks(page, 'context');
    });
    it('should select context selector item by clicking', async () => {
      await selectQuickPicks(page, 'click', 'context');
    });
    it('should select context selector item with tab', async () => {
      await selectQuickPicks(page, 'Tab', 'context');
    });
    it('should select context selector item with space', async () => {
      await selectQuickPicks(page, 'Space', 'context');
    });
    it('should select context selector item with enter', async () => {
      await selectQuickPicks(page, 'Enter', 'context');
    });
  });

  describe('File tree', () => {
    it('should show file tree', async () => {
      await showFileTree(page);
    });

    it('should collapse and expand file in folders', async () => {
      await collapseExpandFileTree(page);
    });

    it('should show tooltip with file description on hover', async () => {
      await showFileTooltip(page);
    });

    it('should trigger default or sub action on click', async () => {
      await triggerFileActions(page);
    });

    it('should render file appearance based on its details', async () => {
      await renderFileDetails(page);
    });
  });

  it('should show link preview in tooltip on link hover', async () => {
    await hoverOverLink(page);
  });

  it('should render buttons on cards correctly', async () => {
    await renderButtons(page);
  });

  describe('Forms', () => {
    it('should render form elements correctly', async () => {
      await renderFormElements(page);
    });
    it('should disable forms on submit', async () => {
      await disableForm(page);
    });
    it('should remove form card when canceled', async () => {
      await removeForm(page);
    });
  });

  it('should keep the content inside window boundaries', async () => {
    await checkContentInsideWindowBoundaries(page);
  });

  it('should parse markdown', async () => {
    await parseMarkdown(page);
  });

  describe('Prompt navigation', () => {
    it('should navigate up to previous prompt', async () => {
      await navigatePromptsUp(page);
    });
    it('should navigate down to next prompt', async () => {
      await navigatePromptsDown(page);
    },
    20000);
    it('should navigate down to current empty prompt', async () => {
      await navigatePromptsToEmpty(page);
    });
  });
});
