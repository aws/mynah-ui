import {
  ChatItemType,
  MynahUITabStoreTab,
  QuickActionCommandGroup
} from '@aws/mynah-ui';
import { Commands, mockFollowups, welcomeMessage } from './mocks/mock-data';

export const quickActionCommands: QuickActionCommandGroup[] = [
  {
    commands: [
      {
        command: Commands.HELP,
        description: 'Show help text.',
      },
      {
        command: Commands.CLEAR,
        description: 'Clear all chat.',
      }
    ],
  },
];

export const contextCommands: QuickActionCommandGroup[] = [
  {
    groupName: 'Mention code',
    commands: [
      {
        command: '@workspace',
        description: 'Reference all code in workspace.'
      }
    ]
  }
];

export const defaultDataSet: Partial<MynahUITabStoreTab> = {
  store: {
    tabTitle: 'Chat',
    cancelButtonWhenLoading: true,
    chatItems: [
      {
        type: ChatItemType.ANSWER,
        body: welcomeMessage,
        messageId: 'welcome-message'
      },
      mockFollowups
    ],
    quickActionCommands,
    contextCommands,
    promptInputPlaceholder: 'Type something or "/" for quick action commands or @ for choosing context',
  }
};
