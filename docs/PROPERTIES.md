# Mynah UI Constructor Properties
You can configure your Chat UI's initial render and defaults through these properties as well as connecting the events which will trigger after user interactions. Since all of the props are optional, feel free to assign only the ones you need.
```typescript
export interface MynahUIProps {
  rootSelector?: string;
  defaults?: MynahUITabStoreTab;
  tabs?: MynahUITabStoreModel;
  config?: Partial<ConfigModel>;
  onShowMoreWebResultsClick?: (
    tabId: string,
    messageId: string,
    eventId?: string) => void;
  onReady?: () => void;
  onVote?: (
    tabId: string,
    messageId: string,
    vote: RelevancyVoteType,
    eventId?: string) => void;
  onStopChatResponse?: (
    tabId: string,
    eventId?: string) => void;
  onResetStore?: (tabId: string) => void;
  onChatPrompt?: (
    tabId: string,
    prompt: ChatPrompt,
    eventId?: string) => void;
  onFollowUpClicked?: (
    tabId: string,
    messageId: string,
    followUp: ChatItemAction,
    eventId?: string) => void;
  onInBodyButtonClicked?: (
    tabId: string,
    messageId: string,
    action: {
      id: string;
      text?: string;
      formItemValues?: Record<string, string>;
    },
    eventId?: string) => void;
  onTabChange?: (
    tabId: string,
    eventId?: string) => void;
  onTabAdd?: (
    tabId: string,
    eventId?: string) => void;
  onTabRemove?: (
    tabId: string,
    eventId?: string) => void;
  /**
   * @param tabId tabId which the close button triggered
   * @returns boolean -> If you want to close the tab immediately send true
   */
  onBeforeTabRemove?: (
    tabId: string,
    eventId?: string) => boolean;
  onChatItemEngagement?: (
    tabId: string,
    messageId: string,
    engagement: Engagement) => void;
  onCopyCodeToClipboard?: (
    tabId: string,
    messageId: string,
    code?: string,
    type?: CodeSelectionType,
    referenceTrackerInformation?: ReferenceTrackerInformation[],
    eventId?: string) => void;
  onCodeInsertToCursorPosition?: (
    tabId: string,
    messageId: string,
    code?: string,
    type?: CodeSelectionType,
    referenceTrackerInformation?: ReferenceTrackerInformation[],
    eventId?: string) => void;
  onSourceLinkClick?: (
    tabId: string,
    messageId: string,
    link: string,
    mouseEvent?: MouseEvent,
    eventId?: string) => void;
  onLinkClick?: (
    tabId: string,
    messageId: string,
    link: string,
    mouseEvent?: MouseEvent,
    eventId?: string) => void;
  onInfoLinkClick?: (
    tabId: string,
    link: string,
    mouseEvent?: MouseEvent,
    eventId?: string) => void;
  onSendFeedback?: (
    tabId: string,
    feedbackPayload: FeedbackPayload,
    eventId?: string) => void;
  onCustomFormAction?: (
    tabId: string,
    action: {
      id: string;
      text?: string;
      formItemValues?: Record<string, string>;
    },
    eventId?: string) => void;
  onOpenDiff?: (
    tabId: string,
    filePath: string,
    deleted: boolean,
    messageId?: string,
    eventId?: string) => void;
  onFileActionClick?: (
    tabId: string,
    messageId: string,
    filePath: string,
    actionName: string,
    eventId?: string) => void;
  onTabBarButtonClick?: (
    tabId: string,
    buttonId: string,
    eventId?: string) => void;
}
```
_Let's deep dive into each property you can set._

### But before that, what is `eventId`?
You may notice that a wast majority of the event functions have `eventId` property. We're sending a unique `eventId` **for all real intended user actions** like clicks, prompts or tab related actions. 
It is mandatory to send it as an argument for some functions like `mynahUI.selectTab`.You need to send the incoming `eventId` from the connected event function to change a tab programmatically. Because without a user intent, you cannot change a tab. 

And those kind of functions **will only work** with the last `eventId`. So you cannot store an id and send it after several different user actions. 

---------
### `rootSelector`
_(default: `"body"`)_

rootSelector simply allows you to set which dom element you want to render the whole chat interface including the tabs and the chat prompt block and also the chat items. It will also create temporary or portal elements inside the same element such as notifications, custom dropdown blocks and also tooltips with rich content. However, they'll exceed the views boundaries.

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

