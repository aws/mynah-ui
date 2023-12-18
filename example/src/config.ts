import {
  ChatItemType,
} from '@aws/mynah-ui';
export const WelcomeMessage = 'Hi, this is `MynahUI`. It is a data and event driven web based chat interface. MynahUI does not dependent on any framework. This example will return you always the same content. However, you can try different things. For example, you can enter `/` to see a list of quick actions or select followups appear after every answer.';

export enum Commands {
  INSERT_CODE = '/insert-dummy-code',
  COMMAND_WITH_PROMPT = '/with-prompt',
  NOTIFY = '/show-notification',
  CLEAR = '/clear',
  CLEAR_LOGS = '/clear-logs',
}
export const QuickActionCommands = [
  {
    groupName: 'Example actions',
    commands: [
      {
        command: Commands.INSERT_CODE,
        description: 'Inserts a dummy code for just for the example',
      },
    ],
  },
  {
    groupName: 'Other quick actions examples',
    commands: [
      {
        command: Commands.COMMAND_WITH_PROMPT,
        placeholder: 'Enter your prompt',
        description: 'You can write a prompt after selecting this command.',
      },
      {
        command: Commands.NOTIFY,
        description: 'It will show you a notification',
      },
    ],
  },
  {
    commands: [
      {
        command: Commands.CLEAR,
        description: 'Clears all the above messages',
      },
      {
        command: Commands.CLEAR_LOGS,
        description: 'Clears logs',
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
    ],
    quickActionCommands: QuickActionCommands,
    promptInputPlaceholder: 'Type something or "/" for quick action commands',
  }
};
