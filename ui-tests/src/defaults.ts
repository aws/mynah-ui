import {
  ChatItemType,
  ChatItem,
  MynahUITabStoreTab,
  QuickActionCommandGroup
} from '@aws/mynah-ui';

export enum Commands {
  HELP = '/help',
  CLEAR = '/clear'
}

export const welcomeMessage = `### MynahUI
Hello world!.`;

export const staticFollowups: ChatItem = {
  type: ChatItemType.ANSWER,
  messageId: new Date().getTime().toString(),
  followUp: {
      text: 'Mock followups',
      options: [
          {
              command: 'followup-1',
              pillText: 'Followup 1',
              description: 'Followup 1 description',
              prompt: 'Followup 1 prompt',
          },
          {
            command: 'followup-2',
            pillText: 'Followup 2',
            prompt: 'Followup 2 prompt',
        },
      ],
  },
};

export const quickActionCommands:QuickActionCommandGroup[] = [
  {
    commands: [
      {
        command: Commands.HELP,
        description: 'Show what MynahUI can do.',
      },
      {
        command: Commands.CLEAR,
        description: 'Clear previous chat.',
      }
    ],
  },
];

export const contextCommands:QuickActionCommandGroup[] =[
  {
    groupName: 'Mention code',
    commands:[
      {
        command: '@workspace',
        description: 'Reference all code in workspace.'
      }
    ]
  }
]

export const defaultDataSet:Partial<MynahUITabStoreTab> = {
  store: {
    tabTitle: 'Chat',
    cancelButtonWhenLoading: true,
    chatItems: [
      {
        type: ChatItemType.ANSWER,
        body: welcomeMessage,
        messageId: 'welcome-message'
      },
      staticFollowups
    ],
    quickActionCommands,
    contextCommands,
    promptInputPlaceholder: 'Type something or "/" for quick action commands or @ for choosing context',
  }
};