It is pretty handy to keep the state of the whole UI and send it back while reinitializing after a refresh for example.

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

You can set the config here.

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
**Refer to the [configuration](./CONFIG.md) for more details**

---
<p><br/></p>

# Events
_Now let's dive deep into the events you can catch from the UI_

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
onStopChatResponse: (tabId: string):void => {
      console.log(`Sent from tab: ${tabId}`);
    };
...
```

---

### `onResetStore`

This event will be fired when the store is reset for that specific tab. It will pass only the `tabId` argument.

```typescript
...
onResetStore: (tabId: string):void => {
      console.log(`Store reset for tab: ${tabId}`);
    };
...
```

---

### `onChatPrompt`

This event will be fired when user hits enter or clicks to send button on the prompt input field. It will pass `tabId` and the `prompt` object as arguments. 

_Please refer to the [data model](./DATAMODEL.md) to learn more about the `ChatPrompt` object type._

<p align="center">
  <img src="./img/onChatPrompt.png" alt="onChatPrompt" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onChatPrompt?: (
    tabId: string,
    prompt: ChatPrompt):void => {
      console.log(`Sent from tab: ${tabId}`);
      console.log(`Prompt text (as written): ${prompt.prompt}`);
      console.log(`Prompt text (HTML escaped): ${prompt.escapedPrompt}`);
      console.log(`Command (if selected from quick actions): ${prompt.command}`);
      console.log(`Attachment (feature not available yet): ${prompt.attachment}`);
    };
...
```

### Very important note
You have to manually add the chat item for the prompt with the given ways on the **[How to use](./USAGE.md)** document.

---

### `onFollowUpClicked`

This event will be fired when user selects one of the available followups. It will pass `tabId`, `messageId` and the clicked `followUp` object as arguments.

**Important note:** If the clicked followup item contains `prompt` attribute, MynahUI will automatically add the `ChatItem` to the chat stack and will render it as a user prompt chat bubble with the `prompt` attributes text (on the right side). If you want to avoid this and manually control what will be added as a chat item or not adding anything at all after the selection of the followup, leave the `prompt` attribute undefined.

**Important note:** Followup texts show up at most 40 chars in the followup pill. If the length is more than 40 chars it will pop up a tooltip to show the rest of the text. However, it will not break the `description` to show up as a tooltip, instead if there is also the `description` attribute, it will append that to a new line in the tooltip.

_Please refer to the [data model](./DATAMODEL.md) to learn more about the `ChatItemAction` object type._

<p align="center">
  <img src="./img/onFollowupClicked.png" alt="onFollowUpClicked" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onFollowUpClicked?: (
    tabId: string,
    messageId: string,
    followUp: ChatItemAction):void => {
      console.log(`Sent from tab: ${tabId}`);
      console.log(`For the message: ${messageId}`);
      console.log(`Followup type (free text): ${followUp.type}`);
      console.log(`Followup text (visible on screen): ${followUp.pillText}`);
    };
...
```

---

### `onInBodyButtonClicked`

This event will be fired when user clicks one of the available followups.

It will pass you the `tabId`, `messageId` and information about the clicked `action`.

And the last argument `action` will contain:
```
id: string; // Id of the action clicked
text?: string; // Label text of the action
formItemValues?: Record<string, string>; // Form item values if you add any using the formItems
```
Please refer to [formItems](./DATAMODEL.md#formItems) for combining actions and form items in a card.

**Important note:** If you clicked an action item which doesn't have the value `true` for `keepCardAfterClick` attribute, that click will remove the whole card. Otherwise it will disable all the actions and the form items inside that card.

_Please refer to the [data model](./DATAMODEL.md) to learn more about the `ChatItemButton` object type._

<p align="center">
  <img src="./img/onBodyActionClicked.png" alt="onBodyActionClicked" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onInBodyButtonClicked?: (
    tabId: string,
    messageId: string,
    action):void => {
      console.log(`Sent from tab: ${tabId}`);
      console.log(`For the message: ${messageId}`);
      console.log(`Action id: ${action.id}`);
      console.log(`Action text: ${action.text ?? ''}`);
      console.log(`Form item values: ${JSON.stringify(action.formItemValues ?? {})}`);
    };
...
```

---

### `onTabChange`

