import { expect, Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd, justWait } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';

export const promptTopBarTitle = async (page: Page): Promise<void> => {
  // Set up the prompt top bar with a title and context commands
  await page.evaluate(() => {
    const selectedTabId = window.mynahUI.getSelectedTabId();
    if (selectedTabId != null) {
      window.mynahUI.updateStore(selectedTabId, {
        promptTopBarTitle: '@Pin Context',
        contextCommands: [
          {
            commands: [
              {
                command: '@workspace',
                placeholder: 'Yes, you selected workspace :P',
                description: 'Reference all code in workspace.',
              },
              {
                command: 'image',
                icon: 'image',
                description: 'Add an image to the context',
                placeholder: 'Select an image file'
              },
              {
                command: 'folder',
                icon: 'folder',
                children: [
                  {
                    groupName: 'Folders',
                    commands: [
                      {
                        command: 'src',
                        icon: 'folder',
                        children: [
                          {
                            groupName: 'src/',
                            commands: [
                              {
                                command: 'index.ts',
                                icon: 'file',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        command: 'main',
                        description: './src/',
                        icon: 'folder',
                      },
                      {
                        command: 'components',
                        description: './src/',
                        icon: 'folder',
                      },
                      {
                        command: 'helper',
                        description: './src/',
                        icon: 'folder',
                      },
                      {
                        command: 'src',
                        description: './example/',
                        icon: 'folder',
                      },
                    ],
                  },
                ],
                placeholder: 'Mention a specific folder',
                description: 'Include entire folder as context',
              },
              {
                command: 'file',
                icon: 'file',
                children: [
                  {
                    groupName: 'Files',
                    commands: [
                      {
                        command: 'monarch.ts',
                        description: 'spring-boot-template/.github/workflows/p-openapi.yaml',
                        icon: 'file',
                      },
                      {
                        command: 'main.ts',
                        description: './src/',
                        icon: 'file',
                      },
                      {
                        command: 'button.ts',
                        description: './src/components/',
                        icon: 'file',
                      },
                      {
                        command: 'ex-dom.ts',
                        description: './src/helper/',
                        icon: 'file',
                      },
                      {
                        command: 'dom.ts',
                        description: './src/helper/',
                        icon: 'file',
                      },
                      {
                        command: '_dark.scss',
                        description: './src/styles/',
                        icon: 'file',
                        // add route just to check if it returns back
                        route: [ 'src', 'styles' ],
                      },
                    ],
                  },
                ],
                placeholder: 'Mention a specific file',
                description: 'Add a file to context',
              },
              {
                command: 'symbols',
                icon: 'code-block',
                children: [
                  {
                    groupName: 'Symbols',
                    commands: [
                      {
                        command: 'DomBuilder',
                        icon: 'code-block',
                        description: 'The DomGeneration function in dom.ts file',
                      },
                      ...Array(100_000)
                        .fill(null)
                        .map((_, i) => ({
                          command: `item${i}`,
                          description: `./src/${i}`,
                          icon: 'code-block' as any,
                        })),
                    ],
                  },
                ],
                placeholder: 'Select a symbol',
                description: 'After that mention a specific file/folder, or leave blank for full project!',
              },
              {
                command: 'prompts',
                icon: 'flash',
                description: 'Saved prompts, to reuse them in your current prompt',
                children: [
                  {
                    groupName: 'Prompts',
                    actions: [
                      {
                        id: 'add-new-prompt',
                        icon: 'plus',
                        text: 'Add',
                        description: 'Add new prompt',
                      },
                    ],
                    commands: [
                      {
                        command: 'python_expert',
                        icon: 'chat',
                        description: 'Expert on python stuff',
                      },
                      {
                        command: 'javascript_expert',
                        icon: 'chat',
                        description: 'Expert on Javascript and typescript',
                      },
                      {
                        command: 'Add Prompt',
                        icon: 'plus',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
    }
  });

  await waitForAnimationEnd(page);

  // Verify the top bar title is visible
  const topBarTitle = page.locator(getSelector(testIds.prompt.topBarTitle));
  expect(await topBarTitle.isVisible()).toBeTruthy();

  // Click on the top bar title to open the context selector
  await topBarTitle.click();
  await waitForAnimationEnd(page);

  // Wait for the overlay to appear
  await justWait(500);

  // Verify the quick picks overlay is visible
  const quickPicksWrapper = page.locator(getSelector(testIds.prompt.quickPicksWrapper));
  expect(await quickPicksWrapper.isVisible()).toBeTruthy();

  // Take screenshot of the opened context selector
  expect(await quickPicksWrapper.screenshot()).toMatchSnapshot('context-selector-opened.png');

  // Verify that we can see the groups and items
  const quickPickItems = page.locator(getSelector(testIds.prompt.quickPickItem));
  expect(await quickPickItems.count()).toBeGreaterThan(0);

  // Verify the search filter input is present and focused
  const searchInput = page.getByRole('textbox', { name: 'Search context' });
  await expect(searchInput).toBeFocused();
  expect(await searchInput.isVisible()).toBeTruthy();
  expect(await searchInput.getAttribute('placeholder')).toBe('Search context');

  // Type in the search filter to filter items
  await searchInput.fill('folder');
  await waitForAnimationEnd(page);

  // Take screenshot after filtering
  expect(await quickPicksWrapper.screenshot()).toMatchSnapshot('context-selector-filtered.png');

  // Verify that only folder-related items are shown
  const filteredItems = await quickPickItems.allInnerTexts();
  expect(filteredItems.some(text => text.includes('folder'))).toBeTruthy();
  expect(filteredItems.some(text => text.includes('file'))).toBeFalsy();

  // Clear the search and search for an item with children
  await searchInput.clear();
  await searchInput.fill('folder');
  await waitForAnimationEnd(page);

  // Take screenshot of filtered results showing folder
  expect(await quickPicksWrapper.screenshot()).toMatchSnapshot('context-selector-folder-filtered.png');

  // Click on the folder item (which has children)
  const folderItem = page.locator(getSelector(testIds.prompt.quickPickItem)).filter({ hasText: 'folder' });
  await folderItem.click();
  await waitForAnimationEnd(page);

  // Verify that the children are now shown (Folders group)
  const childItems = page.locator(getSelector(testIds.prompt.quickPickItem));
  const childTexts = await childItems.allInnerTexts();
  expect(childTexts.some(text => text.includes('src'))).toBeTruthy();
  expect(childTexts.some(text => text.includes('main'))).toBeTruthy();
  expect(childTexts.some(text => text.includes('components'))).toBeTruthy();

  // Take screenshot showing the children
  expect(await quickPicksWrapper.screenshot()).toMatchSnapshot('context-selector-children-shown.png');

  // Select the 'src' item which has further children
  const srcItem = page.locator(getSelector(testIds.prompt.quickPickItem)).filter({ hasText: 'src' }).first();
  await srcItem.click();
  await waitForAnimationEnd(page);

  // Verify that the nested children are now shown (src/ group with index.ts)
  const nestedChildItems = page.locator(getSelector(testIds.prompt.quickPickItem));
  const nestedChildTexts = await nestedChildItems.allInnerTexts();
  expect(nestedChildTexts.some(text => text.includes('index.ts'))).toBeTruthy();

  // Take screenshot showing the nested children
  expect(await quickPicksWrapper.screenshot()).toMatchSnapshot('context-selector-nested-children-shown.png');

  // Select the index.ts file
  const indexTsItem = page.locator(getSelector(testIds.prompt.quickPickItem)).filter({ hasText: 'index.ts' });
  await indexTsItem.click();
  await waitForAnimationEnd(page);

  // Verify the overlay is closed after selection
  expect(await page.locator(getSelector(testIds.prompt.quickPicksWrapper)).count()).toBe(0);

  // Verify that the selected context item appears in the top bar
  const contextPills = page.locator(getSelector(testIds.prompt.topBarContextPill));
  expect(await contextPills.count()).toBe(1);

  const pillText = await contextPills.first().innerText();
  expect(pillText).toContain('index.ts');

  // Test keyboard navigation to select nested children
  await topBarTitle.click();
  await waitForAnimationEnd(page);

  // Clear search and navigate to folder item using arrow keys
  const searchInputKeyboard = page.getByRole('textbox', { name: 'Search context' });
  await searchInputKeyboard.clear();
  await searchInputKeyboard.fill('folder');
  await waitForAnimationEnd(page);

  // Use arrow keys to navigate to the folder item and press Enter to select it
  await page.keyboard.press('ArrowDown'); // Navigate to first item (folder)
  await waitForAnimationEnd(page);
  await page.keyboard.press('Enter'); // Select folder item to view its children
  await waitForAnimationEnd(page);

  // Verify that the children are now shown (Folders group)
  const keyboardChildItems = page.locator(getSelector(testIds.prompt.quickPickItem));
  const keyboardChildTexts = await keyboardChildItems.allInnerTexts();
  expect(keyboardChildTexts.some(text => text.includes('src'))).toBeTruthy();
  expect(keyboardChildTexts.some(text => text.includes('main'))).toBeTruthy();
  expect(keyboardChildTexts.some(text => text.includes('components'))).toBeTruthy();

  // Navigate to 'src' item using arrow keys and select it to view nested children
  await page.keyboard.press('ArrowDown'); // Navigate to src item
  await waitForAnimationEnd(page);
  await page.keyboard.press('Enter'); // Select src item to view its nested children
  await waitForAnimationEnd(page);

  // Verify that the nested children are now shown using keyboard navigation
  const keyboardNestedChildItems = page.locator(getSelector(testIds.prompt.quickPickItem));
  const keyboardNestedChildTexts = await keyboardNestedChildItems.allInnerTexts();
  expect(keyboardNestedChildTexts.some(text => text.includes('index.ts'))).toBeTruthy();

  // Take screenshot showing the nested children selected via keyboard
  expect(await quickPicksWrapper.screenshot()).toMatchSnapshot('context-selector-nested-children-keyboard.png');

  // Navigate to index.ts and select it using keyboard
  await page.keyboard.press('ArrowDown'); // Navigate to index.ts
  await waitForAnimationEnd(page);
  await page.keyboard.press('Enter'); // Select index.ts
  await waitForAnimationEnd(page);

  // Verify the overlay is closed after keyboard selection
  expect(await page.locator(getSelector(testIds.prompt.quickPicksWrapper)).count()).toBe(0);

  // Verify that another context item was added to the top bar (should now have 2 items total)
  expect(await contextPills.count()).toBe(2);

  const keyboardPillText = await contextPills.last().innerText();
  expect(keyboardPillText).toContain('index.ts');

  // Test selecting a different type of item - open context selector again
  await topBarTitle.click();
  await waitForAnimationEnd(page);

  // Search for and select a file item
  const searchInput2 = page.getByRole('textbox', { name: 'Search context' });
  await expect(searchInput2).toBeFocused();
  await searchInput2.fill('file');
  await waitForAnimationEnd(page);

  // Click on the file item
  const fileItem = page.locator(getSelector(testIds.prompt.quickPickItem)).filter({ hasText: 'file' });
  await fileItem.click();
  await waitForAnimationEnd(page);

  // Select one of the file items (main.ts)
  const mainTsItem = page.locator(getSelector(testIds.prompt.quickPickItem)).filter({ hasText: 'main.ts' });
  await mainTsItem.click();
  await waitForAnimationEnd(page);

  // Verify another context item was added (should now have 3 total: first index.ts, keyboard index.ts, and main.ts)
  expect(await contextPills.count()).toBe(3);

  // Test keyboard navigation by opening the context selector again
  await topBarTitle.click();
  await waitForAnimationEnd(page);

  // Use arrow keys to navigate
  await page.keyboard.press('ArrowDown');
  await waitForAnimationEnd(page);

  // Take screenshot showing keyboard navigation
  expect(await quickPicksWrapper.screenshot()).toMatchSnapshot('context-selector-navigation.png');

  // Press Escape to close without selecting
  await page.keyboard.press('Escape');
  await waitForAnimationEnd(page);

  // Verify the overlay is closed
  expect(await page.locator(getSelector(testIds.prompt.quickPicksWrapper)).count()).toBe(0);
};
