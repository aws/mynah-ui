import { ElementHandle, Page } from 'playwright/test';
import fs from 'fs';

export const TEMP_SCREENSHOT_PATH = './temp-snapshot.png';

export async function waitForTransitionEnd (page: Page, element: string): Promise<void> {
  if(typeof element === 'string'){
    await page.evaluate(async (element: string | ElementHandle<Element>) => {
      return await new Promise<void>((resolve) => {
        let elm:any = element;
        if(typeof element === 'string'){
          elm = document.querySelector(element) as HTMLElement;
        }
        if (elm != null) {
          const onEnd = (): void => {
            elm.removeEventListener('transitionend', onEnd);
            setTimeout(()=>{
              resolve();
            }, 250);
          };
          elm.addEventListener('transitionend', onEnd);
        } else {
          resolve();
        }
      });
    }, element);
  }
}