This event will be fired when user changes the tab. It will only pass `tabId` for the new selected tab as argument.

<p align="center">
  <img src="./img/onTabChange.png" alt="onTabChange" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onTabChange?: (tabId: string):void => {
      console.log(`New selected tabId: ${tabId}`);
    };
...
```

---

### `onTabAdd`

This event will be fired when user clicks the add tab button or double clicks to an empty space on the tab bar to open a new tab. It will only pass `tabId` for the new tab as argument.

<p align="center">
  <img src="./img/onTabAdd.png" alt="onTabAdd" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onTabAdd?: (tabId: string):void => {
      console.log(`New tabId: ${tabId}`);
    };
...
```

---

### `onBeforeTabRemove`

This event will be fired when user clicks the close button but before actually closing the tab. You have **partial control over the tab close**. If you return false to this function, it will not immediately close the tab and will ask an approval from the user. Otherwise it will close the tab. You can set the texts which will be appeared on the confirmation overlay on **[Config/TEXTS](./CONFIG.md#texts)**. It will only pass `tabId` for the closed tab as argument.

<p align="center">
  <img src="./img/onTabRemove.png" alt="onTabRemove" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onBeforeTabRemove: (tabId: string):boolean => {
  // For example you can check if the tab is in loading state or not.
  const isTabLoading = mynahUI.getAllTabs()[tabId].store?.loadingChat;
  return !isTabLoading;
}
...
```

<p align="center">
  <img src="./img/onBeforeTabRemove.png" alt="onTabRemoveConfirmation" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

### `onTabRemove`

This event will be fired when user clicks the close button on a tab or middle clicks to the tab to close it but if `onBeforeTabRemove` is not attached or attached but returned `true`. It will only pass `tabId` for the closed tab as argument.

<p align="center">
  <img src="./img/onTabRemove.png" alt="onTabRemove" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onTabRemove?: (tabId: string):void => {
      console.log(`Closed tabId: ${tabId}`);
    };
...
```
---

### `onChatItemEngagement`

This event will be fired when user engages with a system generated chat bubble in various ways like moving/holding the mouse over it more than 3 seconds or selects some text inside the chat message bubble or clicks anywhere inside it. It will pass `tabId`, `messageId` for the engaged chat message bubble and also the `engagement` for the engagement details as arguments.

_Please refer to the [data model](./DATAMODEL.md) to learn more about the `Engagement` object type._

**Note:** This event will be only activated if you bind a function to it. It means that if you leave it undefined it will not listen/track any mouse movement at all for the chat message bubbles. 

<p align="center">
  <img src="./img/onChatItemEngagement.png" alt="onChatItemEngagement" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onChatItemEngagement?: (
    tabId: string,
    messageId: string,
    engagement: Engagement):void => {
      console.log(`Sent from tab: ${tabId}`);
      console.log(`Engaged message: ${messageId}`);
      console.log(`Engagement type: ${engagement.engagementType}`); // interaction | timespend
      console.log(`Engagement duration: ${engagement.engagementDurationTillTrigger}`);
      console.log(`Engagement total mouse distance travelled: ${engagement.totalMouseDistanceTraveled}`);
      console.log(`Engagement selection:
      x movement: ${engagement.selectionDistanceTraveled?.x}
      y movement: ${engagement.selectionDistanceTraveled?.y}
      selected text: ${engagement.selectionDistanceTraveled?.selectedText}
      `);
    };
...
```
---

### `onCopyCodeToClipboard`

This event will be fired when user clicks the copy button on the footer of a code block or selects some text inside a code block and triggers keyboard shortcuts for copying. It will pass `tabId`, `messageId`, `code` for the copied code to theclipboard as a text, `type` for the type of the code copied (block or selection) and the `referenceTrackerInformation` if the copied code block contains some code reference as the arguments.

**Note:** even though the `referenceTrackerInformation` comes to the message with `codeReference` attribute with the index position depending on the whole content of the body of the message, the return of it as an attribute from this event gives the indexes according to position inside that code block.

_Please refer to the [data model](./DATAMODEL.md) to learn more about the `ReferenceTrackerInformation` object type._


<p align="center">
  <img src="./img/onCopyCodeToClipboard.png" alt="onCopyCodeToClipboard" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onCopyCodeToClipboard?: (
    tabId: string,
    messageId: string,
    code?: string,
    type?: CodeSelectionType,
    referenceTrackerInformation?: ReferenceTrackerInformation[]):void => {
      console.log(`Sent from tab: ${tabId}`);
      console.log(`Code inside message: ${messageId}`);
      console.log(`Copied code: ${code}`);
      console.log(`Copy type: ${type}`); // selection | block
      console.log(`Reference tracker info: ${referenceTrackerInformation?.map(rti=>`${rti.licenseName} ${rti.repository}`).join(', ')}`);
    };
...
```
---

### `onCodeInsertToCursorPosition`

This event will be fired when user clicks the copy button on the footer of a code block or selects some text inside a code block and triggers keyboard shortcuts for copying. It will pass `tabId`, `messageId`, `code` for the copied code to theclipboard as a text, `type` for the type of the code copied (block or selection) and the `referenceTrackerInformation` if the copied code block contains some code reference as the arguments.

**Note:** even though the `referenceTrackerInformation` comes to the message with `codeReference` attribute with the index position depending on the whole content of the body of the message, the return of it as an attribute from this event gives the indexes according to position inside that code block.

_Please refer to the [data model](./DATAMODEL.md) to learn more about the `ReferenceTrackerInformation` object type._


<p align="center">
  <img src="./img/onCodeInsertToCursorPosition.png" alt="onCodeInsertToCursorPosition" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onCodeInsertToCursorPosition?: (
    tabId: string,
    messageId: string,
    code?: string,
    type?: CodeSelectionType,
    referenceTrackerInformation?: ReferenceTrackerInformation[]):void => {
      console.log(`Sent from tab: ${tabId}`);
      console.log(`Code inside message: ${messageId}`);
      console.log(`Copied code: ${code}`);
      console.log(`Copy type: ${type}`); // selection | block
      console.log(`Reference tracker info: ${referenceTrackerInformation?.map(rti=>`${rti.licenseName} ${rti.repository}`).join(', ')}`);
    };
...
```
---

### `onSourceLinkClick`

This event will be fired when user clicks one the the sources links after the body of a chat message body. It will pass `tabId`, `messageId`, `link` for the clicked link and the `mouseEvent` for the event object in case if it needs to be prevented as the arguments.

**Note:** For example, JetBrains JCEF WebView opens the links in a new browser view of its own. However to prevent this action and navigate to user's own preferred browser to open the links, you may want to cancel the default behaviour and run your own function to open the OS default browser.


<p align="center">
  <img src="./img/onSourceLinkClick.png" alt="onSourceLinkClick" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onSourceLinkClick?: (
    tabId: string,
    messageId: string,
    link: string,
    mouseEvent?: MouseEvent):void => {
      console.log(`Sent from tab: ${tabId}`);
      console.log(`Source link of message: ${messageId}`);
      console.log(`link: ${link}`);
      // mouseEvent.preventDefault();
    };
...
```
---

### `onLinkClick`

This event will be fired when user clicks a link inside the body of a chat message. It will pass `tabId`, `messageId`, `link` for the clicked link and the `mouseEvent` for the event object in case if it needs to be prevented as the arguments.

**Note:** For example, JetBrains JCEF WebView opens the links in a new browser view of its own. However to prevent this action and navigate to user's own preferred browser to open the links, you may want to cancel the default behaviour and run your own function to open the OS default browser.


<p align="center">
  <img src="./img/onLinkClick.png" alt="onLinkClick" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onLinkClick?: (
    tabId: string,
    messageId: string,
    link: string,
    mouseEvent?: MouseEvent):void => {
      console.log(`Sent from tab: ${tabId}`);
      console.log(`Source link of message: ${messageId}`);
      console.log(`link: ${link}`);
      // mouseEvent.preventDefault();
    };
...
```
---

### `onInfoLinkClick`

This event will be fired when user clicks a link inside the footer information message below the prompt input field for that tab. It will pass `tabId`, `link` for the clicked link and the `mouseEvent` for the event object in case if it needs to be prevented as the arguments.

**Note:** For example, JetBrains JCEF WebView opens the links in a new browser view of its own. However to prevent this action and navigate to user's own preferred browser to open the links, you may want to cancel the default behaviour and run your own function to open the OS default browser.


<p align="center">
  <img src="./img/onInfoLinkClick.png" alt="onInfoLinkClick" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onInfoLinkClick?: (
    tabId: string,
    link: string,
    mouseEvent?: MouseEvent):void => {
      console.log(`Sent from tab: ${tabId}`);
      console.log(`link: ${link}`);
      // mouseEvent.preventDefault();
    };
...
```
---

### `onSendFeedback`

This event will be fired when user sends a feedback from the feedback panel which opens after giving a negative vote to a message and follow it with a send feedback button click. It will pass `tabId` and `feedbackPayload` for the feedback details as the arguments.

**Note:** The options for the feedback type are coming from the configuration.

_Please refer to the [configuration](./CONFIG.md) to learn more about the feedback type options._


<p align="center">
  <img src="./img/onSendFeedback-1.png" alt="onSendFeedbackStep1" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
  <img src="./img/onSendFeedback-2.png" alt="onSendFeedbackStep2" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
  <img src="./img/onSendFeedback-3.png" alt="onSendFeedbackStep3" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onSendFeedback?: (
    tabId: string,
    feedbackPayload: FeedbackPayload):void => {
      console.log(`Sent from tab: ${tabId}`);
      console.log(`Feedback for message: ${feedbackPayload.messageId}`);
      console.log(`Feedback type: ${feedbackPayload.selectedOption}`);
      console.log(`Feedback comment: ${feedbackPayload.comment}`);
      // mouseEvent.preventDefault();
    };
...
```
---

### `onCustomFormAction`

This event will be fired when user clicks one of the buttons inside a custom popup form. It will pass `tabId` and `action`. But `action` argument contains the `id` and `text` of the action clicked and the values for each form item with string values. 


<p align="center">
  <img src="./img/onCustomFormAction.png" alt="onOpenDiff" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onCustomFormAction?: (
    tabId: string,
    action):void => {
      console.log(`Sent from tab: ${tabId}`);
      console.log(`Action id: ${action.id}`);
      console.log(`Action text: ${action.text ?? ''}`);
      console.log(`Form item values: ${JSON.stringify(action.formItemValues ?? {})}`);
    };
...
```
---


### `onOpenDiff`

This event will be fired when user clicks to a file name on the file list inside a chat message body. It will pass `tabId`, `filePath` for the clicked file, `deleted` to identify if the file is deleted and `messageId` as the arguments.


<p align="center">
  <img src="./img/onOpenDiff.png" alt="onOpenDiff" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onOpenDiff?: (
    tabId: string,
    filePath: string,
    deleted: boolean,
    messageId?: string):void => {
      console.log(`Sent from tab: ${tabId}`);
      console.log(`For message: ${messageId}`);
      console.log(`File to open diff view: ${filePath}`);
      console.log(`Is file deleted: ${deleted}`);
    };
...
```
---

### `onFileActionClick`

This event will be fired when user clicks to an action button for a specific file in a file node tree. It will pass `tabId`, `messageId`, `filePath` and the `actionName`. 

**TIP:** To do further updates on the file tree card, hold the `messageId` then you can use the [updateChatAnswerWithMessageId](./USAGE.md#updateChatAnswerWithMessageId) function to update that specific card.


<p align="center">
  <img src="./img/onFileActionClick.png" alt="onOpenDiff" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onFileActionClick?: (
    tabId: string,
    messageId?: string,
    filePath: string,
    actionName: string):void => {
      console.log(`Sent from tab: ${tabId}`);
      console.log(`For message: ${messageId}`);
      console.log(`File name which the action clicked: ${filePath}`);
      console.log(`The action id/name clicked: ${actionName}`);
    };
...
```

---

### `onTabBarButtonClick`

This event will be fired when user clicks to a button inside the tab tab or a button under a menu item inside the tab bar. 

**TIP:** To configure tab buttons according to a tab please see [DATAMODEL Documentation](./DATAMODEL.md#tabbarbuttons). Or for global tab bar button settings please see [Config Documentation](./CONFIG.md#tabbarbuttons).


<p align="center">
  <img src="./img/data-model/tabStore/tabBarButtons1.png" alt="tabBarButtons" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
  <img src="./img/data-model/tabStore/tabBarButtons2.png" alt="tabBarButtons" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
...
onTabBarButtonClick?: (
    tabId: string,
    buttonId: string,
    eventId?: string):void => {
      console.log(`Sent from tab: ${tabId}`);
      console.log(`Button ID: ${buttonId}`);
    };
...
```
