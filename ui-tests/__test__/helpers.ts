import { Page } from 'playwright/test';
import testIds from '../../src/helper/test-ids';
export const DEFAULT_VIEWPORT = {
  width: 500,
  height: 950
};

export async function waitForElementAnimationEnd (page: Page, selector: string): Promise<void> {
  if (typeof selector === 'string') {
    await page.locator(selector).evaluate(async (elm) => {
      return await new Promise<void>((resolve) => {
        if (elm != null) {
          const onEnd = (): void => {
            elm.removeEventListener('transitionend', onEnd);
            setTimeout(() => {
              resolve();
            }, 250);
          };
          const isAnimating = elm
            .getAnimations()
            .filter((animation) => {
              console.log(animation.playState);
              return animation.playState === 'running';
            });
          if (isAnimating != null) {
            elm.addEventListener('transitionend', onEnd);
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    });
  }
}

export async function waitForAllAnimationsEnd (page: Page): Promise<void> {
  await page.locator('#mynah-wrapper').evaluate(async (elm) => {
    return await new Promise<void>((resolve) => {
      if (elm != null) {
        // Start delayed, for the not started animations yet
        setTimeout(() => {
          let maxTimeout: ReturnType<typeof setTimeout>;
          const animationStack: boolean[] = [];
          const onEnd = (e: Event): void => {
            e.target?.removeEventListener('animationend', onEnd);
            e.target?.removeEventListener('transitionend', onEnd);
            animationStack.pop();
            if (animationStack.length === 0) {
              clearTimeout(maxTimeout);
              resolve();
            }
          };

          elm.getAnimations({ subtree: true })
            .forEach((animation) => {
              if (animation.playState === 'running') {
                animationStack.push(true);
                elm.addEventListener('transitionend', onEnd);
                elm.addEventListener('animationend', onEnd);
              }
            });

          if (animationStack.length === 0) {
            resolve();
          } else {
            maxTimeout = setTimeout(() => {
              clearTimeout(maxTimeout);
              resolve();
            }, 5000);
          }
        }, 500);
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
  return `[${testIds.selector}="${selector}"]`;
}
