import {
  ChatItemType,
} from '@aws/mynah-ui';
import { defaultFollowUps } from './samples/sample-data';
import { Commands } from './commands';
export const WelcomeMessage = `Hi, this is \`MynahUI\` and it is a **data and event driven** web based chat interface library and it is independent from any framework like react or vue etc. 
In this example web app which uses mynah-ui as its renderer, we're simulating its capabilities with some static content with an IDE look&feel. 

*To see more examples about the possible content types, interactions or various component types, you can type \`/\` to open the quick actions list panel.*`;

export const QuickActionCommands = [
  {
    groupName: 'Prompt field examples',
    commands: [
      {
        command: Commands.INSERT_CODE,
        description: 'Inserts a dummy code under the prompt field which will be sent together with the prompt text.',
      },
      {
        command: Commands.COMMAND_WITH_PROMPT,
        placeholder: 'Enter your prompt',
        description: 'A quick action command which is not running immediately after it is selected which allows you to write an additional prompt text if you want.',
      },
      {
        command: Commands.SHOW_STICKY_CARD,
        description: 'You can stick a ChatItem card on top of the input field which will stay there independently from the conversation block. It might be handy to give some info to the user.',
      },
      
    ],
  },
  {
    groupName: 'ChatItem Card Examples',
    commands: [
      {
        command: Commands.STATUS_CARDS,
        description: 'ChatItem cards can tell more with some status colors on borders together with icons. See different examples with status colors applied!',
      },
      {
        command: Commands.FORM_CARD,
        description: 'ChatItem cards can have forms inside, including several input items and buttons!',
      },
      {
        command: Commands.FILE_LIST_CARD,
        description: 'ChatItem cards can show a file list with a proper file-tree look. And those files can have actions and statuses with information too.',
      },
      {
        command: Commands.PROGRESSIVE_CARD,
        description: 'ChatItem cards can show a progress with its content. It doesn\'t have to be a stream by appending text each time.',
      },
      {
        command: Commands.IMAGE_IN_CARD,
        description: 'ChatItem cards can have various items which can be written with markdown and image is also one of them.',
      },
      {
        command: Commands.CUSTOM_RENDERER_CARDS,
        description: 'Struggling with markdown texts to produce a rich but static content which has to be done on the frontend client? Thinking about how to write html markups directly or even more better way? Custom renderers got your back!',
      },
      {
        command: Commands.CUSTOM_RENDERER_CARDS,
        description: 'Struggling with markdown texts to produce a rich but static content which has to be done on the frontend client? Thinking about how to write html markups directly or even more better way? Custom renderers got your back!',
      },
      {
        command: Commands.FOLLOWUPS_AT_RIGHT,
        description: 'You can set the position of the followups too. By simply setting the type of the ChatItem.',
      },
    ],
  },
  {
    groupName: 'System wide components',
    commands: [
      {
        command: Commands.SHOW_CUSTOM_FORM,
        description: 'Do you know the feedback from which appears when you downvote a card and click to "Report an issue"? You can use that block generate your custom forms too.',
      },
      {
        command: Commands.NOTIFY,
        description: 'It will show you a notification',
      },
    ],
  },
  {
    groupName: 'Demo app related actions',
    commands: [
      {
        command: Commands.CLEAR,
        description: 'Clears all the messages in this tab.',
      },
      {
        command: Commands.CLEAR_LOGS,
        description: 'Clears logs on the bottom left.',
      },
    ],
  },
];

export const mynahUIDefaults = {
  store: {
    tabTitle: 'Chat',
    cancelButtonWhenLoading: true,
    promptInputInfo: 'This is the information field. Check [MynahUI Data Model](https://github.com/aws/mynah-ui/blob/main/docs/DATAMODEL.md) for more details.',
    chatItems: [
      {
        type: ChatItemType.ANSWER,
        body: WelcomeMessage,
        messageId: 'welcome-message'
      },
      defaultFollowUps
    ],
    quickActionCommands: QuickActionCommands,
    promptInputPlaceholder: 'Type something or "/" for quick action commands',
  }
};
