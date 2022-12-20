# Mynah UI

This package is the whole UI of AWS Tookit Mynah extension UI for VSCode and Intellij IDEs written in typescript without and framework and UI library dependency. Purpose of the separated UI is to handle the interactions and look & feel of the UI from one single source. 

## How to install

``` console
npm install @aws/mynah-ui
```

## How to use
When you import `@aws/mynah-ui` it provides you the `MynahUI` class to generate a new all-in-one object to create the UI. However, you have to to provide 2 arguments to let the UI work properly.

``` typescript
import { MynahUI } from '@aws/mynah-ui';

export const createMynahUI = () => {
    new MynahUI({
        // You have to provide a connector to let the UI call for requests. 
        // See "ServiceConnector" type for mandatory and optional public functions
        serviceConnector: new ServiceConnector({
            postMessageHandler: message => {
                // post message handling
            }
        }),
        // You have to provide a state manager to locally store temporary data.
        // If you don't need to store panelID or temporary information, 
        // you can leave the contents of the get and set state functions empty.
        stateManager: {
            getState: (): Record<string, any> => {
                // return all recorded items
            },
            setState: state => {
                // set all items at once
            }
        },
    });
}
```

In addition to MynahUI class, there are also some exported type definitions that might be helpful for function returns in ServiceConnector.

``` typescript
export {
  AutocompleteItem,
  SearchPayloadCodeSelection,
  FeedbackPayload,
  RelevancyVoteType,
  LiveSearchState,
  SearchPayload,
  Suggestion,
  ContextType,
  SearchHistoryItem,
  EngagementType,
  SuggestionEngagement,
} from './static';
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
    font-size: 1rem;
    font-family: ...;

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

    --mynah-color-text-...: ...;
    --mynah-color-text-strong: ...;
    --mynah-color-text-weak: ...;
    --mynah-color-text-link: ...;
    --mynah-color-text-input: ...;

    --mynah-color-bg: ...;
    --mynah-color-light: ...;

    --mynah-color-deep: ...;
    --mynah-color-deep-reverse: ...;
    --mynah-color-border-...: ...;
    --mynah-color-input-bg: ...;

    --mynah-color-highlight: ...;
    --mynah-color-highlight-text: ...;

    --mynah-color-context-must-contain: ...;
    --mynah-color-context-should-contain: ...;
    --mynah-color-context-must-not-contain: ...;
    --mynah-color-context-reverse: ...;
    --mynah-color-context-filter: ...;

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

    --mynah-font-size-xsmall: ...;
    --mynah-font-size-small: ...;
    --mynah-font-size-medium: ...;
    --mynah-font-size-large: ...;
    --mynah-font-size-xlarge: ...;

    --mynah-card-radius: ...;
    --mynah-button-radius: ...;

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

    --mynah-mask-image: ...;
    --mynah-mask-image-rev: ...;
    --mynah-mask-image-main: ...;
    --mynah-mask-image-main-rev: ...;

    --mynah-mask-image-skeleton: ...;
}
```

## Supported browsers
**MynahUI** <em>-because of it's css structure-</em> only supports ever-green browsers including webkit-base WebUI renderers.


## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.

