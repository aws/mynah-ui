import { expect, Page } from 'playwright/test';
import { getSelector, normalizeText, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';

export const navigatePromptsFirstLastLineCheck = async (page: Page, skipScreenshots?: boolean): Promise<void> => {
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
  expect(normalizeText(await promptInput.innerText())).toBe(normalizeText(secondPrompt));

  // Input should remain the same as it is multiline
  await promptInput.press('ArrowDown');
  await waitForAnimationEnd(page);
  expect(normalizeText(await promptInput.innerText())).toBe(normalizeText(secondPrompt));

  // Go back to the first line
  await promptInput.press('ArrowUp');
  // Go to the beginning of the line
  await promptInput.press('ArrowUp');
  await waitForAnimationEnd(page);

  // Now that we're in the first line again, it should navigate to the first user prompt
  await promptInput.press('ArrowUp');
  await waitForAnimationEnd(page);
  expect(normalizeText(await promptInput.innerText())).toBe(normalizeText(firstPrompt));

  // Given that this input only has one line, we should be able to go down to prompt 2 immediately again, after going to the end of the text
  await promptInput.press('ArrowDown');
  await waitForAnimationEnd(page);
  await promptInput.press('ArrowDown');
  await waitForAnimationEnd(page);

  // The explicit \n is lost at the end, so we account for that as it is expected
  expect(normalizeText(await promptInput.innerText())).toBe(normalizeText(secondPrompt.replace('\n', '')));
};
