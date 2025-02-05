import { test } from '@playwright/test';
import path from 'path';
import { initRender } from './flows/init-render';
import { renderUserPrompt } from './flows/render-user-prompt';
import { clickToFollowup } from './flows/click-followup';
import { closeTab } from './flows/close-tab';
import { openNewTab } from './flows/open-new-tab';
import { checkContentInsideWindowBoundaries } from './flows/window-boundaries';
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
import { navigatePromptsDown } from './flows/navigate-prompts/navigate-prompts-down';
import { navigatePromptsUp } from './flows/navigate-prompts/navigate-prompts-up';
import { navigatePromptsToEmpty } from './flows/navigate-prompts/navigate-prompts-to-empty';
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
import { navigateBackToCurrentPrompt } from './flows/navigate-prompts/navigate-back-to-current-prompt';
import { navigateBackToCurrentPromptWithCodeAttachment } from './flows/navigate-prompts/navigate-back-to-current-prompt-with-code-attachment';
import { navigatePromptsFirstLastLineCheck } from './flows/navigate-prompts/navigate-prompts-first-last-line-check';
import { DEFAULT_VIEWPORT } from './helpers';

test.describe('Open MynahUI', () => {
  test.beforeEach(async ({ page }) => {
    const htmlFilePath: string = path.join(__dirname, '../dist/index.html');
    const fileUrl = `file://${htmlFilePath}`;
    await page.setViewportSize(DEFAULT_VIEWPORT);
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
  });

  test('should render initial data', async ({ page }) => {
    await initRender(page);
  });

  test('should render welcome structure', async ({ page }) => {
    await welcomeMode(page);
  });

  test('should show progress indicator', async ({ page }) => {
    await progressIndicator(page);
  });

  test('should render user prompt', async ({ page }) => {
    await renderUserPrompt(page);
  });

  test('should render new card when followup click', async ({ page }) => {
    await clickToFollowup(page);
  });

  test('should render character limit counter', async ({ page }) => {
    await renderCharacterCount(page);
  });

  test('should render information cards correctly', async ({ page }) => {
    await renderInformationCard(page);
  });

  test('should render tabbed cards correctly', async ({ page }) => {
    await renderTabbedCard(page);
  });

  test('should show link preview in tooltip on link hover', async ({ page }) => {
    await hoverOverLink(page);
  });

  test('should render buttons on cards correctly', async ({ page }) => {
    await renderButtons(page);
  });

  test('should keep the content inside window boundaries', async ({ page }) => {
    await checkContentInsideWindowBoundaries(page);
  });

  test('should parse markdown', async ({ page }) => {
    await parseMarkdown(page);
  });

  test.describe('Forms', () => {
    test('should render form elements correctly', async ({ page }) => {
      await renderFormElements(page);
    });
    test('should disable forms on submit', async ({ page }) => {
      await disableForm(page);
    });
    test('should remove form card when canceled', async ({ page }) => {
      await removeForm(page);
    });
  });

  test.describe('Quick command selector', () => {
    test('should render the quick command selector', async ({ page }) => {
      await renderQuickPicks(page);
    });
    test('should close the quick command selector by clicking outside', async ({ page }) => {
      await closeQuickPicks(page, 'blur');
    });
    test('should close the quick command selector by pressing escape', async ({ page }) => {
      await closeQuickPicks(page, 'escape');
    });
    test('should filter quick command selector list', async ({ page }) => {
      await filterQuickPicks(page);
    });
    test('should select quick command selector item by clicking', async ({ page }) => {
      await selectQuickPicks(page, 'click');
    });
    test('should select quick command selector item with tab', async ({ page }) => {
      await selectQuickPicks(page, 'Tab');
    });
    test('should select quick command selector item with space', async ({ page }) => {
      await selectQuickPicks(page, 'Space');
    });
    test('should select quick command selector item with enter', async ({ page }) => {
      await selectQuickPicks(page, 'Enter');
    });
  });

  test.describe('Context selector', () => {
    test('should render the context selector', async ({ page }) => {
      await renderQuickPicks(page, 'context');
    });
    test('should close the context selector by clicking outside', async ({ page }) => {
      await closeQuickPicks(page, 'blur', 'context');
    });
    test('should close the context selector by pressing escape', async ({ page }) => {
      await closeQuickPicks(page, 'escape', 'context');
    });
    test('should filter context selector list', async ({ page }) => {
      await filterQuickPicks(page, 'context');
    });
    test('should select context selector item by clicking', async ({ page }) => {
      await selectQuickPicks(page, 'click', 'context');
    });
    test('should select context selector item with tab', async ({ page }) => {
      await selectQuickPicks(page, 'Tab', 'context');
    });
    test('should select context selector item with space', async ({ page }) => {
      await selectQuickPicks(page, 'Space', 'context');
    });
    test('should select context selector item with enter', async ({ page }) => {
      await selectQuickPicks(page, 'Enter', 'context');
    });
  });

  test.describe('File tree', () => {
    test('should show file tree', async ({ page }) => {
      await showFileTree(page);
    });

    test('should collapse and expand file in folders', async ({ page }) => {
      await collapseExpandFileTree(page);
    });

    test('should show tooltip with file description on hover', async ({ page }) => {
      await showFileTooltip(page);
    });

    test('should trigger default or sub action on click', async ({ page }) => {
      await triggerFileActions(page);
    });

    test('should render file appearance based on its details', async ({ page }) => {
      await renderFileDetails(page);
    });
  });

  test.describe('Prompt navigation', () => {
    test('should navigate up to previous prompt', async ({ page }) => {
      await navigatePromptsUp(page);
    });
    test('should navigate down to next prompt', async ({ page }) => {
      test.setTimeout(25000);
      await navigatePromptsDown(page);
    });
    test('should navigate down to current empty prompt', async ({ page }) => {
      await navigatePromptsToEmpty(page);
    });
    test('should navigate up/down only if on first/last line', async ({ page }) => {
      await navigatePromptsFirstLastLineCheck(page);
    });

    test('should stay on current prompt', async ({ page }) => {
      await stayOnCurrentPrompt(page);
    });

    test('should navigate back to current prompt', async ({ page }) => {
      await navigateBackToCurrentPrompt(page);
    });

    test('should navigate back to current prompt with code attachment', async ({ page }) => {
      await navigateBackToCurrentPromptWithCodeAttachment(page);
    });
  });

  test.describe('Feedback form', () => {
    test('should render vote buttons', async ({ page }) => {
      await renderVoteButtons(page);
    });
    test('should render upvote results', async ({ page }) => {
      await renderUpvoteResult(page);
    });
    test('should render downvote results', async ({ page }) => {
      await renderDownvoteResult(page);
    });
    test('should render feedback form', async ({ page }) => {
      await renderFeedbackForm(page);
    });
    test('should cancel feedback form', async ({ page }) => {
      await cancelFeedbackForm(page);
    });
    test('should submit feedback form', async ({ page }) => {
      await submitFeedbackForm(page);
    });
  });

  test.describe('Tabs', () => {
    test('should close the tab', async ({ page }) => {
      await closeTab(page);
    });

    test('should open a new the tab', async ({ page }) => {
      await openNewTab(page);
    });

    test('should close the tab with middle click', async ({ page }) => {
      await closeTab(page, true, true);
    });

    test('should open a new tab with double click', async ({ page }) => {
      await openNewTab(page, true, true);
    });
  });
});
