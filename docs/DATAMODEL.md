# MynahUI Data Model (with how the things appear on screen)

There are few models for different items on the screen for mynah ui. Let's star from the top and go in detail one by one.

## Tab Data Store

All information you can set related with a tab. 

```typescript
interface MynahUIDataModel {
  /**
   * Tab title
   * */
  tabTitle?: string;
  /**
   * If tab is running an action (loadingChat = true) this markdown will be shown before close in a popup
   */
  tabCloseConfirmationMessage?: string | null;
  /**
   * Keep tab open button text
   */
  tabCloseConfirmationKeepButton?: string | null;
  /**
   * Close tab button text
   */
  tabCloseConfirmationCloseButton?: string | null;
  /**
   * Chat screen loading animation state (mainly use during the stream or getting the initial answer)
   */
  loadingChat?: boolean;
  /**
   * Show chat avatars or not
   * */
  showChatAvatars?: boolean;
  /**
   * Show cancel button while loading the chat
   * */
  cancelButtonWhenLoading?: boolean;
  /**
  * Quick Action commands to show when user hits / to the input initially
  */
  quickActionCommands?: QuickActionCommandGroup[];
  /**
  * Context commands to show when user hits @ to the input any point
  */
  contextCommands?: QuickActionCommandGroup[];
  /**
  * Placeholder to be shown on prompt input
  */
  promptInputPlaceholder?: string;
  /**
  * Info block to be shown under prompt input
  */
  promptInputInfo?: string;
  /**
  * A sticky chat item card on top of the prompt input
  */
  promptInputStickyCard?: Partial<ChatItem> | null;
  /**
  * Prompt input field disabled state, set to true to disable it
  */
  promptInputDisabledState?: boolean;
  /**
  * List of chat item objects to be shown on the web suggestions search screen
  */
  chatItems?: ChatItem[];
  /**
   * Attached code under the prompt input field
   */
  selectedCodeSnippet?: string;
  /**
   * Tab bar buttons next to the tab items
   */
  tabBarButtons?: TabBarMainAction[];
}
```

You can set tab data with this model for `defaults`, initial `tabs` which can be set through [Constructor Properties](./PROPERTIES.md) or update a tab on runtime by using `mynahUI.updateStore(...)`.

Let's see which items is what.

### `tabTitle` (default: `"AWS Q"`)
Basically it is the tab title.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.updateStore('tab-1', {
    tabTitle: 'Chat'
})
```


### 

<p align="center">
  <img src="./img/data-model/tabStore/tabTitle.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

### `tabCloseConfirmationMessage`, `tabCloseConfirmationKeepButton` and `tabCloseConfirmationCloseButton`

Custom texts for each tab for the message and the buttons of the popup to confirm the tab close. Check **[Config/TEXTS](./CONFIG.md#texts)** for defaults. 

<p align="center">
  <img src="./img/onBeforeTabRemove.png" alt="onTabRemove" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

### `loadingChat` (default: `false`)
Basically it is the tab title.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.updateStore('tab-1', {
    loadingChat: true
})
```
When you set `loadingChat` to true, if there is a streaming card it will start to animate the spinner in two different way. If the card body is empty it will show the `spinnerText` from the texts inside the config right next to a spinning circle. If the card has a body (after it is updated for example) it will show a sliding colored bottom border animation. 

In addition to the spinner, if `onStopChatResponse` is attached globally through MynahUI main class constructor properties _(see [Constructor properties](./PROPERTIES.md) for details)_ and `cancelButtonWhenLoading` is not set to false specifically for that tab it will show the stop generating button too.

<p align="center">
  <img src="./img/data-model/tabStore/loadingChat-1.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>
<p align="center">
  <img src="./img/data-model/tabStore/loadingChat-2.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---


### `cancelButtonWhenLoading` (default: `true`)
If `onStopChatResponse` is attached globally through `MynahUI` main class constructor properties _(see [Constructor properties](./PROPERTIES.md) for details)_ it will show a stop generating button to let the user cancel the ongoing action.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.updateStore('tab-1', {
    loadingChat: true,
    cancelButtonWhenLoading: true
})
```

<p align="center">
  <img src="./img/data-model/tabStore/stopChatResponse.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---


### `quickActionCommands` (default: `[]`)
Quick action commands are the predefined commands which user can pick between. When users hit `/` from their keyboard as the initial char in the input, if there is an available list it will show up as a overlay menu.

If you want a command immediately run after the selection and trigger `onChatPrompt` event (attached to the `MynahUI` main instance through the [Constructor properties](./PROPERTIES.md)) leave the `placeholder` attribute undefined. MynahUI will decide that it doesn't allow additional prompt text for that command and immediately run the trigger. _(See command-2 in the example)_

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.updateStore('tab-1', {
    quickActionCommands: [
        {
            groupName: 'Command Group 1',
            commands: [
            {
                command: '/command-1',
                placeholder: 'Command which accepts a prompt after the command selection',
                description: 'Command 1 description',
            },
            {
                command: '/command-2',
                description: 'Command 2 description',
            },
            ],
        },
        {
            groupName: 'Command Group 2',
            commands: [
            {
                command: '/command-3',
                placeholder: 'Command which accepts a prompt after the command selection',
                description: 'Command 3 description',
            },
            ],
        },
        {
            // Command Group without title
            commands: [
            {
                command: '/command-4',
                placeholder: 'Command which accepts a prompt after the command selection',
                description: 'Command 4 description',
            },
            ],
        },
    ]
})
```

<p align="center">
  <img src="./img/data-model/tabStore/quickActionCommands.png" alt="quickActionCommands" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

To handle the incoming command (if there is) check it with the prompt object in the `onChatPrompt` event.

```typescript
const mynahUI = new MynahUI({
    ...
    onChatPrompt: (prompt)=>{
        if(prompt.command !== undefined){
            switch (prompt.command) {
                case '/command-1':
                    console.log(`Command 1 selected with prompt: ${prompt.prompt}`);
                    break;
                case '/command-2':
                    console.log('Command 2 selected');
                    break;
                default:
                    ...
                    break;
                }
        }
    }
});
```

---

### `contextCommands` (default: `[]`)
Context commands are the predefined context items which user can pick between but unlike quick action commands, they can be picked several times at any point in the prompt text. When users hit `@` from their keyboard in the input, if there is an available list of context items provided through store it will show up as an overlay menu.


```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.updateStore('tab-1', {
    contextCommands: [
      {
        groupName: 'Metion code',
        commands:[
          {
            command: '@ws',
            description: '(BETA) Reference all code in workspace.'
          },
          {
            command: '@folder',
            placeholder: 'mention a specific folder',
            description: 'All files within a specific folder'
          },
          {
            command: '@file',
            placeholder: 'mention a specific file',
            description: 'Reference a specific file'
          },
          {
            command: '@code',
            placeholder: 'mention a specific file/folder, or leave blank for full project',
            description: 'After that mention a specific file/folder, or leave blank for full project'
          },
          {
            command: '@gitlab',
            description: 'Ask about data in gitlab account'
          }
        ]
      }
    ]
})
```

