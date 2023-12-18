import { ChatItem, ChatItemType, MynahIcons, SourceLink } from '@aws/mynah-ui';
import md0 from './sample-0.md';
import md1 from './sample-1.md';
import md2 from './sample-2.md';
import md3 from './sample-3.md';
import md4 from './sample-4.md';
import md5 from './sample-5.md';
import md6 from './sample-6.md';
import md7 from './sample-7.md';
import md8 from './sample-8.md';
import md9 from './sample-9.md';
import md10 from './sample-10.md';
import SampleCode from './sample-code.md';

// react stateless function component example
export const exampleSources = [ {
  url: 'https://github.com/aws/mynah-ui',
  title: 'MynahUI',
  body: '### *A Data & Event Drivent Chat Interface Library for Browsers and Webviews*'
},
{
  url: 'https://github.com/aws/mynah-ui/blob/main/docs/STARTUP.md',
  title: 'MynahUI initial setup',
  body: `Simply install it from npm with your favorite package manager.
  \`\`\`
  npm install @aws/mynah-ui
  \`\`\`
  `
},
{
  url: 'https://github.com/aws/mynah-ui/blob/main/docs/USAGE.md',
  title: 'How to use MynahUI',
  body: `To see how to configure statics for MynahUI please refer to **[Configuration](./CONFIG.md)** document.

  Lastly before you start reading here, you can find more details on the **[Data Model](./DATAMODEL.md)** document. That document also contains visuals related with each type of the chat message in detail.
  
  
  #### All publicly available functions
  \`\`\`typescript
  mynahUI.addChatItem(...);
  mynahUI.addToUserPrompt(...);
  mynahUI.getSelectedTabId();
  mynahUI.notify(...);
  mynahUI.updateLastChatAnswer(...);
  mynahUI.updateStore(...);
  \`\`\`
`
} ] as SourceLink[];

export const exampleStreamParts = [
    `${md0 as string}`,
    `${md1 as string}`,
    `${md2 as string}`,
    `${md3 as string}`,
    `${md4 as string}`,
    `${md5 as string}`,
    `${md6 as string}`,
    `${md7 as string}`,
    `${md8 as string}`,
    `${md9 as string}`,
    `${md10 as string}`
];

export const exampleCodeBlockToInsert = SampleCode;

export enum followupTypes {
  FILE_LIST = 'create-file-list',
  FOLLOWUPS_ON_RIGHT = 'followups-on-right',
};
export const exampleRichFollowups: ChatItem = {
  type: ChatItemType.SYSTEM_PROMPT,
  messageId: new Date().getTime().toString(),
  followUp: {
    text: 'Rich followups',
    options: [
      {
        pillText: 'Accept',
        icon: MynahIcons.OK,
        description: 'You can accept by clicking this.',
        status: 'success',
      },
      {
        pillText: 'Reject',
        icon: MynahIcons.CANCEL,
        status: 'error',
      },
      {
        pillText: 'Retry',
        icon: MynahIcons.REFRESH,
        status: 'warning',
      },
      {
        pillText: 'Do nothing',
        icon: MynahIcons.BLOCK,
        status: 'info',
      }
    ]
  }
};

export const exampleFollowUps = {
  type: ChatItemType.ANSWER,
  messageId: new Date().getTime().toString(),
  followUp: {
    text: 'Example followups',
    options: [
      {
        pillText: 'Example file list',
        type: followupTypes.FILE_LIST
      },
      {
        pillText: 'Followups on right',
        type: followupTypes.FOLLOWUPS_ON_RIGHT
      },
      {
        pillText: 'Some reply',
        prompt: 'Some random reply here'
      }
    ]
  }
};

export const exampleFileListChatItem: ChatItem = {
  type: ChatItemType.CODE_RESULT,
  fileList: {
    filePaths: [ 'src/App.tsx', 'devfile.yaml', 'src/App.test.tsx' ],
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
  messageId: new Date().getTime().toString()
};
