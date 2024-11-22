
import { Page } from 'playwright';
import testIds from '../../../../src/helper/test-ids';
import { showFileTree } from './show-file-tree';
import { getSelector, waitForAnimationEnd } from '../../helpers';

export const showFileTooltip = async (page: Page): Promise<void> => {
  await showFileTree(page, true);

  const fileLocator = page.locator(getSelector(testIds.chatItem.fileTree.file));
  await waitForAnimationEnd(page);
  expect(await fileLocator.count()).toEqual(4);

  // Hover over a file to show description
  await fileLocator.first().hover();
  const tooltipLocator = page.locator(getSelector(testIds.chatItem.fileTree.fileTooltipWrapper));
  await waitForAnimationEnd(page);

  expect(await tooltipLocator.count()).toEqual(1);
  expect(await page.screenshot()).toMatchImageSnapshot();

  // Stop hovering over a file to hide description
  await page.mouse.move(0, 0);
  await waitForAnimationEnd(page);

  expect(await tooltipLocator.count()).toEqual(0);
  expect(await page.screenshot()).toMatchImageSnapshot();
};
