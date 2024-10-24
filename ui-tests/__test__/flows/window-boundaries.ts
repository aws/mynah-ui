import { Page } from 'playwright/test';
import testIds from '../../../src/helper/test-ids';
import { DEFAULT_VIEWPORT, getOffsetHeight, getSelector, waitForAnimationEnd } from '../helpers';
import { clickToFollowup } from './click-followup';

export const checkContentInsideWindowBoundaries = async (page: Page): Promise<void> => {
  await page.locator(`${getSelector(testIds.prompt.input)}`).clear();

  // Close & open new tab
  await page.locator(`${getSelector(testIds.tabBar.tabOptionCloseButton)}`).click();
  await page.locator(`${getSelector(testIds.tabBar.tabAddButton)}`).click();

  await page.mouse.move(0, 0);
  const footerPanel = await page.waitForSelector(`${getSelector(testIds.prompt.footerInfo)}`);
  expect(footerPanel).toBeDefined();
  expect(getOffsetHeight(await footerPanel.boundingBox())).toBeLessThanOrEqual(page.viewportSize()?.height ?? 0);

  // Add content to create a scroll area
  await clickToFollowup(page, true);

  // Check if the footer element exceeds from bottom
  expect(getOffsetHeight(await footerPanel.boundingBox())).toBeLessThanOrEqual(page.viewportSize()?.height ?? 0);

  // Snap
  expect(await page.screenshot()).toMatchImageSnapshot();

  // Scroll to top to the init message
  await (await page.waitForSelector(`${getSelector(testIds.chatItem.type.answer)}[messageid="welcome-message"]`)).scrollIntoViewIfNeeded();

  // Check if the footer element exceeds from bottom
  expect(getOffsetHeight(await footerPanel.boundingBox())).toBeLessThanOrEqual(page.viewportSize()?.height ?? 0);

  // Update viewport size
  await page.setViewportSize({
    width: 350,
    height: 500
  });

  // The reason we're waiting for the animations for resize actions
  // is that we have a 1ms animation for the container which fixes the left screen edge shift for flex boxes
  await waitForAnimationEnd(page);

  // Check if the footer element exceeds from bottom
  expect(getOffsetHeight(await footerPanel.boundingBox())).toBeLessThanOrEqual(page.viewportSize()?.height ?? 0);

  // Snap
  expect(await page.screenshot()).toMatchImageSnapshot();

  // Set viewport size to
  await page.setViewportSize({
    width: 1,
    height: 1
  });
  // We don't need to wait here, we're just checking if the viewport width is changed or not
  expect(page.viewportSize()?.width).toBeLessThanOrEqual(1);

  // Revert viewport size
  await page.setViewportSize(DEFAULT_VIEWPORT);

  // The reason we're waiting for the animations for resize actions
  // is that we have a 1ms animation for the container which fixes the left screen edge shift for flex boxes
  await waitForAnimationEnd(page);

  // Check if the footer element exceeds from bottom
  expect(getOffsetHeight(await footerPanel.boundingBox())).toBeLessThanOrEqual(page.viewportSize()?.height ?? 0);

  // Snap
  expect(await page.screenshot()).toMatchImageSnapshot();
};
