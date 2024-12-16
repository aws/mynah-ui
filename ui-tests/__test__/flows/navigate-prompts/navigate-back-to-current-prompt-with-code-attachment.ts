import { Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';
import { closeTab } from '../close-tab';
import { openNewTab } from '../open-new-tab';

export const navigateBackToCurrentPromptWithCodeAttachment = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  await closeTab(page, false, true);
  await openNewTab(page, false, true);

  await page.locator(`${getSelector(testIds.prompt.input)}`).fill('This is the first user prompt');
  await page.locator(`${getSelector(testIds.prompt.send)}`).click();
  await waitForAnimationEnd(page);

  await page.evaluate(() => {
    const selectedTabId = window.mynahUI.getSelectedTabId();
    if (selectedTabId != null) {
      window.mynahUI.addToUserPrompt(
        selectedTabId,
        'This is an unsent code attachment',
        'code',
      );
    }
  });
  await waitForAnimationEnd(page);

  let promptInput = await page.locator(`${getSelector(testIds.prompt.input)}`);
  await promptInput.press('ArrowUp');
  await waitForAnimationEnd(page);

  promptInput = await page.locator(`${getSelector(testIds.prompt.input)}`);
  await promptInput.press('ArrowDown');
  await waitForAnimationEnd(page);

  const codeAttachmentContent = (await page.locator(`${getSelector(testIds.prompt.attachment)}`).innerText()).trim();
  expect(codeAttachmentContent).toBe('This is an unsent code attachment');

  if (skipScreenshots !== true) {
    expect(await page.screenshot()).toMatchImageSnapshot();
  }
};