<p align="center">
  <img src="./img/data-model/tabStore/contextCommands.png" alt="contextCommands" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

To see which context is used, check the incoming array in the prompt object comes with the `onChatPrompt` event.

```typescript
const mynahUI = new MynahUI({
    ...
    onChatPrompt: (prompt)=>{
        if(prompt.context != null && prompt.context.indexOf('@ws') {
          // Use whole workspace!
        }
    }
});
```

---

### `promptInputPlaceholder` (default: `''`)

This is the placeholder text for the prompt input

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.updateStore('tab-1', {
    promptInputPlaceholder: 'Ask a question or “/” for capabilities'
})
```

<p align="center">
  <img src="./img/data-model/tabStore/promptInputPlaceholder.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

### `promptInputInfo` (default: `''`)

This is a info field under the bottom of the prompt input field, like a footer text

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.updateStore('tab-1', {
    promptInputInfo: 'Use of Amazon Q is subject to the [AWS Responsible AI Policy](https://aws.com).',
})
```

<p align="center">
  <img src="./img/data-model/tabStore/promptInputPlaceholder.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

### `promptInputStickyCard` (default: `null`)

This is a chat item card which will be shown on top of the prompt input field. Main usage scneario for this is to inform the user with a card view, which means that it can also have some actions etc.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    },
    ...
    onInBodyButtonClicked: (tabId: string, messageId: string, action) => {
      if(messageId === 'sticky-card'){
        // clear the card
        mynahUI.updateStore(tabId, {promptInputStickyCard: null});
      }
      ...
    },
    ...
});

mynahUI.updateStore(tabId, {
    promptInputStickyCard: {
        messageId: 'sticky-card',
        body: `Please read the [terms and conditions change](#) and after that click the **Acknowledge** button below!`,
        status: 'info',
        icon: MynahIcons.INFO,
        buttons: [
            {
                // you can also simply set this to false to remove the card automatically
                keepCardAfterClick: true,
                text: 'Acknowledge',
                id: 'acknowledge',
                status: 'info',
                icon: MynahIcons.OK
            },
        ],
    }
});

```

<p align="center">
  <img src="./img/data-model/tabStore/promptInputStickyCard.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

### `promptInputDisabledState` (default: `false`)

This is the disabled state if the prompt input field. When set to true, user cannot focus to the input and cannot click to the send button.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.updateStore('tab-1', {
    promptInputDisabledState: true,
})
```

<p align="center">
  <img src="./img/data-model/tabStore/promptInputDisabledState.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

### `selectedCodeSnippet`

This is the attached code block text right under the prompt input field..

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.updateStore('tab-1', {
    selectedCodeSnippet: `const mynahUI = new MynahUI({
        tabs: {
            'tab-1': {
                isSelected: true,
                .....`,
})
```

<p align="center">
  <img src="./img/data-model/tabStore/selectedCodeSnippet.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

### `tabBarButtons`

You can put buttons on the right of the tab bar also with some inner buttons inside a menu. You can do it in two different ways. If you want the buttons belong to specific tab, you can use the `tabBarButtons` for tab store. If you want them globally available for every tab, check the **[Config Documentation](./CONFIG.md#tabbarbuttons)**.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.updateStore('tab-1', {
    tabBarButtons: [
        {
          id: 'clear',
          description: 'Clear messages in this tab',
          icon: MynahIcons.REFRESH,
        },
        {
          id: 'multi',
          icon: MynahIcons.ELLIPSIS,
          items: [
            {
              id: 'menu-action-1',
              text: 'Menu action 1!',
              icon: MynahIcons.CHAT,
            },
            {
              id: 'menu-action-2',
              text: 'Menu action 2!',
              icon: MynahIcons.CODE_BLOCK,
            },
            {
              id: 'menu-action-3',
              text: 'Menu action 3!'
            }
          ]
        }
      ],
})
```

<p align="center">
  <img src="./img/data-model/tabStore/tabBarButtons1.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
  <br/>
  <img src="./img/data-model/tabStore/tabBarButtons2.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

### `chatItems` (default: `[]`)

This is holding the chat items. If you provide it through the `defaults` or inside a tab item in the initial `tabs` property in the [Constructor properties](./PROPERTIES.md) you can give the whole set.

**BUT** if you will set it through `updateStore` it will append the items in the list to the current chatItems list. In case if you need to update the list with a new one manually on runtime, you need to send an empty list first and than send the desired new list.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.updateStore('tab-1', {
    chatItems: [],
})
```

<p><br/></p>

---

<p><br/></p>

# `ChatItem` (and how they appear on screen)

There are basically 2 main types of chat items. One is to show a file list and the other one is for all other items with a body of markdown string content.

Let's start with the model definition:

```typescript
// There can be more types on the ChatItemType enum list
// However those are the only ones getting used by MynahUI
enum ChatItemType {
  CODE_RESULT = 'code-result',
  ANSWER_STREAM = 'answer-stream',
  ANSWER = 'answer',
  PROMPT = 'prompt',
  SYSTEM_PROMPT = 'system-prompt'
}

interface ChatItemAction extends ChatPrompt {
  type?: string;
  pillText: string;
  disabled?: boolean;
  description?: string;
  status?: 'info' | 'success' | 'warning' | 'error';
  icon?: MynahIcons;
}

interface ChatItemButton {
  keepCardAfterClick?: boolean;
  waitMandatoryFormItems?: boolean;
  text: string;
  id: string;
  disabled?: boolean;
  description?: string;
  status?: 'info' | 'success' | 'warning' | 'error';
  icon?: MynahIcons;
}

interface ChatItemFormItem {
  id: string;
  type: 'select' | 'textarea' | 'textinput' | 'numericinput' | 'stars' | 'radiogroup';
  mandatory?: boolean;
  title?: string;
  placeholder?: string;
  value?: string;
  options?: Array<{
    value: string;
    label: string;
  }>;
}

interface FileNodeAction {
  name: string;
  label?: string;
  disabled?: boolean;
  description?: string;
  status?: 'info' | 'success' | 'warning' | 'error';
  icon: MynahIcons;
}

interface TreeNodeDetails {
  status?: 'info' | 'success' | 'warning' | 'error';
  icon?: MynahIcons;
  label?: string;
  description?: string; // Markdown tooltip
}

interface SourceLink {
  title: string;
  id?: string;
  url: string;
  body?: string;
  type?: string;
  metadata?: Record<string, SourceLinkMetaData>;
}

interface ReferenceTrackerInformation {
  licenseName?: string;
  repository?: string;
  url?: string;
  recommendationContentSpan?: {
    start: number;
    end: number;
  };
  information: string;
}

