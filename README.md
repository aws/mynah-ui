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
        // initial UI state data
        // It doesn't have to be matched with backend data
        // but to update the UI and rerender its desired parts, 
        // it expects the data in type of MynahUIDataModel.
        storeData?: MynahUIDataModel;
        
        // All below items trigger when;
        // User hits search button or enter inside query input
        onSearch?: (
            searchPayload: SearchPayload,
            isFromHistory?: boolean,
            isFromAutocomplete?: boolean
        ) => void;

        // UI is ready
        onReady?: () => void;

        // User votes a suggestion
        onClickSuggestionVote?: (suggestion: Suggestion, vote: RelevancyVoteType) => void;
        // User opens the detail view of selected code block
        onClickCodeDetails?: (
            code: string,
            fileName?: string,
            range?: {
            start: { row: string; column?: string };
            end?: { row: string; column?: string };
            }
        ) => void;

        // Data store is reset
        onResetStore?: () => void;

        // Matching policy is changed (context items)
        onChangeContext?: (changeType: ContextChangeType, queryContext: ContextType) => void;

        // When navigation tab is changed
        onNavigationTabChange?: (selectedTab: string) => void;

        // User engages with a suggestion
        onSuggestionEngagement?: (engagement: SuggestionEngagement) => void;

        // User copies text from suggestion
        onSuggestionClipboardInteraction?: (suggestionId: string, type?: string, text?: string) => void;

        // User clicks to the title, clicks or copies the link of the suggestion
        onSuggestionInteraction?: (eventName: SuggestionEventName, suggestion: Suggestion) => void;

        // User sends feedback
        onSendFeedback?: (feedbackPayload: FeedbackPayload) => void;

        // Search history panel view opens
        onRequestHistoryRecords?: (filterPayload: SearchHistoryFilters) => void;

        // Autocomplete items list block opens
        onRequestAutocompleteList?: (input: string) => void;

        // User changes live search state
        onChangeLiveSearchState?: (liveSearchState: LiveSearchState) => void;

        // User selects and autocomplete item
        onClickAutocompleteItem?: (
            text: string,
            currSelected?: number,
            suggestionCount?: number
        ) => void;
    });
}
```

MynahUI also provides some accessible functions to help developer show a notification or more importantly update the UI state data store. When you update the data store, it will automatically rerender the parts that is subscribed to that particular data part.

``` typescript
import { MynahUI } from '@aws/mynah-ui';

export const createMynahUI = () => {
    let mynahUI:MynahUI;
    const getSuggestions = (searchPayload) => {
        mynahUI.updateStore({loading: true});
        // get suggestions list
        const suggestions = await getSuggestions(searchPayload);
        if(suggestions){
            mynahUI.updateStore({suggestions, loading: false});
        } else {
            mynahUI.updateStore({loading: false});
            mynahUI.notify({
                content: "Couldn't get suggestions!",
                type: NotificationType.ERROR,
            });
        }
        
    }
    const mynahUI = new MynahUI({
        ...,
        onSearch: getSuggestions
    });

    // to update the store fully or partially
    mynahUI.updateStore(...);

    // set default values for the UI data store fully or partially
    mynahUI.setStoreDefaults(...);

    // get current search payload
    mynahUI.getSearchPayload();

    // Show a notification balloon
    mynahUI.notify(...);
}
```

In addition to MynahUI class, there are also some exported type definitions that can be handy for function returns or proper usage of arguments.

``` typescript
import {
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
  SuggestionEventName,
  SearchHistoryFilters,
  MynahUIDataModel,
  ContextChangeType,
  ContextSource,
  ContextTypes,
  NotificationType,
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

