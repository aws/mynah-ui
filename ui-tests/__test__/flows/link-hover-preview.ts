import { Page } from 'playwright/test';
import { getSelector, waitForAnimationEnd } from '../helpers';
import testIds from '../../../src/helper/test-ids';
import { closeTab } from './close-tab';
import { openNewTab } from './open-new-tab';

export const hoverOverLink = async (page: Page): Promise<void> => {
  await closeTab(page, false, true);
  await openNewTab(page, false, true);

  const mockSource =
    {
      url: 'https://github.com/aws/mynah-ui',
      title: 'Mock Source 1',
      body: `## Perque adacto fugio

Invectae moribundo et eripiet sine, adventu tolli *liquidas* satiatur Perseus;
**locus**, nato! More dei timeas dextra Granico neu corpus simul *operique*!
Fecit mea, sua, hoc vias proles pallebant illa est populosque festa manetque
clamato nescisse.`,
    };

  await page.evaluate((source) => {
    const selectedTabId = window.mynahUI.getSelectedTabId();
    if (selectedTabId != null) {
      window.mynahUI.updateStore(selectedTabId, {
        chatItems: [],
      });

      window.mynahUI.addChatItem(selectedTabId, {
        type: 'answer' as any,
        body: 'Text',
        relatedContent: {
          content: [ source ],
          title: 'Sources',
        },
      });
    }
  }, mockSource);
  await waitForAnimationEnd(page);

  expect(await page.screenshot()).toMatchImageSnapshot();

  const linkWrapperLocator = page.locator(getSelector(testIds.chatItem.relatedLinks.linkWrapper));
  await linkWrapperLocator.hover();
  await waitForAnimationEnd(page);

  expect(await page.screenshot()).toMatchImageSnapshot();
  expect(await page.locator(getSelector(testIds.chatItem.relatedLinks.linkPreviewOverlay)).count()).toEqual(1);
  expect(await page.locator(getSelector(testIds.chatItem.relatedLinks.linkPreviewOverlayCard)).count()).toEqual(1);

  page.mouse.move(0, 0);
  await waitForAnimationEnd(page);

  expect(await page.screenshot()).toMatchImageSnapshot();
  expect(await page.locator(getSelector(testIds.chatItem.relatedLinks.linkPreviewOverlay)).count()).toEqual(0);
  expect(await page.locator(getSelector(testIds.chatItem.relatedLinks.linkPreviewOverlayCard)).count()).toEqual(0);
};
