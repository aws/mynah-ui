import { SourceLink } from '@aws/mynah-ui';

export const mockSources = [
    {
        url: 'https://github.com/aws/mynah-ui',
        title: 'MynahUI',
        body: '#### A Data & Event Drivent Chat Interface Library for Browsers and Webviews',
    },
    {
        url: 'https://github.com/aws/mynah-ui/blob/main/docs/STARTUP.md',
        title: 'MynahUI initial setup',
        body: `Simply install it from npm with your favorite package manager.
  \`\`\`
  npm install @aws/mynah-ui
  \`\`\`
  `,
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
`,
    },
] as SourceLink[];