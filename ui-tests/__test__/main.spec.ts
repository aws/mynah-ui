// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="jest-playwright-preset" />
import path from 'path';
import { initRender } from './flows/init-render';
import { renderUserPrompt } from './flows/render-user-prompt';
import { clickToFollowup } from './flows/click-followup';
import { closeTab } from './flows/close-tab';
import { openNewTab } from './flows/open-new-tab';
import { DEFAULT_VIEWPORT, justWait } from './helpers';
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
import { hoverOverLink } from './flows/link-hover-preview';
import { showFileTree } from './flows/file-tree/show-file-tree';
import { collapseExpandFileTree } from './flows/file-tree/collapse-file-tree';
import { showFileTooltip } from './flows/file-tree/show-file-tooltip';
import { triggerFileActions } from './flows/file-tree/trigger-file-action';
import { renderFileDetails } from './flows/file-tree/render-file-details';
import { renderFormElements } from './flows/form/render-form-elements';
import { disableForm } from './flows/form/disable-form';
import { removeForm } from './flows/form/remove-form';
import { renderVoteButtons } from './flows/feedback-form/render-vote-buttons';
import { renderUpvoteResult } from './flows/feedback-form/render-upvote-result';
import { renderDownvoteResult } from './flows/feedback-form/render-downvote-result';
import { renderFeedbackForm } from './flows/feedback-form/render-feedback-form';
import { cancelFeedbackForm } from './flows/feedback-form/cancel-feedback-form';
import { submitFeedbackForm } from './flows/feedback-form/submit-feedback-form';
import { stayOnCurrentPrompt } from './flows/navigate-prompts/stay-on-current-prompt';
import { navigatePromptsDown } from './flows/navigate-prompts/navigate-prompts-down';
import { navigatePromptsUp } from './flows/navigate-prompts/navigate-prompts-up';
import { navigatePromptsToEmpty } from './flows/navigate-prompts/navigate-prompts-to-empty';
import { navigateBackToCurrentPrompt } from './flows/navigate-prompts/navigate-back-to-current-prompt';
import { navigateBackToCurrentPromptWithCodeAttachment } from './flows/navigate-prompts/navigate-back-to-current-prompt-with-code-attachment';
import { promptOptions } from './flows/prompt-options';
import { renderIcons } from './flows/icons';
import { renderMutedCards } from './flows/muted-cards';
import { checkContentInsideWindowBoundaries } from './flows/window-boundaries';
import { navigatePromptsFirstLastLineCheck } from './flows/navigate-prompts/navigate-prompts-first-last-line-check';
import { renderHeaders } from './flows/headers';
import { renderAndDismissCard } from './flows/dismissible-cards';

describe('Open MynahUI', () => {
  beforeEach(async () => {
    await page.setViewportSize(DEFAULT_VIEWPORT);
  });

  beforeAll(async () => {
    const browserName = browser.browserType().name();
    const toMatchImageSnapshot = configureToMatchImageSnapshot({
      failureThreshold: 0.03,
      allowSizeMismatch: true,
      failureThresholdType: 'percent',
      storeReceivedOnFailure: true,
      customSnapshotsDir: `./__test__/__image_snapshots__/${String(browserName)}`
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

  it('should show prompt options', async () => {
    await promptOptions(page);
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

  it('should render (custom) icons correctly', async () => {
    await renderIcons(page);
  });

  it('should render muted cards correctly', async () => {
    await renderMutedCards(page);
  });

  it('should render card headers correctly', async () => {
    await renderHeaders(page);
  });

  it('should render and remove dismissible cards', async () => {
    await renderAndDismissCard(page);
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
    25000);
    it('should navigate down to current empty prompt', async () => {
      await navigatePromptsToEmpty(page);
    });

    it.skip('should navigate up/down only if on first/last line', async () => {
      await navigatePromptsFirstLastLineCheck(page);
    });

    it('should stay on current prompt', async () => {
      await stayOnCurrentPrompt(page);
    });

    it.skip('should navigate back to current prompt', async () => {
      await navigateBackToCurrentPrompt(page);
    });

    it('should navigate back to current prompt with code attachment', async () => {
      await navigateBackToCurrentPromptWithCodeAttachment(page);
    }, 25000);
  });

  describe('Feedback form', () => {
    it('should render vote buttons', async () => {
      await renderVoteButtons(page);
    });
    it('should render upvote results', async () => {
      await renderUpvoteResult(page);
    });
    it('should render downvote results', async () => {
      await renderDownvoteResult(page);
    });
    it('should render feedback form', async () => {
      await renderFeedbackForm(page);
    });
    it('should cancel feedback form', async () => {
      await justWait(200);
      await cancelFeedbackForm(page);
    });
    it('should submit feedback form', async () => {
      await justWait(200);
      await submitFeedbackForm(page);
    });
  });
});
