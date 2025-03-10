import { Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';
import { closeTab } from '../close-tab';
import { openNewTab } from '../open-new-tab';

export const navigatePromptsFirstLastLineCheck = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
  await closeTab(page, false, true);
  await openNewTab(page, false, true);

  const firstPrompt = 'This is the first user prompt';
  const secondPrompt = 'This is the second user prompt.\nIt spans two separate lines.';

  const promptInput = page.locator(getSelector(testIds.prompt.input));
  const sendButton = page.locator(getSelector(testIds.prompt.send));

  await promptInput.fill(firstPrompt);
  await sendButton.click();
  await waitForAnimationEnd(page);

  await promptInput.fill(secondPrompt);
  await waitForAnimationEnd(page);

  // The input should start as the input with two lines
  console.log((await promptInput.innerText()) === secondPrompt);
  console.log(await promptInput.innerText());

  expect(await promptInput.innerText()).toBe(secondPrompt);

  // Input should remain the same as it is multiline
  await promptInput.press('ArrowDown');
  await waitForAnimationEnd(page);
  expect(await promptInput.innerText()).toBe(secondPrompt);

  // Go back to the first line
  await promptInput.press('ArrowUp');
  // Go to the beginning of the line
  await promptInput.press('ArrowUp');
  await waitForAnimationEnd(page);

  // Now that we're in the first line again, it should navigate to the first user prompt
  await promptInput.press('ArrowUp');
  await waitForAnimationEnd(page);
  expect(await promptInput.innerText()).toBe(firstPrompt);

  // Given that this input only has one line, we should be able to go down to prompt 2 immediately again, after going to the end of the text
  await promptInput.press('ArrowDown');
  await waitForAnimationEnd(page);
  await promptInput.press('ArrowDown');
  await waitForAnimationEnd(page);

  expect(await promptInput.innerText()).toBe(secondPrompt);
};
