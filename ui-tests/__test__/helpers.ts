import { Page } from 'playwright/test';
import testIds from '../../src/helper/test-ids';
export const DEFAULT_VIEWPORT = {
  width: 500,
  height: 950
};
export async function waitForAnimationEnd (page: Page, selector?: string): Promise<void> {
  await page.locator(selector ?? `${getSelector(testIds.chat.wrapper)}:not(.loading)`).evaluate(async (elm) => {
    return await new Promise<void>((resolve) => {
      if (elm != null) {
        // Start delayed, for the not started animations yet
        setTimeout(() => {
          const animationStateCheckInterval: ReturnType<typeof setInterval> = setInterval(() => {
            if (elm.getAnimations({ subtree: true })
              .find((animation) => animation.playState === 'running') == null) {
              clearInterval(animationStateCheckInterval);
              resolve();
            }
          }, 200);
        }, 700);
      } else {
        resolve();
      }
    });
  });
}

export async function justWait (duration: number): Promise<void> {
  return await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}

export function getSelector (selector: string): string {
  return `css=[${testIds.selector}="${selector}"]`;
}
