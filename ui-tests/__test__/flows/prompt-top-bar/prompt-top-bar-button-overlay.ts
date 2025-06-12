import { expect, Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../../helpers';
import testIds from '../../../../src/helper/test-ids';

export const promptTopBarButtonOverlay = async (page: Page): Promise<void> => {
  // Set up the prompt top bar with a title and action button
  await page.evaluate(() => {
    const selectedTabId = window.mynahUI.getSelectedTabId();
    if (selectedTabId != null) {
      window.mynahUI.updateStore(selectedTabId, {
        promptTopBarTitle: 'Test Title',
        promptTopBarButton: {
          id: 'rules-button',
          text: 'Rules',
          icon: 'menu'
        }
      });
    }
  });

  await waitForAnimationEnd(page);

  // Click the top bar button to open the overlay
  const topBarButton = page.locator('.top-bar-button .mynah-button');
  await topBarButton.click();
  await waitForAnimationEnd(page);

  // Set up the overlay with sample data
  // Instead of returning the overlay object with functions, we'll create it in the browser context
  await page.evaluate(() => {
    const selectedTabId = window.mynahUI.getSelectedTabId();
    if (selectedTabId != null) {
      window.topBarOverlayController = window.mynahUI.openTopBarButtonOverlay({
        tabId: selectedTabId,
        topBarButtonOverlay: {
          list: [
            {
              groupName: 'Test Group',
              children: [
                {
                  id: 'test-item-1',
                  title: 'Test Item 1',
                  description: 'Description for test item 1'
                },
                {
                  id: 'test-item-2',
                  title: 'Test Item 2',
                  description: 'Description for test item 2'
                }
              ]
            }
          ]
        },
        onTopBarButtonOverlayGroupClick: () => {},
        onTopBarButtonOverlayItemClick: () => {}
      });
    }
  });

  await waitForAnimationEnd(page);

  // Check if the overlay is visible
  const actionOverlay = page.locator(getSelector(testIds.prompt.tobBarActionOverlay));
  expect(await actionOverlay.isVisible()).toBeTruthy();

  // Check if the group title is visible
  const groupTitle = page.locator('.mynah-detailed-list-group-title');
  expect(await groupTitle.isVisible()).toBeTruthy();

  // Take a screenshot of the overlay with the group
  expect(await actionOverlay.screenshot()).toMatchSnapshot();

  // Test the update function using the stored controller
  await page.evaluate(() => {
    // Use the stored controller to update the overlay
    window.topBarOverlayController.update({
      list: [
        {
          groupName: 'Updated Group',
          children: [
            {
              id: 'updated-item-1',
              title: 'Updated Item 1',
              description: 'Updated description'
            }
          ]
        }
      ]
    });
  });

  await waitForAnimationEnd(page);

  // Take a screenshot of the updated overlay
  expect(await actionOverlay.screenshot()).toMatchSnapshot();

  // Test the close function using the stored controller
  await page.evaluate(() => {
    // Use the stored controller to close the overlay
    window.topBarOverlayController.close();
  });

  await waitForAnimationEnd(page);

  // Verify the overlay is closed
  expect(await page.locator(getSelector(testIds.prompt.tobBarActionOverlay)).count()).toBe(0);
};
