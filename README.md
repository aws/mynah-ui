# Mynah UI

This package is the whole UI of AWS Codewhisperer Chat extension UI for Web, VSCode and Intellij IDEs written in typescript without any framework or third-party UI library dependency. Purpose of the separated UI is to handle the interactions and look & feel of the UI from one single source. 

## How to install

``` console
npm install @aws/mynah-ui
```

## How to use
When you import `@aws/mynah-ui` it provides you the `MynahUI` class to generate a new all-in-one object to create the UI. You can connect to user interaction events through the initial properties have provide to the UI.

``` typescript
import { MynahUI } from '@aws/mynah-ui';

export const createMynahUI = () => {
    const mynahUI = new MynahUI({
        rootSelector?: string;
        defaults?: MynahUITabStoreTab;
        tabs?: MynahUITabStoreModel;
        config?: ConfigModel;
        onShowMoreWebResultsClick?: (tabId: string, messageId: string) => void;
        onReady?: () => void;
        onVote?: (tabId: string, messageId: string, vote: RelevancyVoteType) => void;
        onStopChatResponse?: (tabId: string) => void;
        onResetStore?: (tabId: string) => void;
        onChatPrompt?: (tabId: string, prompt: ChatPrompt) => void;
        onFollowUpClicked?: (tabId: string, messageId: string, followUp: ChatItemFollowUp) => void;
        onTabChange?: (tabId: string) => void;
        onTabAdd?: (tabId: string) => void;
        onTabRemove?: (tabId: string) => void;
        onChatItemEngagement?: (tabId: string, messageId: string, engagement: Engagement) => void;
        onCopyCodeToClipboard?: (tabId: string, messageId: string, code?: string, type?: CodeSelectionType, referenceTrackerInformation?: ReferenceTrackerInformation[]) => void;
        onCodeInsertToCursorPosition?: (tabId: string, messageId: string, code?: string, type?: CodeSelectionType, referenceTrackerInformation?: ReferenceTrackerInformation[]) => void;
        onSourceLinkClick?: (tabId: string, messageId: string, link: string, mouseEvent?: MouseEvent) => void;
        onLinkClick?: (tabId: string, messageId: string, link: string, mouseEvent?: MouseEvent) => void;
        onSendFeedback?: (tabId: string, feedbackPayload: FeedbackPayload) => void;
        onOpenDiff?: (tabId: string, filePath: string, deleted: boolean, messageId?: string) => void;
    });
}
```

MynahUI also provides some accessible functions to help developer show a notification or more importantly update the UI state data store. When you update the data store, it will automatically rerender the parts that is subscribed to that particular data part.

``` typescript
import { MynahUI } from '@aws/mynah-ui';

export const createMynahUI = () => {
    let mynahUI:MynahUI;
    ...
}
```

In addition to MynahUI class, there are also some exported type definitions that can be handy for function returns or proper usage of arguments.

``` typescript
import {
  FeedbackPayload,
  RelevancyVoteType,
  EngagementType,
  Engagement,
  MynahUIDataModel,
  NotificationType,
  ChatItem,
  ChatItemFollowUp,
  ChatItemType,
  ChatPrompt,
  SourceLink,
  MynahIcons
} from '@aws/mynah-ui';
```

## Styles

