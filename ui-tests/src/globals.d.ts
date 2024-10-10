import { MynahUI } from '@aws/mynah-ui';

declare global {
  interface Window {
    mynahUI: MynahUI;
  }
}