interface ChatItemBodyRenderer extends GenericDomBuilderAttributes {
  type: AllowedTagsInCustomRenderer;
  children?: Array<string | ChatItemBodyRenderer> | undefined;
  attributes?: Partial<Record<AllowedAttributesInCustomRenderer, string>> | undefined;
}

interface CodeBlockAction {
  id: 'copy' | 'insert-to-cursor' | string;
  label: string;
  description?: string;
  icon?: MynahIcons;
  data?: any;
  acceptedLanguages?: string[];
}
type CodeBlockActions = Record<'copy' | 'insert-to-cursor' | string, CodeBlockAction | undefined | null>;

// ################################# 
interface ChatItemContent {
  body?: string;
  customRenderer?: string | ChatItemBodyRenderer | ChatItemBodyRenderer[];
  followUp?: {
    text?: string;
    options?: ChatItemAction[];
  };
  relatedContent?: {
    title?: string;
    content: SourceLink[];
  };
  codeReference?: ReferenceTrackerInformation[];
  fileList?: {
    fileTreeTitle?: string;
    rootFolderTitle?: string;
    filePaths?: string[];
    deletedFiles?: string[];
    actions?: Record<string, FileNodeAction[]>;
    details?: Record<string, TreeNodeDetails>;
  };
  buttons?: ChatItemButton[];
  formItems?: ChatItemFormItem[];
  footer?: ChatItemContent;
  codeBlockActions?: CodeBlockActions;
}

interface ChatItem extends ChatItemContent{
  type: ChatItemType;
  messageId?: string;
  snapToTop?: boolean;
  canBeVoted?: boolean;
  icon?: MynahIcons;
  status?: 'info' | 'success' | 'warning' | 'error';
}
// ################################# 
```

Let's see all kind of examples and what parameter reflects to what.

## `type`

### ChatItemType.`ANSWER_STREAM` _(position: left)_
Use for streaming cards. It is better to start with an empty string to let the initial spinner rotate. As far as the `loadingState` is true for the tab which holds this chat item, it will show the spinner (rotating circle for empty state and bottom border for with a body). 

When you add a new chat item with type `ANSWER_STREAM` MynahUI will set it as the streaming card and when you call `updateLastChatAnswer` it will update this.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.addChatItem('tab-1', {
    type: ChatItemType.ANSWER_STREAM,
    body: ''
});

// After a moment
mynahUI.updateLastChatAnswer('tab-1', {
    body: `### How to create a React stateless function component

*React .14* introduced a simpler way to define components called stateless functional components.
    `
});
```

<p align="center">
  <img src="./img/data-model/chatItems/answerStream.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

### ChatItemType.`ANSWER` or ChatItemType.`CODE_RESULT` _(position: left)_
Use for all kind of answers. Including the followups etc.

And yes, except the `fileList` you can combine followups and markdown string content chat items at once. Which means that a single chat item can also contain the `followUp` at the same time with `body`.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.addChatItem('tab-1', {
    type: ChatItemType.ANSWER,
    body: 'Hi, I\'m Amazon Q. I can answer your software development questions. Ask me to explain, debug, or optimize your code. You can enter `/` to see a list of quick actions.'
    followUp:{
        text: 'Or you can select one of these',
        options: [
            {
                pillText: 'Explain selected code',
            },
            {
                pillText: 'How can Amazon Q help me?',
                prompt: 'How can Amazon Q help me?',
            }
        ],
    }
});
```

<p align="center">
  <img src="./img/data-model/chatItems/answer.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

### ChatItemType.`PROMPT` _(position: right)_
Use for user prompts. You can also send followups to let them appear on right. 

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.addChatItem('tab-1', {
    type: ChatItemType.PROMPT,
    body: 'Who are you?'
});

mynahUI.addChatItem('tab-1', {
    type: ChatItemType.PROMPT,
    followUp:{
        text: 'Or you can select one of these',
        options: [
            {
                pillText: 'Explain selected code',
            },
            {
                pillText: 'How can Amazon Q help me?',
                prompt: 'How can Amazon Q help me?',
            }
        ],
    }
});
```

<p align="center">
  <img src="./img/data-model/chatItems/prompt.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

### ChatItemType.`SYSTEM_PROMPT` _(position: right)_
Use for sysyem prompts. Only difference with `PROMPT` is the color of the chat card. (Depends on your **[Styling Configuration](STYLING.md)**) You can also send followups to let them appear on right. 

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.addChatItem('tab-1', {
    type: ChatItemType.SYSTEM_PROMPT,
    body: 'This is a system prompt'
});

mynahUI.addChatItem('tab-1', {
    type: ChatItemType.SYSTEM_PROMPT,
    followUp: {
    text: 'Or you can select one of these',
    options: [
        {
            pillText: 'Explain selected code',
        },
        {
            pillText: 'How can Amazon Q help me?',
            prompt: 'How can Amazon Q help me?',
        }
    ],
    }
});
```

<p align="center">
  <img src="./img/data-model/chatItems/systemPrompt.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## `body`
Basically the body of the card. Which you can send a full markdown string. Allows code blocks, links etc. 

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.addChatItem('tab-1', {
    type: ChatItemType.ANSWER,
    body: "## Here'a heading 2\nAnd also here are some code blocks which supports most common languages.\n```typescript\nconst a = 5;\n```\n You can also use some `inline code` items too.\n And also for example [a link](https://aws.com)"
});
```

<p align="center">
  <img src="./img/data-model/chatItems/body.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## `customRenderer`
Custom renderers can be provided in 3 different types *(string, ChatItemBodyRenderer object or ChatItemBodyRenderer object array)* and they are here to help you in case you need to create some static content on the client side rather than a data arrived from the backend. Or, maybe it is not possible or so hard to do it just with markdown.

##### Note: It can be combined with `body`, so you don't need to choose one of them.


