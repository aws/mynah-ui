import { Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';
import { closeTab } from '../close-tab';
import { openNewTab } from '../open-new-tab';

export const navigatePromptsFirstLastLineCheck = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  await closeTab(page, false, true);
  await openNewTab(page, false, true);

  const promptInput = page.locator(getSelector(testIds.prompt.input));
  const sendButton = page.locator(getSelector(testIds.prompt.send));

  await promptInput.fill('This is the first user prompt');
  await sendButton.click();
  await waitForAnimationEnd(page);

  await promptInput.fill('This is the second user prompt\nIt spans two separate lines.');
  await waitForAnimationEnd(page);

  // The input should start as the input with two lines
  expect(await promptInput.inputValue()).toBe('This is the second user prompt\nIt spans two separate lines.');

  // Input should remain the same and the cursor position should move to the first line
  await promptInput.press('ArrowUp');
  await waitForAnimationEnd(page);
  expect(await promptInput.inputValue()).toBe('This is the second user prompt\nIt spans two separate lines.');

  // Now that we're in the first line, it should navigate to the first user prompt
  await promptInput.press('ArrowUp');
  await waitForAnimationEnd(page);
  expect(await promptInput.inputValue()).toBe('This is the first user prompt');

  // Given that this input only has one line, we should be able to go down to prompt 2 immediately again
  await promptInput.press('ArrowDown');
  await waitForAnimationEnd(page);
  expect(await promptInput.inputValue()).toBe('This is the second user prompt\nIt spans two separate lines.');
};
