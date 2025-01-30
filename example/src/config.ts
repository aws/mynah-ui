import {
  ChatItemType,
  MynahIcons,
} from '@aws/mynah-ui';
import { defaultFollowUps } from './samples/sample-data';
import { Commands } from './commands';
import { MynahUITabStoreTab, QuickActionCommandGroup } from '../../dist/static';
export const WelcomeMessage = `Hi, this is \`MynahUI\` and it is a **data and event driven** web based chat interface library and it is independent from any framework like react or vue etc.
In this example web app which uses mynah-ui as its renderer, we're simulating its capabilities with some static content with an IDE look&feel.

*To see more examples about the possible content types, interactions or various component types, you can type \`/\` to open the quick actions list panel.*
`;

export const QuickActionCommands:QuickActionCommandGroup[] = [
  {
    groupName: 'Examples of **Prompt input field** items',
    commands: [
      {
        command: Commands.INSERT_CODE,
        icon: MynahIcons.CODE_BLOCK,
        description: 'Inserts a dummy code under the prompt field which will be sent together with the prompt text.',
      },
      {
        command: Commands.COMMAND_WITH_PROMPT,
        icon: MynahIcons.ASTERISK,
        placeholder: 'Enter your prompt',
        description: 'A quick action command which is not running immediately after it is selected which allows you to write an additional prompt text if you want.',
      },
      {
        command: '/disabled',
        icon: MynahIcons.BLOCK,
        disabled: true,
        description: 'This item is disabled for some reason',
      },
      {
        command: Commands.SHOW_STICKY_CARD,
        icon: MynahIcons.INFO,
        description: 'You can stick a ChatItem card on top of the input field which will stay there independently from the conversation block. It might be handy to give some info to the user.',
      },

    ],
  },
  {
    groupName: 'Examples of **ChatItems**',
    commands: [
      {
        command: Commands.STATUS_CARDS,
        icon: MynahIcons.WARNING,
        description: 'ChatItem cards can tell more with some status colors on borders together with icons. See different examples with status colors applied!',
      },
      {
        command: Commands.FORM_CARD,
        icon: MynahIcons.LIST_ADD,
        description: 'ChatItem cards can have forms inside, including several input items and buttons!',
      },
      {
        command: Commands.FILE_LIST_CARD,
        icon: MynahIcons.FOLDER,
        description: 'ChatItem cards can show a file list with a proper file-tree look. And those files can have actions and statuses with information too.',
      },
      {
        command: Commands.CARD_WITH_MARKDOWN_LIST,
        icon: MynahIcons.CHECK_LIST,
        description: 'ChatItem card with a complex markdown list inside.',
      },
      {
        command: Commands.VOTE,
        icon: MynahIcons.THUMBS_UP,
        description: 'ChatItem card which can be voted',
      },
      {
        command: Commands.CARD_WITH_ALL_MARKDOWN_TAGS,
        icon: MynahIcons.HELP,
        description: 'ChatItem card with a markdown file with all markdown tags',
      },
      {
        command: Commands.CARD_RENDER_MARKDOWN_TABLE,
        icon: MynahIcons.TABS,
        description: 'ChatItem card for markdown table',
      },
      {
        command: Commands.CARD_SNAPS_TO_TOP,
        icon: MynahIcons.UP_OPEN,
        description: 'ChatItem card which snaps to top of the scolling container after the stream finishes or when the snapToTop value is set to true.',
      },
      {
        command: Commands.PROGRESSIVE_CARD,
        icon: MynahIcons.TRANSFORM,
        description: 'ChatItem cards can show a progress with its content. It doesn\'t have to be a stream by appending text each time.',
      },
      {
        command: Commands.IMAGE_IN_CARD,
        icon: MynahIcons.DOC,
        description: 'ChatItem cards can have various items which can be written with markdown and image is also one of them.',
      },
      {
        command: Commands.CUSTOM_RENDERER_CARDS,
        icon: MynahIcons.EXTERNAL,
        description: 'Struggling with markdown texts to produce a rich but static content which has to be done on the frontend client? Thinking about how to write html markups directly or even more better way? Custom renderers got your back!',
      },
      {
        command: Commands.FOLLOWUPS_AT_RIGHT,
        icon: MynahIcons.RIGHT_OPEN,
        description: 'You can set the position of the followups too. By simply setting the type of the ChatItem.',
      },
    ],
  },
  {
    groupName: 'Examples of **system wide components**',
    commands: [
      {
        command: Commands.SHOW_CUSTOM_FORM,
        icon: MynahIcons.CHECK_LIST,
        description: 'Do you know the feedback from which appears when you downvote a card and click to "Report an issue"? You can use that block generate your custom forms too.',
      },
      {
        command: Commands.NOTIFY,
        icon: MynahIcons.MEGAPHONE,
        description: 'It will show you a notification',
      },
    ],
  },
  {
    groupName: 'Actions for the **Demo App**',
    commands: [
      {
        command: Commands.CLEAR,
        icon: MynahIcons.TRASH,
        description: 'Clears all the messages in this tab.',
      },
      {
        command: Commands.CLEAR_LOGS,
        icon: MynahIcons.CANCEL,
        description: 'Clears logs on the bottom left.',
      },
    ],
  },
];

export const mynahUIDefaults:Partial<MynahUITabStoreTab> = {
  store: {
    tabTitle: 'Chat',
    cancelButtonWhenLoading: true,
    promptInputInfo: 'This is the information field. Check [MynahUI Data Model](https://github.com/aws/mynah-ui/blob/main/docs/DATAMODEL.md) for more details.',
    chatItems: [
      {
        type: ChatItemType.ANSWER,
        body: WelcomeMessage,
        messageId: 'welcome-message',
        followUp: defaultFollowUps.followUp
      },
    ],
    quickActionCommands: QuickActionCommands,
    contextCommands: [
      {
        groupName: 'Mention code',
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
    ],
    promptInputPlaceholder: 'Type something or "/" for quick action commands or @ for choosing context',
  }
};