### Using with `string` type
If you give a string to the `customRenderer` mynah-ui will consider that it as an html markup string and will render it that way.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.addChatItem('tab-1', {
    messageId: (new Date().getTime()).toString(),
    type: ChatItemType.ANSWER,
    canBeVoted: true,
    customRenderer: `
        <h3>Custom renderer's with HTML markup string</h3>
        <p>
            Here you will find some custom html rendering examples which may not be available with markdown or pretty hard to generate.
        </p>
        <br />

        <h3>Table (inside a blockqote)</h3>
        <blockquote>
            Most popular JS frameworks
            
            <!-- Divider -->
            <hr />

            <table>
            <tbody>
                <tr>
                    <th align="left">Name</td>
                    <th align="right">Weekly Downloads</td>
                </tr>
                <tr>
                    <td align="left">Vanilla</td>
                    <td align="right"><strong>inf.</strong></td>
                </tr>
                <tr>
                    <td align="left">React</td>
                    <td align="right">24 <small>million</small></td>
                </tr>
                <tr>
                    <td align="left">JQuery</td>
                    <td align="right">10.6 <small>million</small></td>
                </tr>
                <tr>
                    <td align="left">VUE</td>
                    <td align="right">4.75 <small>million</small></td>
                </tr>
            </tbody>
            </table>
        </blockquote>
        <br />

        <!-- Divider -->
        <hr />
        <br />

        <h3>Code block and Links</h3>

        <pre class="language-typescript">
            <code>import { MynahUI } from '@aws/mynah-ui';

            const mynahUI = new MynahUI({});</code>
        </pre>
        <p>
            You can find more information and references
            <strong>
                <a href="https://github.com/aws/mynah-ui">HERE!</a>
            </strong>.
        </p>

        <br />

        <!-- Divider -->
        <hr />
        <br />

        <h3>Embeds and Media elements</h3>

        <h4>Iframe embed (Youtube example)</h4>
        <iframe aspect-ratio="16:9" 
            src="https://www.youtube.com/embed/bZsIPinetV4?si=k2Awd9in_wKgQC09&amp;start=65"
            title="YouTube video player" allow="picture-in-picture;" allowfullscreen>
        </iframe>
        <br />
        
        <h4>Video element</h4>
        <video aspect-ratio="21:9" controls
            poster="https://assets.aboutamazon.com/88/05/0feec6ff47bab443d2c82944bb09/amazon-logo.png">
            <source src="https://www.w3schools.com/tags/movie.mp4" type="video/mp4">
            <source src="https://www.w3schools.com/tags/movie.ogg" type="video/ogg">
            Your browser does not support the video tag.
        </video>
        <br />

        <h4>Audio element</h4>
        <audio controls>
            <source src="https://www.w3schools.com/tags/horse.ogg" type="audio/ogg">
            <source src="https://www.w3schools.com/tags/horse.mp3" type="audio/mpeg">
            Your browser does not support the audio tag.
        </audio>
        <br />

        <h4>Image</h4>
        <img aspect-ratio 
            src="https://d1.awsstatic.com/logos/aws-logo-lockups/poweredbyaws/PB_AWS_logo_RGB_REV_SQ.8c88ac215fe4e441dc42865dd6962ed4f444a90d.png" 
            alt="Powered by AWS">
        <br />

        <!-- Divider -->
        <hr />
        <br />

        <p>
            There might be infinite number of possible examples with all supported tags and their attributes.
            It doesn't make so much sense to demonstrate all of them here.
            You should go take a look to the 
            <strong>
                <a href="https://github.com/aws/mynah-ui/blob/main/docs/DATAMODEL.md">documentation</a>
            </strong>
            for details and limitations.
        </p>`
});
```

<p align="center">
  <img src="./img/data-model/chatItems/customRenderer_html.png" alt="customRendererHTML" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

### Using with `ChatItemBodyRenderer` or `ChatItemBodyRenderer[]` type
Even though you can build exactly the same html elements and node tree with the `string` type, this option will give you more flexibility especially on repeating items. We all know that it is not easy to read code which loops inside a string. **But more importantly, you can also bind events with this option**.

Another `+1` for this option is related with its interface declaration. With an object structure which is properly typed, your IDE should give you the available values list during the code completion. Which means that you don't need to guess or go back and forth between the documentation and your project to see which tags you can use in the `type` attribute (html tag), which attributes are supported for the `attributes` or which events are available for the `events`.

Let's take a look how we write with `ChatItemBodyRenderer[]` interface:

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

// Lets' use a super dumb array instead of copy pasting the items inside the customRenderer.
const topFrameworks: Record<string, string> = {'Vanilla': 'inf.', 'React': '24', 'JQuery': '10.6', 'VUE': '4.75'};

mynahUI.addChatItem('tab-1', {
    messageId: (new Date().getTime()).toString(),
    type: ChatItemType.ANSWER,
    canBeVoted: true,
    customRenderer: [
      {
        type: 'h3',
        children: ['Custom renderer\'s with JSON dom builder objects']
      },
      {
        type: 'p',
        children: ['Here you will find some custom html rendering examples which may not be available with markdown or pretty hard to generate. But in this examples they are rendered from JSON definitions.']
      },
      {
        type: 'p',
        children: ['There is no difference between using a markup string or a JSON dom. You can create same accepted tags with same accepted attributes.']
      },
      {
        type: 'p',
        children: [
          'Except 1 thing: ', 
          {type: 'strong', children: ['attaching events! Like click or mousemove etc.']}
        ]
      },
      { type: 'br' },
      {
        type: 'h3',
        events: {
          click: (event) => { alert('Why you click to title?'); }
        },
        children: ['Table (inside a blockqote)']
      },
      {
        type: 'p',
        children: ['This is basically the same table one card above with markup strings, but in this one ', {type: 'b', children: ['you can click to the table titles!']}]
      },
      { type: 'br' },
      {
        type: 'blockquote',
        children: [
          'Most popular JS frameworks',
          { type: 'hr' }, // Divider
          {
            type: 'table',
            children: [
              {
                type: 'tr',
                children: [
                  {
                    type: 'th',
                    events: {
                      click: () => { alert('Why you click this title?'); }
                    },
                    attributes: { align: 'left' },
                    children: ['Name']
                  },
                  {
                    type: 'th',
                    events: {
                      click: () => { alert('Why you click to this title?'); }
                    },
                    attributes: { align: 'right' },
                    children: ['Weekly Downloads']
                  }
                ]
              },
              // Mapping our dumb array to create the rows
              ...Object.keys(topFrameworks).map(fw => ({
                  type: 'tr',
                  children: [
                    { type: 'td', children: [fw]},
                    { type: 'td',
                      attributes: { align: 'right' },
                      children: [
                        topFrameworks[fw], 
                        ...(!isNaN(parseFloat(topFrameworks[fw])) ? [{type: 'small', children: [' million']}] : [])
                      ] 
                    }
                  ]
                } as ChatItemBodyRenderer
              )),
            ]
          }
        ]
      },
      { type: 'br' }, // Add more space
      {
        type: 'p',
        children: ['Or you can click below image to remove it!']
      },
      { type: 'br' },
      {
        type: 'img',
        events: {
          click: (event: MouseEvent)=>{
            (event.target as HTMLElement).remove();
          }
        },
        attributes: {
          src: 'https://d1.awsstatic.com/logos/aws-logo-lockups/poweredbyaws/PB_AWS_logo_RGB_stacked_REV_SQ.91cd4af40773cbfbd15577a3c2b8a346fe3e8fa2.png',
          alt: 'Powered by AWS!'
        }
      }
    ]
  });
```

<p align="center">
  <img src="./img/data-model/chatItems/customRenderer_json.png" alt="customRendererJson" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

## BUT: There are some `LIMITATIONS!`

### We know that you're extremely careful while building custom html blocks and you're an expert on CSS. However, we still need to assure that the look & feel of the UI is not broken and it works as expected with all the functionalities. Because of these reasons with the addition of the safety concerns <u>we have to **`sanitize`** the HTML contents you provide</u>.

