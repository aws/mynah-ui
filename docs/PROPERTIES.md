## Mynah UI Constructor Properties
You can configure your Chat UI's initial render and defaults through these properties as well as connecting the events which will trigger after user interactions. Since all of the props are optional, feel free to assign only the ones you need.
```typescript
export interface MynahUIProps {
  rootSelector?: string;
  defaults?: MynahUITabStoreTab;
  tabs?: MynahUITabStoreModel;
  config?: Partial<ConfigModel>;
  onShowMoreWebResultsClick?: (
    tabId: string,
    messageId: string) => void;
  onReady?: () => void;
  onVote?: (
    tabId: string,
    messageId: string,
    vote: RelevancyVoteType) => void;
  onStopChatResponse?: (tabId: string) => void;
  onResetStore?: (tabId: string) => void;
  onChatPrompt?: (
    tabId: string,
    prompt: ChatPrompt) => void;
  onFollowUpClicked?: (
    tabId: string,
    messageId: string,
    followUp: ChatItemFollowUp) => void;
  onTabChange?: (tabId: string) => void;
  onTabAdd?: (tabId: string) => void;
  onTabRemove?: (tabId: string) => void;
  onChatItemEngagement?: (
    tabId: string,
    messageId: string,
    engagement: Engagement) => void;
  onCopyCodeToClipboard?: (
    tabId: string,
    messageId: string,
    code?: string,
    type?: CodeSelectionType,
    referenceTrackerInformation?: ReferenceTrackerInformation[]) => void;
  onCodeInsertToCursorPosition?: (
    tabId: string,
    messageId: string,
    code?: string,
    type?: CodeSelectionType,
    referenceTrackerInformation?: ReferenceTrackerInformation[]) => void;
  onSourceLinkClick?: (
    tabId: string,
    messageId: string,
    link: string,
    mouseEvent?: MouseEvent) => void;
  onLinkClick?: (
    tabId: string,
    messageId: string,
    link: string,
    mouseEvent?: MouseEvent) => void;
  onInfoLinkClick?: (
    tabId: string,
    link: string,
    mouseEvent?: MouseEvent) => void;
  onSendFeedback?: (
    tabId: string,
    feedbackPayload: FeedbackPayload) => void;
  onOpenDiff?: (
    tabId: string,
    filePath: string,
    deleted: boolean,
    messageId?: string) => void;
}
```
_Let's deep dive into each property you can set._

---------
### `rootSelector`
_(default: `"body"`)_

rootSelector simply allows you to set which dom element you want to render the whole chat interface including the tabs and the chat prompt block and also the chat items. It will also create temporary or portal elements inside the same element such as notifications, custom dropdown blocks and also tooltips with rich content however they'll exceed the views boundaries, please refer to each components view in the documents.

```typescript
...
rootSelector: "#chat-wrapper", // default: "body"
...
```
---------

### `defaults`
_(default: `undefined`)_

defaults is here for you to set the default content and parameters for every new tab will be opened by the end user or created on the runtime without giving a specific data. You can set the prompt related fields, initial chat bubbles, or any parameter on a tab's [data model](./DATAMODEL.md).

```typescript
...
defaults: {
    store:{
        // ...
    }
}, // default: undefined
...
```
**For more information about what is the data model for the store attribute please refer to [Data Model Documentation](./DATAMODEL.md)**

---

### `tabs`
_(default: `undefined`)_

tabs is here for you to set the initial tabs with their initial content while initializing and rendering the UI for the first time. You can set anything related with the tab and or any parameter on a tab's [data model](./DATAMODEL.md).

It is pretty handy to keep the state of the whole UI and and send it back while reinitializing after a refresh for example.

_Note: You cannot set it on the runtime, it is just for initialization._

```typescript
...
tabs: {
    "Unique_Tab_Id": {
        isSelected: true | false, // default: false
        store:{
            // ...
        }
    },
    ...
}, // default: undefined
...
```
**For more information about what is the data model for the store attribute please refer to [Data Model Documentation](./DATAMODEL.md)**

---

### `config`
_(default: `undefined`)_

You can set the config is here for you to set the initial tabs with their initial content while initializing and rendering the UI for the first time. You can set anything related with the tab and or any parameter on a tab's [data model](./DATAMODEL.md).

It is pretty handy to keep the state of the whole UI and and send it back while reinitializing after a refresh for example.

_Note: You cannot set it on the runtime, it is just for initialization._

```typescript
...
config: {
    // Do not forget that you have to provide all of them
    // Config doesn't allow partial set of texts
    texts: {
        mainTitle: string;
        feedbackFormTitle: string;
        feedbackFormOptionsLabel: string;
        feedbackFormCommentLabel: string;
        feedbackThanks: string;
        feedbackReportButtonLabel: string;
        codeSuggestions: string;
        clickFileToViewDiff: string;
        files: string;
        insertAtCursorLabel: string;
        copy: string;
        showMore: string;
        save: string;
        cancel: string;
        submit: string;
        stopGenerating: string;
        copyToClipboard: string;
        noMoreTabsTooltip: string;
        codeSuggestionWithReferenceTitle: string;
        spinnerText: string;
    };
    // Options to show up on the overlay feedback form
    // after user clicks to downvote on a chat item
    // and clicks 'Report' again
    feedbackOptions: Array<{
        label: string;
        value: string;
    }>;
    maxTabs: number;
}, // default: undefined
...
```
**Refer to the [Text Configuration](./TEXTS.md) to see which item is belong to which field on UI**

---

## Events
_Now let's deep dive into the events you can catch from the UI_

---

### `onShowMoreWebResultsClick`

This event will be fired when end user clicks to show all resources down arrow button and pass the arguments `tabId` and `messageId`.

<p align="center">
  <img src="./img/onShowMoreClick.png" alt="onShowMoreWebResultsClick" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onShowMoreWebResultsClick: (
    tabId: string,
    messageId: string) => {
      console.log(`Sent from tab: ${tabId}`);
      console.log(`From message card: ${messageId}`);
    };
...
```

---

### `onReady`

This event will be fired when the UI is initialized and rendered without any arguments.

```typescript
...
onReady: () => {
      console.log('UI is ready');
    };
...
```

---

### `onVote`

This event will be fired when end user clicks one of the thumbs up or down buttons to vote the answer. It will pass the arguments `tabId`, `messageId` and the `vote`.

_Please refer to the [data model](./DATAMODEL.md) to learn how to enable vote buttons for chat answers_

<p align="center">
  <img src="./img/onVote.png" alt="onVote" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onVote: (
    tabId: string,
    messageId: string,
    vote: RelevancyVoteType) => {
      console.log(`Sent from tab: ${tabId}`);
      console.log(`Vote for message: ${messageId}`);
      console.log(`Vote: ${vote}`); // 'upvote' | 'downvote'
    };
...
```

---

### `onStopChatResponse`

This event will be fired when end user clicks to `Stop generating` button. It will pass only the `tabId` argument. To enable this feature globally, you need to set this function

_Please refer to the [data model](./DATAMODEL.md) to learn how to enable/disable onStopChatResponse for individual tabs_

<p align="center">
  <img src="./img/onStopChatResponse.png" alt="onStopChatResponse" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onStopChatResponse: (tabId: string) => {
      console.log(`Sent from tab: ${tabId}`);
    };
...
```