Almost all css parameters are connected to [css custom properties](https://www.w3.org/TR/css-variables-1/) to let developer easily adjust desired parameters.
Provide your own styles file after the import of MynahUI.
``` typescript
import { MynahUI } from '@aws/mynah-ui';
import './custom-style.css';
```

You can provide any of the following css custom property values:
``` css
:root {
    --mynah-font-family: ...;
    font-size: ...;
    font-family: ...;
    --mynah-max-width: ...;
    --mynah-sizing-base: ...;
    --mynah-sizing-half: ...;
    --mynah-sizing-1: ...;
    --mynah-sizing-2: ...;
    --mynah-sizing-3: ...;
    --mynah-sizing-4: ...;
    --mynah-sizing-5: ...;
    --mynah-sizing-6: ...;
    --mynah-sizing-7: ...;
    --mynah-sizing-8: ...;
    --mynah-sizing-9: ...;
    --mynah-sizing-10: ...;
    --mynah-sizing-11: ...;
    --mynah-sizing-12: ...;
    --mynah-sizing-13: ...;
    --mynah-sizing-14: ...;
    --mynah-sizing-15: ...;
    --mynah-sizing-16: ...;
    --mynah-sizing-17: ...;
    --mynah-sizing-18: ...;
    --mynah-button-border-width: ...;
    --mynah-border-width: ...;

    --mynah-color-text-default: ...;
    --mynah-color-text-strong: ...;
    --mynah-color-text-weak: ...;
    --mynah-color-text-link: ...;
    --mynah-color-text-input: ...;

    --mynah-color-bg: ...;
    --mynah-color-bg-alt: ...;
    --mynah-color-tab-active: ...;
    --mynah-color-light: ...;

    --mynah-color-deep: ...;
    --mynah-color-deep-reverse: ...;
    --mynah-color-border-default: ...;
    --mynah-color-input-bg: ...;

    --mynah-color-highlight: ...;
    --mynah-color-highlight-text: ...;

    --mynah-color-context-must-contain: ...;
    --mynah-color-context-should-contain: ...;
    --mynah-color-context-must-not-contain: ...;
    --mynah-color-context-reverse: ...;
    --mynah-color-context-filter: ...;

    --mynah-color-syntax-bg: ...;
    --mynah-color-syntax-variable: ...;
    --mynah-color-syntax-function: ...;
    --mynah-color-syntax-operator: ...;
    --mynah-color-syntax-attr-value: ...;
    --mynah-color-syntax-attr: ...;
    --mynah-color-syntax-property: ...;
    --mynah-color-syntax-comment: ...;
    --mynah-color-syntax-code: ...;
    --mynah-syntax-code-font-family: ...;
    --mynah-syntax-code-font-size: ...;

    --mynah-color-status-info: ...;
    --mynah-color-status-success: ...;
    --mynah-color-status-warning: ...;
    --mynah-color-status-error: ...;

    --mynah-color-button: ...;
    --mynah-color-button-reverse: ...;

    --mynah-color-alternate: ...;
    --mynah-color-alternate-reverse: ...;

    --mynah-color-code-bg: ...;
    --mynah-color-code-text: ...;

    --mynah-color-main: ...;
    --mynah-color-main-reverse: ...;

    --mynah-card-bg: ...;

    --mynah-shadow-generic: ...;
    --mynah-shadow-card: ...;
    --mynah-shadow-card-more: ...;
    --mynah-shadow-card-active: ...;
    --mynah-shadow-prioritization-menu: ...;
    --mynah-shadow-feedback-form: ...;

    --mynah-font-size-xxsmall: ...;
    --mynah-font-size-xsmall: ...;
    --mynah-font-size-small: ...;
    --mynah-font-size-medium: ...;
    --mynah-font-size-large: ...;
    --mynah-font-size-xlarge: ...;

    --mynah-card-radius: ...;
    --mynah-button-radius: ...;

    --mynah-bottom-panel-transition: ...;
    --mynah-very-short-transition: ...;
    --mynah-short-transition-transform: ...;
    --mynah-long-transition: ...;
    --mynah-pretty-long-transition: ...;
    --mynah-very-long-transition: ...;
    --mynah-short-transition: ...;
    --mynah-short-transition-rev: ...;
    --mynah-short-transition-rev-opacity: ...;
    --mynah-short-transition-reflection: ...;
    --mynah-short-transition-turbo: ...;
    --mynah-short-transition-turbo-bounce: ...;
    --mynah-short-transition-bounce: ...;

    --mynah-mask-image:  ...;
    --mynah-mask-image-rev: ...;
    --mynah-mask-image-main: ...;
    --mynah-mask-image-main-rev: ...;
    --mynah-mask-image-skeleton: ...;

    --mynah-policy-group-filter: ...;
}
```

## Supported browsers
**MynahUI** <em>-because of it's css structure-</em> only supports ever-green browsers including webkit-base WebUI renderers.


## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.

