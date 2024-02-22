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
export const exampleSources = [{
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
}] as SourceLink[];

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
  body: '[Open Diff Viewer](#open-diff-viewer)',
  buttons: [
    {
      id:'open-diff-viewer',
      text: 'Open Diff Viewer',
      icon: MynahIcons.EXTERNAL,
      status: 'info',
      keepCardAfterClick: true,
      disabled: false
    }
  ],
  fileList: {
    filePaths: ['src/App.tsx', 'devfile.yaml', 'src/App.test.tsx'],
    deletedFiles: ['src/devfile.yaml'],
    actions: {
      'src/App.tsx': [
        {
          icon: MynahIcons.CANCEL_CIRCLE,
          status: 'info',
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
    details: {
      'src/devfile.yaml': {
        status: 'error',
        label: "Change rejected",
        icon: MynahIcons.REVERT
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
};

export const exampleFileListChatItemForUpdate: Partial<ChatItem> = {
  fileList: {
    filePaths: ['src/App.tsx', 'src/App.test.tsx'],
    details: {
      'src/App.tsx': {
        status: 'error',
        label: "File rejected",
        icon: MynahIcons.CANCEL_CIRCLE
      },
      'src/App.test.tsx': {
        status: 'warning',
        label: "Comment added",
        icon: MynahIcons.COMMENT
      }
    },
    actions: {
      'src/App.tsx': [
        {
          icon: MynahIcons.REVERT,
          name: 'revert-rejection',
          description: 'Revert rejection'
        }
      ],
      'src/App.test.tsx': [
        {
          icon: MynahIcons.PENCIL,
          name: 'update-comment',
          description: 'Update comment'
        }
      ]
    }
  },
};


export const exampleFormChatItem: ChatItem = {
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
          value: 'visualstudio'
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
};