**And,** the sanitization requirement it is not just limited with the above. We're also automatically applying the functionalities we have on the original chat item body like *highlighting the code syntaxes, adding copy to clipboard and insert at cursor position buttons or adding the event controls for links etc.*. 
For example, you can check how the code blocks provided inside `customRenderer` look like (and do they have the copy buttons?) in the above examples.

**NOTE:** Below limitations are applicable for all of the `string`, `ChatItemBodyRenderer` and `ChatItemBodyRenderer[]` type usages.

### List of available tags:

```
[
  'a', 'audio', 'b', 'blockquote',
  'br', 'hr', 'canvas',
  'code', 'col', 'colgroup',
  'data', 'div', 'em',
  'embed', 'figcaption', 'figure',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
  'i', 'iframe',
  'img', 'li', 'map',
  'mark', 'object', 'ol',
  'p', 'pre', 'q',
  's', 'small', 'source',
  'span', 'strong', 'sub',
  'sup', 'table', 'tbody',
  'td', 'tfoot', 'th',
  'thead', 'tr', 'track',
  'u', 'ul', 'video',
]
```

**NOTE:** As you can see in the above list, **form items are also not available**. Since this is a chat interface we should keep it as conversational as possible instead of using select/input/click structures to interact if they are not helping the end user. But in case you need some small forms and inputs from the user other than the prompts, you can use the **[`formIems`](#formitems)**.

### List of available attributes:

```
[
    'accept','accept-charset','accesskey',
    'align','allow','allowfullscreen',
    'alt', 'as','async','autocapitalize',
    'autoplay','charset','class',
    'cols','colspan','controls',
    'crossorigin','data','data-*',
    'datetime','decoding','default',
    'dir','download','headers',
    'hidden','high','href',
    'hreflang','id','ismap','
    itemprop','kind','lang',
    'language','loop','low',
    'media','muted','optimum',
    'ping','playsinline','poster',
    'preload','referrerpolicy',
    'rel','reversed','role',
    'rowspan','sandbox','scope',
    'shape','size','sizes','slot',
    'span','spellcheck','src',
    'srcdoc','srclang','srcset',
    'start', 'style', 'target','title',
    'translate','usemap',
    'wrap','aspect-ratio'
]
```

## Important Tips for `customRenderer`

### Tip 1
As you might see there is also no `width` and `height` attributes are available. 
As we've told you above, we know you're so good at styling components but our concern is the HTML itself. Since `mynah-ui` has a responsive design nature, we cannot let you write a static width or height to an `img` for example.

### But you're free to write custom styles for each tag you can create. But don't forget that you're getting the responsibility of a broken UI. So be careful with the styles and try not to be so extreme on that.

It applies to `iframe`s, `video`s and other similar media elements too. 
So, **avoid writing static sizes** and learn **what is the aspect ratio of your media content**.

### Tip 2
In general, those items *(except `img`)* will automatically stretched to 100% width and will stay that way as the max width is 100%. Yes, you cannot use static width and heights, **but** you can define their aspect ratios. Here's an example:

```
<iframe aspect-ratio="16:9" 
    src="https://..." ...>
</iframe>
```
When you provide a value to the `aspect-ratio` attribyte, it will automatically set the `width` of the element to `100%` and apply the aspect ratio for the height.

### Tip 3
So, are you looking for the available `aspect-ratio` values?
Here they are: `16:9`, `9:16`, `21:9`, `9:21`, `4:3`, `3:4`, `3:2`, `2:3`, `1:1`

If you need more aspect-ratios, please raise a feature request.

### Tip 4
**But,** of course we cannot control your imagination and lower down your expertise on html element structures.

For example; you can say that oldies are goldies and still have some emotional connection to the `table`s. How we can understand that you used a `table` and used some `colspan`s for the `td`s to adjust the width as the half of the wrapper card for the element you put inside which will not break the responsive structure... 

```
<table>
  <tr>
    <td colspan="1">
      <iframe ...>
    </td>
    <td colspan="1">
      <video ...>
    </td>
  </tr>
</table>
```
**Or,** since we know that you're expert on css, you can define some `flex-box` structure which have 100% width and also proper item arrangement inside. See the [Tip 6](#tip-6) below.

### Tip 5
For `img` items, it is a bit different. First of all, `img` items doesn't have `width` set to `100%` directly. They will be rendered in their original size (both width and height). However up to **`100%` width max**. 
**But** in case you want to make an image `100%` width and don't want to change its original aspect ratio, just give the `aspect-ratio` attribute without a value. Any of these media and embed items has the `aspect-ratio` without value, they'll get 100% width.
If you want to specify a custom aspect ratio within the available options above, you can also do that for the `img` items too.

### Tip 6
Even though we don't want you to write styles for the components, you might have some real edge cases you have to adjust the styles of your renderer(s). In this case you can use directly `style` attribute with 100% care of it or using an `id` or `class` attributes to define your styles in your style files properly.


That's all!, please also see the **[samples data](https://github.com/aws/mynah-ui/blob/6dd5cfbbb9e9d67fec19c40a2f9fbd7dba4c027c/example/src/samples/sample-data.ts#L544)** of both options we've used in the example app.

---

## `snapToTop`
It gives you the option to snap the card to the top of the scrolling container. By default, if the user already scrolled to the bottom of the container, container will autoscroll whenever the content is updated. 

**BUT:** There is one thing you need to think about, if your card is a streaming one, you may want to give the `snapToTop` value with the last stream part, otherwise after each content update it will snap to top which may cause a flickery view. And also it would be nice to show the content while it is being generated, and when it ends let it snap to top. **If** your chat item type is a strait `ANSWER`, you should give it initially with the data, when it appears on the screen it will be already snapped to top.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.addChatItem('tab-1', {
    type: ChatItemType.ANSWER,
    ...
    snapToTop: true,
    body: "Put a very long message to see if it really snaps or still scrolls."
});
```

---

## `canBeVoted`
It enables the up and down vote buttons for that particular chat item. Important thing to remember here is that you have provide a `messageId` together with the `canBeVoted` to let the buttons appear and trigger the `onVote` event which can be binded through [Constructor properties](./PROPERTIES.md).

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.addChatItem('tab-1', {
    type: ChatItemType.ANSWER,
    messageId: '1', // Should be a unique one,
    canBeVoted: true,
    body: "Here's a message which **can** be voted."
});

mynahUI.addChatItem('tab-1', {
    type: ChatItemType.ANSWER,
    messageId: '2', // Should be a unique one,
    canBeVoted: false,
    body: "Here's another message which **cannot** be voted."
});
```

<p align="center">
  <img src="./img/data-model/chatItems/canBeVoted.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## `codeBlockActions`
With this parameter, you can add per chatitem code block actions to the code blocks inside that ChatItem. You can also override the actions added through [CONFIG](./CONFIG.md#codeblockactions). 

### Note
If you want to show that action only for certain coding languages, you can set the array for `acceptedLanguages` parameter. Keep in mind that it will check an exact mathc. If the incoming language is same with one of the acceptedLanguages list, it will show the action.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.addChatItem(tabId, {
  type: ChatItemType.ANSWER,
  body: `SOME CODE DIFF`,
  codeBlockActions: {
    'copy': undefined, // To override the one comes from the config by default
    'accept-diff': {
      id: 'accept-diff',
      label: 'Accept Diff',
      icon: MynahIcons.OK_CIRCLED,
      data: { // Can be "any"thing
        updatedCode: `SOME CODE DIFF APPLIED`
      },
      acceptedLanguages: ['diff-typescript']
    }
  }
});
```

<p align="center">
  <img src="./img/data-model/chatItems/codeBlockActions.png" alt="codeBlockActions" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## `footer`
With this parameter, you can add another `ChatItem` only with contents to the footer of a ChatItem. 

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.addChatItem(tabId, {
  type: ChatItemType.ANSWER,
  body: `SOME CONTENT`,
  footer: {
    fileList: { // For example, want to show which file is used to generate that answer
      rootFolderTitle: undefined,
      fileTreeTitle: '',
      filePaths: ['./src/index.ts'],
      details: {
        './src/index.ts': {
          icon: MynahIcons.FILE,
          description: `SOME DESCRIPTION.`
        }
      }
    }
  }
});
```

<p align="center">
  <img src="./img/data-model/chatItems/footer.png" alt="footer-1" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>
<p align="center">
  <img src="./img/data-model/chatItems/footer2.png" alt="footer-2" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## `relatedContent`
It allows you to show some related links under the body of the chat item. It shows one item and if you provided more user can expand the list with the show more button. 

If you also provide a markdown body for the source link, it will generate a tooltip to show more details for it.

See the example below.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.addChatItem('tab-1', {
    type: ChatItemType.ANSWER,
    messageId: '1', // Should be a unique one,
    body: "Here's a message with source links.",
    relatedContent: {
        title: 'Related Link',
        content: [
            {
                url: 'https://aws.com/deep/url/1',
                title: 'Related content 1',
                body: '## This is the body of the related\nAnd yes it also supports markdown!\n```typescript\nconst a = 5;\n```\n',
            },
            {
                url: 'https://aws.com/more/deeper/url/2',
                title: 'Related content 2',
            },
            {
                url: 'https://aws.com/deep/url/3',
                title: 'Related content 3',
            }
        ]
    }
});
```

<p align="center">
  <img src="./img/data-model/chatItems/relatedContent-1.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>
<p align="center">
  <img src="./img/data-model/chatItems/relatedContent-2.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>
<p align="center">
  <img src="./img/data-model/chatItems/relatedContent-3.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

### `fileList`

Use for showing a file list. You have to set the `fileList` attribute. See the example below.

**IMPORTANT NOTICE**: Do not forget that file lists will always be shown at the bottom of the card in case if you combine it body or form items. (Buttons will be at the most bottom, don't worry!)

You can also provide custom titles for the file list card and the root folder has to be used to wrap the files and folders. If you don't set anything, they'll use the defaults from `config.texts`. See [Config Documentation](./CONFIG.md#texts)

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.addChatItem(tabId, {
  type: ChatItemType.ANWER,
  fileList: {
    filePaths: [ 'src/App.tsx', 'devfile.yaml', 'src/App.test.tsx' ],
    deletedFiles: ['src/devfile.yaml'],
    // fileTreeTitle: "Custom file tree card title";
    // rootFolderTitle: "Custom root folder title";
    actions: {
      'src/App.tsx': [
        {
          icon: MynahIcons.CANCEL_CIRCLE,
          status: 'error',
          name: 'reject-change',
          description: 'Reject change'
        },
        {
          icon: MynahIcons.COMMENT,
          name: 'comment-to-change',
          description: 'Comment'
        }
      ]
    },
    details:{
      'src/devfile.yaml': {
        status: 'error',
        label: "Change rejected",
        icon: MynahIcons.REVERT,
        description: 'Markdown tooltip to show'
      }
    }
  },
  codeReference: [
    {
      information: 'Reference code *under the MIT license* from repository `amazon`.'
    },
    {
      information: 'Reference code *under the MIT license* from repository `aws`.'
    }
  ],
  canBeVoted: true,
  messageId: 'file-list-message'
});
```

**NOTE 1:** Actions will be shown only when you hover to the file.

**NOTE 2:** You can add actions and details for each file (**but not for folders**). Beware that you need to add those actions for each specific file as a map which **the key needs to be the path of the file**.

<p align="center">
  <img src="./img/data-model/chatItems/codeResult.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## `buttons`
It allows you to add actions inside a chat item card. **BUT, beware that when those actions are clicked if you set the `keepCardAfterClick` to false, they will remove the card they are in.**. 

**Another important point** for the buttons are related with the [`formItems`](#formItems), when a button is clicked and it keeps the card instead of removing it, **it will disable** all the form items and also the buttons inside that card.

Let's see the data type for buttons:
```typescript
interface ChatItemButton {
  keepCardAfterClick?: boolean; // default true, if you want the button to remove the card, set it to false
  waitMandatoryFormItems?: boolean; // Wait till the mandatory form items inside the same card to be filled to enable the button if there is any
  // Please see formItems section for a detailed usage
  text: string; // Text inside the button
  id: string; // id of the button, since when they are clicked they all call the same property onInBodyButtonClicked
  disabled?: boolean; // in any case if you want to make the button disabled (mandatory check will discard this)
  description?: string; // A text to be shown inside a tooltip and it can be markdown
  status?: 'info' | 'success' | 'warning' | 'error'; // 4 color status for the buttons
  icon?: MynahIcons; // in case if you want to put an icon to the button.
}
```

See the example below.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.addChatItem(tabId, {
    type: ChatItemType.ANSWER,
    messageId: new Date().getTime().toString(),
    body: `This is a card with actions inside!`,
    buttons: [
    {
        text: 'Action 1',
        id: 'action-1',
        status: 'info',
        icon: MynahIcons.CHAT
    },
    {
        text: 'Action 2',
        description: 'This action will not remove the card!',
        id: 'action-2',
        keepCardAfterClick: false, // So when this button is clicked, it will remove the whole card.
    },
    {
        text: 'Action 3',
        description: 'This is disabled for some reason!',
        id: 'action-3',
        disabled: true,
    },
    ],
});
```

<p align="center">
  <img src="./img/data-model/chatItems/actions.png" alt="buttons" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## `formItems`
It allows you to add some form elements inside a chat item card. Currently it supports `textarea`, `textinput`, `numericinput`, `stars`, `radiogroup` and `select` components. 

**Important notice:** You need to use [`buttons`](#buttons) to get the values set by the user for those options.

Let's take a look to the data type of a form item:
```typescript
interface ChatItemFormItem {
  id: string; // id is mandatory to understand to get the specific values for each form item when a button is clicked
  type: 'select' | 'textarea' | 'textinput' | 'numericinput' | 'stars' | 'radiogroup'; // type (see below for each of them)
  mandatory?: boolean; // If it is set to true, buttons in the same card with waitMandatoryFormItems set to true will wait them to be filled
  title?: string; // Label of the input
  placeholder?: string; // Placeholder for input, but only applicable to textarea, textinput and numericinput
  value?: string; // Initial value of the item. All types of form items will get and return string values, conversion of the value type is up to you
  options?: Array<{ // Only applicable to select and radiogroup types
    value: string;
    label: string;
  }>;
}
```

Since you can give unlimited form items with several different types, it might be good to know that some attributes are only applicable to some types. Like `options` attribute is only getting used by `select` and `radiogroup` items. Or `placeholder` is only getting used by `textarea`, `textinput` and `numericinput`.

**Another thing which might be interesting** is to know that if you set the `select` or the `radiogroup` mandatory, they'll be rendered as the first item's of them selected if you don't provide an initial value. And you cannot deselet a radio item in any case. For select, if it is mandatory there won't be the option `Please select...`


_**NOTE**: If you set `options` for `textinput` for example, it won't affect the textinput to be rendered and work properly._

##### Let's see a very detailed example below.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.addChatItem(tabId, {
    type: ChatItemType.ANSWER,
    messageId: new Date().getTime().toString(),
    body: 
    `Can you help us to improve our AI Assistant? Please fill the form below and hit **Submit** to send your feedback.
    _To send the form, mandatory items should be filled._`,
    formItems: [
        {
            id: 'expertise-area',
            type: 'select',
            title: `Area of expertise`,
            options: [
                {
                    label: 'Frontend',
                    value: 'frontend'
                },
                {
                    label: 'Backend',
                    value: 'backend'
                },
                {
                    label: 'Data Science',
                    value: 'datascience'
                },
                {
                    label: 'Other',
                    value: 'other'
                }
            ]
        },
        {
            id: 'preferred-ide',
            type: 'radiogroup',
            title: `Preferred IDE`,
            options: [
                {
                    label: 'VSCode',
                    value: 'vscode'
                },
                {
                    label: 'JetBrains IntelliJ',
                    value: 'intellij'
                },
                {
                    label: 'Visual Studio',
                    value: 'intellij'
                }
            ]
        },
        {
            id: 'working-hours',
            type: 'numericinput',
            title: `How many hours are you using an IDE weekly?`,
            placeholder: 'IDE working hours',
        },
        {
            id: 'email',
            type: 'textinput',
            mandatory: true,
            title: `Email`,
            placeholder: 'email',
        },
        {
            id: 'name',
            type: 'textinput',
            mandatory: true,
            title: `Name`,
            placeholder: 'Name and Surname',
        },
        {
            id: 'ease-of-usage-rating',
            type: 'stars',
            mandatory: true,
            title: `How easy is it to use our AI assistant?`,
        },
        {
            id: 'accuracy-rating',
            type: 'stars',
            mandatory: true,
            title: `How accurate are the answers you get from our AI assistant?`,
        },
        {
            id: 'general-rating',
            type: 'stars',
            title: `How do feel about our AI assistant in general?`,
        },
        {
            id: 'description',
            type: 'textarea',
            title: `Any other things you would like to share?`,
            placeholder: 'Write your feelings about our tool',
        }
    ],
    buttons: [
        {
            id: 'submit',
            text: 'Submit',
            status: 'info',
        },
        {
            id: 'cancel-feedback',
            text: 'Cancel',
            keepCardAfterClick: false,
            waitMandatoryFormItems: false,
        }
    ],
});
```

<p align="center">
  <img src="./img/data-model/chatItems/options.png" alt="formItems" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

In it's current state, you'll see some asterisk icons on the left of the label fields if the items are mandatory. And as you can see according to the configuration we've prepared above, `Submit` button is currently disabled. Because it waits the `email`, `name`, `ease of use stars` and `accuracy stars` to be filled/selected.

Let's see what happens when we fill them:

<p align="center">
  <img src="./img/data-model/chatItems/options-mandatory-filled.png" alt="formItems" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

**Now our `Submit` button is activated**. But before submitting it, let's fill all the fields.

<p align="center">
  <img src="./img/data-model/chatItems/options-all-filled.png" alt="formItems" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>


Ok, finally, when we click the `Submit` button, as it is configured that way, it will keep the card, but all the form fields and the buttons will be disabled. 

<p align="center">
  <img src="./img/data-model/chatItems/options-submitted.png" alt="formItems" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>


**Note:** As you can see. `Cancel` button has the value for `keepCardAfterClick` and `waitMandatoryItems` as `false` which means that `Cancel` button won't be disabled even if the form is not valid _(mandatory fields not filled)_ and when clicked it will remove the whole card.

A sample return to the [onInBodyButtonClicked](./PROPERTIES.md#oninbodybuttonclicked) function
```console
Body action clicked in message 1707218619540:
Action Id: submit
Action Text: Submit

Options:
expertise-area: frontend
preferred-ide: vscode
working-hours: 30
email: dogusata@amazon.com
name: Dogus Atasoy
ease-of-usage-rating: 5
accuracy-rating: 4
general-rating: 5
description: It is lovely!
```

---


## `status`
It allows you to set the border color of the card. Currently you can select one of the below status types: 

`success`, `info`, `error`, `warning`

See the example below.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.addChatItem(tabId, {
    type: ChatItemType.ANSWER,
    messageId: new Date().getTime().toString(),
    body: `This is a card with status indication border!`,
    status: 'success',
});
```

<p align="center">
  <img src="./img/data-model/chatItems/status.png" alt="status" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## `icon`
It allows you to set an icon on the left top corner of the card. You should use one from `MynahIcons`. 

See the example below.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

// Just the icon
mynahUI.addChatItem(tabId, {
    type: ChatItemType.ANSWER,
    messageId: new Date().getTime().toString(),
    body: `This is a card with an icon!`,
    icon: MynahIcons.CHAT,
});

// Icon with status
mynahUI.addChatItem(tabId, {
    type: ChatItemType.ANSWER,
    messageId: new Date().getTime().toString(),
    body: `This is a card with an icon and a status!`,
    status: 'info',
    icon: MynahIcons.CHAT,
});
```

<p align="center">
  <img src="./img/data-model/chatItems/icon.png" alt="icon" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## `followUp`
Followups allows you to add predefined direct triggers for the user for ease of use. Instead of typing a followup question, they can select from the provided ones. But you can also use them to get user input some from multiple choice options before going further for example. 

Here's the model for the `options` attribute for the `followUp`.

```typescript
interface ChatItemAction {
  type?: string;
  pillText: string;
  prompt?: string;
  disabled?: boolean;
  description?: string;
  status?: 'info' | 'success' | 'warning' | 'error';
  icon?: MynahIcons;
}
```

Let's see all the possible options you can do with the followups.

```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});

mynahUI.addChatItem('tab-1', {
    type: ChatItemType.ANSWER,
    followUp: {
        text: 'Followup All option types',
        options: [
            {
                pillText: 'Trigger automatically',
                prompt: 'This prompt will be triggered automatically',
            },
            {
                pillText: 'Followup with tooltip',
                description: 'This markdown will be shown **when you hover only**.'
            },
            {
                pillText: 'Status Danger',
                status: 'error',
                icon: MynahIcons.BLOCK,
            },
            {
                pillText: 'Status Warning',
                status: 'warning',
                icon: MynahIcons.WARNING,
            },
            {
                pillText: 'Status Ok',
                status: 'success',
                icon: MynahIcons.OK,
            },
            {
                pillText: 'Status Info',
                status: 'info',
            },
            {
                pillText: 'This is disabled',
                disabled: true,
            }
        ]
    }
});
```

<p align="center">
  <img src="./img/data-model/chatItems/followUp-1.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>


You can also make them appear on the right by just changing the type of the chat item.

```typescript
mynahUI.addChatItem('tab-1', {
    type: ChatItemType.SYSTEM_PROMPT,
    followUp: {
        ... // Same with above
    }
});
```

<p align="center">
  <img src="./img/data-model/chatItems/followUp-2.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

---

## `codeReference`
This is one of the most complex and hard to tell features you can use on `MynahUI`. But it basically allows you to add some highlights and let them show some tooltips when user hovers to them. 

They reflect their position according to the whole body

**BUT;** if they appear inside a code block, when user clicks one of the copy or the insert to cursor position buttons in the footer of the code block, that `codeReference` content span position will be recalculated according to the position inside the code block while sending it to the events `onCopyCodeToClipboard` or `onCodeInsertToCursorPosition` which can be binded through [Constructor properties](./PROPERTIES.md).

#### Note:
The position for the recommandation span has to be calculated considering all chars in the string. Even the back ticks etc.

```typescript
interface ReferenceTrackerInformation {
  licenseName?: string; // optional, not used on UI
  repository?: string; // optional, not used on UI
  url?: string; // optional, not used on UI
  recommendationContentSpan: {
    start: number;
    end: number;
  };
  information: string; // supports MARKDOWN, will be shown on tooltip
}
```

Let's see how it works and looks like.

To make it easy to read, let's assume that the below block is the body content for us and we've assigned it to a constant called **`bodyContent`**.

>\#\#\# How to create a React stateless function component\
\
*React .14* introduced a simpler way to define components called stateless functional components.\
\
First let's start generating a react \`functional\` component.
\
\
Functional components are just JavaScript functions. They take in an optional input which we call as \`props\`.
\
\
\`\`\`tsx\
import React from 'react';\
\
interface MyStatelessFunctionalComponentProps {\
    value: string;\
    onChange: (value: string) => void;\
}\
\
export const MyStatelessFunctionalComponent = (props: MyStatelessFunctionalComponentProps) => {\
    return <>\
        \<input\
            type="text"\
            placeholder="placeholder"\
            value={props.value}\
            onChange={props.onChange}/>\
    </>\
}\
\`\`\`\
\[Link inside body!\]\(https://google.com\).\
\
In this case, our input component will only use the given value through props which will come from the parent and it will not have any state. When you type into the input element, even it will change the value visually, it will not change the actual holded value. We should inform parent when the value is changed. We will use \`onChange\` prop here.\
&nbsp;

**And let's use that `bodyContent` now.**
```typescript
const mynahUI = new MynahUI({
    tabs: {
        'tab-1': {
            ...
        }
    }
});
const bodyContent = MARKDOWN; // above markdown text

mynahUI.addChatItem('tab-1', {
    type: ChatItemType.ANSWER,
    body: bodyContent,
    codeReference: [
        {
            recommendationContentSpan: {
                start: 362,
                end: 470
            },
            information: 'Reference code *under the MIT license* from repository `amazon`.'
        },
        {
            recommendationContentSpan: {
                start: 484,
                end: 514
            },
            information: '**Reference tracker information:**\n\rReference code *under the MIT license* from repository `aws`.'
        }
    ]
});
```

<p align="center">
  <img src="./img/data-model/chatItems/codeReference-1.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

Here's what you'll see when you hover to them.

<p align="center">
  <img src="./img/data-model/chatItems/codeReference-2.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

<p>
  <br />
</p>

---

<p>
  <br />
</p>

## `NotificationProps`

To show a notification inside the `MynahUI` block, you can use the notify function, and here's how they look like.

```typescript
enum NotificationType {
  INFO = ...,
  SUCCESS = ...,
  WARNING = ...,
  ERROR = ...,
}

interface NotificationProps {
  duration?: number;
  type?: NotificationType;
  title?: string;
  content: NotificationContentType | NotificationContentType[]; // Can be a string or HTMLElement
  onNotificationClick?: () => void;
  onNotificationHide?: () => void;
}
```

Here are some examples:

```typescript
const mynahUI = new MynahUI(...);
mynahUI.notify({
    content: 'Content block', // not optional
    duration: -1, // will stay forever until user cliks,
    type: NotificationType.INFO, // This is the default
    title: 'Notification',
});
```
<p align="center">
  <img src="./img/data-model/chatItems/notification-1.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
const mynahUI = new MynahUI(...);
mynahUI.notify({
    content: 'An error occured.',
    duration: 5000, // will stay 5 seconds on the screen
    type: NotificationType.ERROR,
    title: 'Error',
});
```

<p align="center">
  <img src="./img/data-model/chatItems/notification-2.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
const mynahUI = new MynahUI(...);
mynahUI.notify({
    content: 'This is the last warning!',
    duration: 5000,
    type: NotificationType.WARNING,
    title: 'Warning!',
});
```

<p align="center">
  <img src="./img/data-model/chatItems/notification-3.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>

```typescript
const mynahUI = new MynahUI(...);
mynahUI.notify({
    content: 'You\'ve succeeded!',
    duration: 5000,
    type: NotificationType.SUCCESS,
    title: 'Congrats!',
});
```

<p align="center">
  <img src="./img/data-model/chatItems/notification-4.png" alt="mainTitle" style="max-width:500px; width:100%;border: 1px solid #e0e0e0;">
</p>


---

## ChatPrompt
This is the object model which will be send along with the `onChatPrompt` event.

```typescript
export interface ChatPrompt {
  prompt?: string;
  escapedPrompt?: string; // Generally being used to send it back to mynah-ui for end user prompt rendering
  command?: string;
  context?: string[];
}
```