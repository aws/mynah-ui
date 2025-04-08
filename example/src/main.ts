/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { Connector, INITIAL_STREAM_DELAY } from './connector';
import {
  MynahUI,
  MynahUIDataModel,
  ChatPrompt,
  RelevancyVoteType,
  ChatItemType,
  FeedbackPayload,
  ChatItemAction,
  NotificationType,
  ChatItem,
  MynahIcons,
  generateUID,
  KeyMap,
} from '@aws/mynah-ui';
import { mynahUIDefaults } from './config';
import { Log, LogClear } from './logger';
import {
  exampleCodeBlockToInsert,
  exampleCustomRendererWithHTMLMarkup,
  exampleCustomRendererWithDomBuilderJson,
  exampleFileListChatItem,
  exampleFileListChatItemForUpdate,
  defaultFollowUps,
  exampleFormChatItem,
  exampleImageCard,
  exampleProgressCards,
  exampleRichFollowups,
  exampleStreamParts,
  sampleMarkdownList,
  exampleCodeDiff,
  exampleCodeDiffApplied,
  sampleAllInOneList,
  sampleTableList,
  exampleInformationCard,
  exploreTabData,
  qAgentQuickActions,
  welcomeScreenTabData,
  exampleConfirmationButtons,
  exampleButtons,
  exampleStatusButtons,
  exampleVoteChatItem,
  sampleHeaderTypes,
} from './samples/sample-data';
import escapeHTML from 'escape-html';
import './styles/styles.scss';
import { ThemeBuilder } from './theme-builder/theme-builder';
import { Commands } from './commands';

export const createMynahUI = (initialData?: MynahUIDataModel): MynahUI => {
  const connector = new Connector();
  let streamingMessageId: string | null;
  let showChatAvatars: boolean = false;

  const mynahUI = new MynahUI({
    splashScreenInitialStatus: {
      visible: true,
      text: 'Initializing'
    },
    rootSelector: '#amzn-mynah-website-wrapper',
    defaults: {
      store: {
        ...(mynahUIDefaults.store),
        showChatAvatars
      }
    },
    config: {
      maxTabs: 5,
      maxTabsTooltipDuration: 5000,
      noMoreTabsTooltip: 'You can only open five conversation tabs at a time.',
      autoFocus: true,
      texts: {
        feedbackFormDescription: '_Feedback is anonymous. For issue updates, please contact us on [GitHub](https://github.com/aws/mynah-ui/issues)._'
      },
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
              id: 'new-welcome-screen',
              text: 'Welcome screen',
              icon: MynahIcons.Q,
            },
            {
              id: 'splash-loader',
              text: 'Show splash loader',
              icon: MynahIcons.PAUSE,
            },
            {
              id: 'custom-data-check',
              text: 'Custom check',
              icon: MynahIcons.MAGIC,
            },
            {
              id: 'history_sheet',
              text: 'Sheet (History)',
              icon: MynahIcons.HISTORY,
            },
            {
              id: 'memory_sheet',
              text: 'Sheet (Memory)',
              icon: MynahIcons.COMMENT,
            },
            {
              id: 'show-avatars',
              text: 'Show/Hide avatars',
              icon: MynahIcons.USER,
            },
            {
              id: 'show-code-diff',
              text: 'Show code diff!',
              icon: MynahIcons.CODE_BLOCK,
            },
            {
              id: 'insert-code',
              icon: MynahIcons.CURSOR_INSERT,
              text: 'Insert code!',
            },
            {
              id: 'save-session',
              icon: MynahIcons.DEPLOY,
              text: 'Save session',
            },
            {
              id: 'remove-saved-session',
              icon: MynahIcons.REVERT,
              text: 'Remove saved session',
            },
            {
              id: 'export-chat-md',
              icon: MynahIcons.EXTERNAL,
              text: 'Export chat (md)',
            },
            {
              id: 'export-chat-html',
              icon: MynahIcons.EXTERNAL,
              text: 'Export chat (html)',
            },
            {
              id: 'enable-disable-progress-bar',
              icon: MynahIcons.PLAY,
              text: 'Enable/disable Progress bar',
            },
          ],
        },
      ],
    },
    tabs: JSON.parse(localStorage.getItem('mynah-ui-storage') as string) ?? {
      'tab-1': {
        isSelected: true,
        store: {
          ...mynahUIDefaults.store,
          ...welcomeScreenTabData.store,
        },
      },
    },
    onPromptInputOptionChange: (tabId, optionsValues)=>{
      Log(`Prompt options change for tab <b>${tabId}</b>:<br/>
        ${optionsValues
            ? `<br/>Options:<br/>${Object.keys(optionsValues)
              .map(optionId => {
                return `<b>${optionId}</b>: ${(optionsValues as Record<string, string>)[optionId] ?? ''}`;
              })
              .join('<br/>')}`
            : ''
          }
        `);
    },
    onFocusStateChanged: (focusState: boolean) => {
      Log(`MynahUI focus state changed: <b>${focusState.toString()}</b>`);
    },
    onTabBarButtonClick: (tabId: string, buttonId: string) => {
      if (buttonId === 'clear') {
        mynahUI.updateStore(tabId, {
          chatItems: [],
        });
      } else if (buttonId === 'show-code-diff') {
        mynahUI.addChatItem(tabId, {
          type: ChatItemType.ANSWER,
          body: exampleCodeDiff,
          codeBlockActions: {
            'copy': undefined,
            'accept-diff': {
              id: 'accept-diff',
              label: 'Accept Diff',
              flash: 'infinite',
              icon: MynahIcons.OK_CIRCLED,
              acceptedLanguages: ['diff-typescript'],
              data: {
                updatedCode: exampleCodeDiffApplied
              }
            }
          }
        });
        mynahUI.addChatItem(tabId, defaultFollowUps);
      } else if (buttonId === 'insert-code') {
        mynahUI.addToUserPrompt(tabId, exampleCodeBlockToInsert, 'code');
      } else if (buttonId === 'show-avatars') {
        showChatAvatars = !showChatAvatars;
        Object.keys(mynahUI.getAllTabs()).forEach(tabIdFromStore => mynahUI.updateStore(tabIdFromStore, {
          showChatAvatars: showChatAvatars
        }));
      } else if (buttonId === 'splash-loader') {
        mynahUI.toggleSplashLoader(true, 'Showing splash loader...');
        setTimeout(() => {
          mynahUI.toggleSplashLoader(false);
        }, 10000);
      } else if (buttonId === 'custom-data-check') {
        // Use for custom temporary checks
        mynahUI.addChatItem(tabId, {
          type: ChatItemType.ANSWER,
          title: 'SAVE THE DATE',
          header: {
            icon: 'calendar',
            iconStatus: 'primary',
            body: '## Soon, a new version will be released!'
          },
          fullWidth: true,
          canBeDismissed: true,
          body: "We're improving the performance, adding new features or making new UX changes every week. Save the date for new updates!."
        });
      } else if (buttonId === 'history_sheet') {
        const { update, close, changeTarget, getTargetElementId } = mynahUI.openDetailedList({
          tabId,
          detailedList:
          {
            header: {
              title: 'Chat history',
            },
            selectable: true,
            filterOptions: [
              {
                type: 'textinput',
                icon: MynahIcons.SEARCH,
                id: generateUID(),
                placeholder: 'Search...',
                autoFocus: true,
              }
            ],
            list: [
              {
                groupName: 'Today',
                children: [{
                  id: generateUID(),
                  icon: MynahIcons.CHAT,
                  description: 'Why is this unit test failing?',
                  actions: [
                    {
                      id: generateUID(),
                      icon: MynahIcons.EXTERNAL,
                      text: 'Export'
                    },
                    {
                      id: generateUID(),
                      icon: MynahIcons.TRASH,
                      text: 'Delete'
                    },
                  ],
                },
                {
                  id: generateUID(),
                  icon: MynahIcons.CHAT,
                  description: '**Can you explain this error message in more detail? ArrayIndexOutOfBoundsException: 10 at Main.main(Main.java:4)**',
                  actions: [
                    {
                      id: generateUID(),
                      icon: MynahIcons.EXTERNAL,
                      text: 'Export'
                    },
                    {
                      id: generateUID(),
                      icon: MynahIcons.TRASH,
                      text: 'Delete'
                    },
                  ],
                },
                {
                  id: generateUID(),
                  icon: MynahIcons.CHECK_LIST,
                  description: '/test encrypt_input',
                  actions: [
                    {
                      id: generateUID(),
                      icon: MynahIcons.EXTERNAL,
                      text: 'Export'
                    },
                    {
                      id: generateUID(),
                      icon: MynahIcons.TRASH,
                      text: 'Delete'
                    },
                  ],
                }
                ]
              },
              {
                groupName: 'Yesterday',
                children: [{
                  id: generateUID(),
                  icon: MynahIcons.CHAT,
                  description: 'How can I optimize utils.py for better performance?',
                  actions: [
                    {
                      id: generateUID(),
                      icon: MynahIcons.EXTERNAL,
                      text: 'Export'
                    },
                    {
                      id: generateUID(),
                      icon: MynahIcons.TRASH,
                      text: 'Delete'
                    },
                  ],
                },
                {
                  id: generateUID(),
                  icon: MynahIcons.CODE_BLOCK,
                  description: '/dev Create a new REST API endpoint /api/authenticate to handle user authentication',
                  actions: [
                    {
                      id: generateUID(),
                      icon: MynahIcons.EXTERNAL,
                      text: 'Export'
                    },
                    {
                      id: generateUID(),
                      icon: MynahIcons.TRASH,
                      text: 'Delete'
                    },
                  ],
                },
                {
                  id: generateUID(),
                  icon: MynahIcons.CHAT,
                  description: '**@workspace provide a refactored version of the endpoint() function**',
                  actions: [
                    {
                      id: generateUID(),
                      icon: MynahIcons.EXTERNAL,
                      text: 'Export'
                    },
                    {
                      id: generateUID(),
                      icon: MynahIcons.TRASH,
                      text: 'Delete'
                    },
                  ],
                },
                {
                  id: generateUID(),
                  icon: MynahIcons.CHAT,
                  description: 'Explain the code in the mcp directory',
                  actions: [
                    {
                      id: generateUID(),
                      icon: MynahIcons.EXTERNAL,
                      text: 'Export'
                    },
                    {
                      id: generateUID(),
                      icon: MynahIcons.TRASH,
                      text: 'Delete'
                    },
                  ],
                }
                ]
              },
              {
                groupName: '4 days ago',
                children: [{
                  id: generateUID(),
                  icon: MynahIcons.CHAT,
                  description: 'What are the dependencies of this module?',
                  actions: [
                    {
                      id: generateUID(),
                      icon: MynahIcons.EXTERNAL,
                      text: 'Export'
                    },
                    {
                      id: generateUID(),
                      icon: MynahIcons.TRASH,
                      text: 'Delete'
                    },
                  ],
                },
                {
                  id: generateUID(),
                  icon: MynahIcons.CODE_BLOCK,
                  description: '/dev Update CSS styles for responsive layout',
                  actions: [
                    {
                      id: generateUID(),
                      icon: MynahIcons.EXTERNAL,
                      text: 'Export'
                    },
                    {
                      id: generateUID(),
                      icon: MynahIcons.TRASH,
                      text: 'Delete'
                    },
                  ],
                },
                ]
              },
              {
                groupName: 'Last week',
                children: [{
                  id: generateUID(),
                  icon: MynahIcons.CODE_BLOCK,
                  description: '**/dev Optimize image loading for faster page loads**',
                  actions: [
                    {
                      id: generateUID(),
                      icon: MynahIcons.EXTERNAL,
                      text: 'Export'
                    },
                    {
                      id: generateUID(),
                      icon: MynahIcons.TRASH,
                      text: 'Delete'
                    },
                  ],
                },
                {
                  id: generateUID(),
                  icon: MynahIcons.CHAT,
                  description: 'What are some alternatives to generating a unique salt value in encrypt()?',
                  actions: [
                    {
                      id: generateUID(),
                      icon: MynahIcons.EXTERNAL,
                      text: 'Export'
                    },
                    {
                      id: generateUID(),
                      icon: MynahIcons.TRASH,
                      text: 'Delete'
                    },
                  ],
                },
                {
                  id: generateUID(),
                  icon: MynahIcons.CHAT,
                  description: '**Generate a regular expression pattern that matches email addresses**',
                  actions: [
                    {
                      id: generateUID(),
                      icon: MynahIcons.EXTERNAL,
                      text: 'Export'
                    },
                    {
                      id: generateUID(),
                      icon: MynahIcons.TRASH,
                      text: 'Delete'
                    },
                  ],
                },
                {
                  id: generateUID(),
                  icon: MynahIcons.CHAT,
                  description: 'Convert the selected code snippet to typescript',
                  actions: [
                    {
                      id: generateUID(),
                      icon: MynahIcons.EXTERNAL,
                      text: 'Export'
                    },
                    {
                      id: generateUID(),
                      icon: MynahIcons.TRASH,
                      text: 'Delete'
                    },
                  ],
                },
                {
                  id: generateUID(),
                  icon: MynahIcons.CHAT,
                  description: 'Rewrite this sort function to use the merge sort algorithm',
                  actions: [
                    {
                      id: generateUID(),
                      icon: MynahIcons.EXTERNAL,
                      text: 'Export'
                    },
                    {
                      id: generateUID(),
                      icon: MynahIcons.TRASH,
                      text: 'Delete'
                    },
                  ],
                },
                ]
              }
            ]
          },
          events: {
            onFilterValueChange: (filterValues: Record<string, any>, isValid: boolean) => {
              Log('Filter changed');
            },
            onKeyPress: (e) => {
              Log('Key pressed');
              if (e.key === KeyMap.ESCAPE) {
                close();
              }
              else if (e.key === KeyMap.ARROW_UP) {
                changeTarget('up', true)
              }
              else if (e.key === KeyMap.ARROW_DOWN) {
                changeTarget('down', true)
              }
              else if (e.key === KeyMap.ENTER) {
                Log('Selected item with id: ' + getTargetElementId())
              }
            },
            onItemSelect: (detailedListItem) => {
              Log('Item selected');
            },
            onActionClick: (button) => {
              Log('Action clicked')
            },
            onClose: () => {
              Log('Sheet closed')
            },
          }
        });
      } else if (buttonId === 'memory_sheet') {
        const { close, update, changeTarget } = mynahUI.openDetailedList({
          tabId,
          detailedList:
          {
            header: {
              title: 'Memories (16)',
            },
            textDirection: 'column',
            selectable: false,
            filterOptions: [
              {
                type: 'textinput',
                icon: MynahIcons.SEARCH,
                id: generateUID(),
                placeholder: 'Search...',
                autoFocus: true,
              },
              {
                type: 'select',
                id: generateUID(),
                icon: MynahIcons.CHECK_LIST,
                placeholder: 'All memories',
                options: [
                  {
                    label: 'Created by user',
                    value: 'user'
                  },
                  {
                    label: 'Inferred by Q',
                    value: 'q'
                  }
                ],
              }
            ],
            list: [
              {
                groupName: 'Today',
                children: [{
                  title: '“Always add comments to my lines of Rust”',
                  description: 'Created by *user* at **2:45pm** on 1/2/24',
                  actions: [
                    {
                      id: generateUID(),
                      icon: MynahIcons.PENCIL,
                      text: 'Edit'
                    },
                    {
                      id: generateUID(),
                      icon: MynahIcons.TRASH,
                      text: 'Delete'
                    },
                  ],
                },
                {
                  title: '“Always add comments to my lines of Rust”',
                  description: 'Created by user at **2:45pm** on 1/2/24',
                  actions: [
                    {
                      id: generateUID(),
                      icon: MynahIcons.PENCIL,
                      text: 'Edit'
                    },
                    {
                      id: generateUID(),
                      icon: MynahIcons.TRASH,
                      text: 'Delete'
                    },
                  ],
                }
                ]
              },
              {
                groupName: 'Yesterday',
                children: [
                  {
                    title: '“Another memory”',
                    description: 'Inferred by Q at 2:45pm on 1/2/24',
                    actions: [
                      {
                        id: generateUID(),
                        icon: MynahIcons.PENCIL,
                        text: 'Edit'
                      },
                      {
                        id: generateUID(),
                        icon: MynahIcons.TRASH,
                        text: 'Delete'
                      },
                    ],
                  },
                  {
                    title: '“Another memory”',
                    description: 'Inferred by Q at 2:45pm on 1/2/24',
                    actions: [
                      {
                        id: generateUID(),
                        icon: MynahIcons.PENCIL,
                        text: 'Edit'
                      },
                      {
                        id: generateUID(),
                        icon: MynahIcons.TRASH,
                        text: 'Delete'
                      },
                    ],
                  },
                  {
                    title: '“Another memory”',
                    description: 'Inferred by Q at 2:45pm on 1/2/24',
                    actions: [
                      {
                        id: generateUID(),
                        icon: MynahIcons.PENCIL,
                        text: 'Edit'
                      },
                      {
                        id: generateUID(),
                        icon: MynahIcons.TRASH,
                        text: 'Delete'
                      },
                    ],
                  },
                  {
                    title: '“Another memory”',
                    description: 'Inferred by Q at 2:45pm on 1/2/24',
                    actions: [
                      {
                        id: generateUID(),
                        icon: MynahIcons.PENCIL,
                        text: 'Edit'
                      },
                      {
                        id: generateUID(),
                        icon: MynahIcons.TRASH,
                        text: 'Delete'
                      },
                    ],
                  }
                ]
              },
              {
                groupName: '4 days ago',
                children: [
                  {
                    title: '“Another memory”',
                    description: 'Inferred by Q at 2:45pm on 1/2/24',
                    actions: [
                      {
                        id: generateUID(),
                        icon: MynahIcons.PENCIL,
                        text: 'Edit'
                      },
                      {
                        id: generateUID(),
                        icon: MynahIcons.TRASH,
                        text: 'Delete'
                      },
                    ],
                  },
                  {
                    title: '“Another memory”',
                    description: 'Inferred by Q at 2:45pm on 1/2/24',
                    actions: [
                      {
                        id: generateUID(),
                        icon: MynahIcons.PENCIL,
                        text: 'Edit'
                      },
                      {
                        id: generateUID(),
                        icon: MynahIcons.TRASH,
                        text: 'Delete'
                      },
                    ],
                  },
                ]
              },
              {
                groupName: 'Last week',
                children: [
                  {
                    title: '“Another memory”',
                    description: 'Inferred by Q at 2:45pm on 1/2/24',
                    actions: [
                      {
                        id: generateUID(),
                        icon: MynahIcons.PENCIL,
                        text: 'Edit'
                      },
                      {
                        id: generateUID(),
                        icon: MynahIcons.TRASH,
                        text: 'Delete'
                      },
                    ],
                  },
                  {
                    title: '“Another memory”',
                    description: 'Inferred by Q at 2:45pm on 1/2/24',
                    actions: [
                      {
                        id: generateUID(),
                        icon: MynahIcons.PENCIL,
                        text: 'Edit'
                      },
                      {
                        id: generateUID(),
                        icon: MynahIcons.TRASH,
                        text: 'Delete'
                      },
                    ],
                  },
                  {
                    title: '“Another memory”',
                    description: 'Inferred by Q at 2:45pm on 1/2/24',
                    actions: [
                      {
                        id: generateUID(),
                        icon: MynahIcons.PENCIL,
                        text: 'Edit'
                      },
                      {
                        id: generateUID(),
                        icon: MynahIcons.TRASH,
                        text: 'Delete'
                      },
                    ],
                  },
                  {
                    title: '“Another memory”',
                    description: 'Inferred by Q at 2:45pm on 1/2/24',
                    actions: [
                      {
                        id: generateUID(),
                        icon: MynahIcons.PENCIL,
                        text: 'Edit'
                      },
                      {
                        id: generateUID(),
                        icon: MynahIcons.TRASH,
                        text: 'Delete'
                      },
                    ],
                  },
                  {
                    title: '“Another memory”',
                    description: 'Inferred by Q at 2:45pm on 1/2/24',
                    actions: [
                      {
                        id: generateUID(),
                        icon: MynahIcons.PENCIL,
                        text: 'Edit'
                      },
                      {
                        id: generateUID(),
                        icon: MynahIcons.TRASH,
                        text: 'Delete'
                      },
                    ],
                  },
                ]
              }
            ]
          },
          events: {
            onFilterValueChange: (filterValues: Record<string, any>, isValid: boolean) => {
              Log('Filter changed');
            },
            onKeyPress: (e) => {
              Log('Key pressed');
              if (e.key === KeyMap.ESCAPE) {
                close();
              }
            },
            onItemSelect: (detailedListItem) => {
              Log('Item selected');
            },
            onActionClick: (button) => {
              Log('Action clicked')
            },
            onClose: () => {
              Log('Sheet closed')
            },
          }
        });
        // update({

        // });
      } else if (buttonId === 'save-session') {
        localStorage.setItem('mynah-ui-storage', JSON.stringify(mynahUI.getAllTabs()));
      } else if (buttonId === 'remove-saved-session') {
        localStorage.removeItem('mynah-ui-storage');
        window.location.reload();
      } else if (buttonId === 'new-welcome-screen') {
        mynahUI.updateStore('', {
          ...mynahUIDefaults.store,
          ...welcomeScreenTabData.store
        });
      } else if (buttonId === 'export-chat-md') {
        const serializedChat = mynahUI.serializeChat(tabId, 'markdown')
        const blob = new Blob([serializedChat], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'exported-chat.md';
        link.href = url;
        link.click();

        mynahUI.notify({
          type: NotificationType.SUCCESS,
          title: 'Chat exported',
          content: 'The file will be downloaded.',
        });
      } else if (buttonId === 'export-chat-html') {
        const serializedChat = mynahUI.serializeChat(tabId, 'html')
        const blob = new Blob([serializedChat], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'exported-chat.html';
        link.href = url;
        link.click();

        mynahUI.notify({
          type: NotificationType.SUCCESS,
          title: 'Chat exported',
          content: 'The file will be downloaded.',
        });
      } else if (buttonId === 'enable-disable-progress-bar') {
        const currStatus = mynahUI.getTabData(tabId);
        if (currStatus.store.promptInputProgress != null) {
          mynahUI.updateStore(tabId, { promptInputProgress: null });
        } else {
          mynahUI.updateStore(tabId, {
            promptInputProgress: {
              status: 'default',
              text: 'Progressing...',
              value: -1,
            }
          });
        }
      }
      Log(`Tab bar button clicked when tab ${tabId} is selected: <b>${buttonId}</b>`);
    },
    onTabAdd: (tabId: string) => {
      Log(`New tab added: <b>${tabId}</b>`);
    },
    onContextSelected(contextItem) {
      if (contextItem.command === 'Add Prompt') {
        Log('Custom context action triggered for adding a prompt!')
        return false;
      }
      return true;
    },
    onBeforeTabRemove: (tabId: string): boolean => {
      const isTabLoading = mynahUI.getAllTabs()[tabId].store?.loadingChat;
      if (isTabLoading) {
        Log(`Confirmation Popup appeared on tab remove: <b>${tabId}</b>`);
      }
      return !isTabLoading;
    },
    onTabRemove: (tabId: string) => {
      Log(`Tab removed: <b>${tabId}</b>`);
    },
    onTabChange: (tabId: string) => {
      Log(`Tab changed to: <b>${tabId}</b>`);
    },
    onSendFeedback: (tabId: string, feedbackPayload: FeedbackPayload) => {
      Log(`Feedback sent <br/>
      type: <b>${feedbackPayload.selectedOption}</b><br/>
      comment: <b>${feedbackPayload.comment ?? 'no comment'}</b>`);
      if (feedbackPayload.comment !== undefined) {
        mynahUI.notify({
          type: NotificationType.INFO,
          title: 'Your feedback is sent',
          content: 'Thanks for your feedback.',
        });
      }
    },
    onShowMoreWebResultsClick: (tabId, messageId) => {
      Log(`Show more sources clicked for tab <b>${tabId}/${messageId}</b> in message <b>${messageId}</b>`);
    },
    onCopyCodeToClipboard: (tabId, messageId, code, type, referenceTrackerInformation, eventId, codeBlockIndex, totalCodeBlocks) => {
      Log(`Code copied to clipboard from tab <b>${tabId}</b> inside message <b>${messageId}</b><br/>
        type: <b>${type ?? 'unknown'}</b><br/>
        code: <b>${escapeHTML(code ?? '')}</b><br/>
        referenceTracker: <b>${referenceTrackerInformation?.map(rt => rt.information).join('<br/>') ?? ''}</b><br/>
        codeBlockIndex: <b>${(codeBlockIndex ?? 0) + 1}</b> of ${totalCodeBlocks}
      `);
    },
    onCodeInsertToCursorPosition: (tabId, messageId, code, type, referenceTrackerInformation, eventId, codeBlockIndex, totalCodeBlocks) => {
      Log(`Code insert to position clicked on tab <b>${tabId}</b> inside message <b>${messageId}</b><br/>
        type: <b>${type ?? 'unknown'}</b><br/>
        code: <b>${escapeHTML(code ?? '')}</b><br/>
        referenceTracker: <b>${referenceTrackerInformation?.map(rt => rt.information).join('<br/>') ?? ''}</b><br/>
        codeBlockIndex: <b>${(codeBlockIndex ?? 0) + 1}</b> of ${totalCodeBlocks}
      `);
    },
    onCodeBlockActionClicked: (tabId, messageId, actionId, data, code, type, referenceTrackerInformation, eventId, codeBlockIndex, totalCodeBlocks) => {
      Log(`Code action <b>${actionId}</b> clicked on tab <b>${tabId}</b> inside message <b>${messageId}</b><br/>
        type: <b>${type ?? 'unknown'}</b><br/>
        data: <b>${JSON.stringify(data ?? {})}</b><br/>
        code: <b>${escapeHTML(code ?? '')}</b><br/>
        referenceTracker: <b>${referenceTrackerInformation?.map(rt => rt.information).join('<br/>') ?? ''}</b><br/>
        codeBlockIndex: <b>${(codeBlockIndex ?? 0) + 1}</b> of ${totalCodeBlocks}
      `);
    },
    onChatPrompt: (tabId: string, prompt: ChatPrompt) => {
      Log(`New prompt on tab: <b>${tabId}</b><br/>
      prompt: <b>${prompt.prompt !== undefined && prompt.prompt !== '' ? prompt.prompt : '{command only}'}</b><br/>
      command: <b>${prompt.command ?? '{none}'}</b><br/>
      options: <b>{${Object.keys(prompt.options??{}).map(op=>`'${op}': '${prompt.options?.[op] as string}'`).join(',') ?? ''}}</b><br/>
      context: <b>[${(prompt.context ?? []).map(ctx => `${JSON.stringify(ctx)}`).join(']</b>, <b>[')}]`);
      if (tabId === 'tab-1') {
        mynahUI.updateStore(tabId, {
          tabCloseConfirmationMessage: `Working on "${prompt.prompt}"`,
        });
      }
      if (mynahUI.getAllTabs()[tabId].store?.compactMode) {
        mynahUI.updateStore(tabId, {
          compactMode: false,
          tabHeaderDetails: null,
          ...mynahUIDefaults.store,
          chatItems: [],
          tabBackground: false,
          promptInputLabel: null,
        });
      }
      onChatPrompt(tabId, prompt);
    },
    onStopChatResponse: (tabId: string) => {
      streamingMessageId = null;
      mynahUI.updateStore(tabId, {
        loadingChat: false
      });
      Log(`Stop generating code: <b>${tabId}</b>`);
    },
    onFollowUpClicked: (tabId: string, messageId: string, followUp: ChatItemAction) => {
      Log(`Followup click: <b>${followUp.pillText}</b>`);
      if (followUp.prompt != null || followUp.command != null) {
        if (followUp.command === Commands.REPLACE_FOLLOWUPS) {

          mynahUI.addChatItem(tabId, {
            type: ChatItemType.ANSWER,
            messageId: 'my-message-id',
            body: 'Hello',
          });

          setTimeout(() => {
            mynahUI.updateChatAnswerWithMessageId(tabId, 'my-message-id', {
              followUp: exampleRichFollowups.followUp
            });
            setTimeout(() => {
              mynahUI.updateChatAnswerWithMessageId(tabId, 'my-message-id', {
                followUp: defaultFollowUps.followUp,
              })
            }, 1500)
          }, 1500);
        } else {
          if (followUp.command != null) {
            mynahUI.addChatItem(tabId, {
              type: ChatItemType.PROMPT,
              body: `Example: **${followUp.pillText}**
              <sub><sup>_can be triggered with **${followUp.command}**_</sup></sub>`
            });
          }
          onChatPrompt(tabId, {
            command: followUp.command,
            prompt: followUp.prompt,
            escapedPrompt: followUp.escapedPrompt ?? followUp.prompt,
          });
        }
      }
    },
    onChatPromptProgressActionButtonClicked: (tabId: string, action) => {
      Log(`Chat prompt progress action clicked on tab <b>${tabId}</b>:<br/>
      Action Id: <b>${action.id}</b><br/>
      Action Text: <b>${action.text}</b><br/>
      `);

      if (action.id === 'cancel-running-task') {
        streamingMessageId = null;
        mynahUI.updateStore(tabId, {
          loadingChat: false
        });
        Log(`Stop generating code: <b>${tabId}</b>`);
      }
    },
    onTabbedContentTabChange: (tabId: string, messageId: string, contentTabId: string) => {
      Log(`Tabbed content tab changed on tab <b>${tabId}</b>:<br/>
        Message Id: <b>${messageId}</b><br/>
        Content tabId: <b>${contentTabId}</b><br/>
        `);
    },
    onInBodyButtonClicked: (tabId: string, messageId: string, action) => {
      if (action.id === 'quick-start') {
        mynahUI.updateStore(tabId, {
          tabHeaderDetails: null,
          compactMode: false,
          tabBackground: false,
          promptInputText: '/dev',
          promptInputLabel: null,
          chatItems: []
        });
      }
      if (action.id === 'explore') {
        mynahUI.updateStore('', exploreTabData);
      }
      if (action.id.match('quick-start-')) {
        mynahUI.updateStore('', {
          ...mynahUIDefaults.store,
          chatItems: [],
          promptInputText: `/${action.id.replace('quick-start-', '')}`,
          quickActionCommands: qAgentQuickActions
        })
      }
      if (messageId === 'sticky-card') {
        mynahUI.updateStore(tabId, { promptInputStickyCard: null });
      }
      Log(`Body action clicked in message <b>${messageId}</b>:<br/>
      Action Id: <b>${action.id}</b><br/>
      Action Text: <b>${action.text}</b><br/>
      ${action.formItemValues
          ? `<br/>Options:<br/>${Object.keys(action.formItemValues)
            .map(optionId => {
              return `<b>${optionId}</b>: ${(action.formItemValues as Record<string, string>)[optionId] ?? ''}`;
            })
            .join('<br/>')}`
          : ''
        }
      `);
    },
    onQuickCommandGroupActionClick: (tabId: string, action) => {
      Log(`Quick command group action clicked in tab <b>${tabId}</b>:<br/>
      Action Id: <b>${action.id}</b><br/>
      `);
    },
    onVote: (tabId: string, messageId: string, vote: RelevancyVoteType) => {
      Log(`Message <b>${messageId}</b> is <b>${vote}d</b>.`);
    },
    onFileClick: (tabId: string, filePath: string, deleted: boolean, messageId?: string) => {
      Log(`File clicked on message ${messageId}: <b>${filePath}</b>`);
    },
    onFileActionClick: (tabId, messageId, filePath, actionName) => {
      Log(`File action clicked on message ${messageId}: <b>${filePath}</b> -> ${actionName}`);
      switch (actionName) {
        case 'reject-change':
          mynahUI.updateChatAnswerWithMessageId(tabId, messageId, exampleFileListChatItemForUpdate);
          break;
        case 'show-diff':
          mynahUI.updateChatAnswerWithMessageId(tabId, messageId, {
            body: exampleCodeDiff
          });
          break;
        case 'revert-rejection':
          mynahUI.updateChatAnswerWithMessageId(tabId, messageId, { fileList: exampleFileListChatItem.fileList });
          break;
        default:
          break;
      }
    },
    onFormModifierEnterPress(formData, tabId) {
      Log(`Form modifier enter pressed on tab <b>${tabId}</b>:<br/>
      Form data: <b>${JSON.stringify(formData)}</b><br/>
      `);
    },
    onFormTextualItemKeyPress(event, formData, itemId, tabId) {
      Log(`Form keypress on tab <b>${tabId}</b>:<br/>
      Item id: <b>${itemId}</b><br/>
      Key: <b>${event.keyCode}</b><br/>
      `);
      if ((itemId === 'prompt-name') && event.key === 'Enter' && event.ctrlKey !== true && event.shiftKey !== true) {
        event.preventDefault();
        event.stopImmediatePropagation();
        Log(`Form keypress Enter submit on tab <b>${tabId}</b>:<br/>
          ${formData
            ? `<br/>Options:<br/>${Object.keys(formData)
              .map(optionId => {
                return `<b>${optionId}</b>: ${(formData as Record<string, string>)[optionId] ?? ''}`;
              })
              .join('<br/>')}`
            : ''
          }
          `);
        return true
      }
      return false;
    },
    onCustomFormAction: (tabId, action) => {
      Log(`Custom form action clicked for tab <b>${tabId}</b>:<br/>
      Action Id: <b>${action.id}</b><br/>
      Action Text: <b>${action.text}</b><br/>
      ${action.formItemValues
          ? `<br/>Options:<br/>${Object.keys(action.formItemValues)
            .map(optionId => {
              return `<b>${optionId}</b>: ${(action.formItemValues as Record<string, string>)[optionId] ?? ''}`;
            })
            .join('<br/>')}`
          : ''
        }
      `);
    },
    onChatItemEngagement: (tabId, messageId, engagement) => {
      Log(`<b>${engagement.engagementType}</b> in message <b>${messageId}</b><br/>
      Engagement duration: <b>${engagement.engagementDurationTillTrigger}</b>ms <br/>
      Total X distance: <b>${engagement.totalMouseDistanceTraveled.x}</b>px <br/>
      Total Y distance: <b>${engagement.totalMouseDistanceTraveled.y}</b>px <br/>
      Selection X distance: <b>${engagement.selectionDistanceTraveled?.x ?? '0'}px</b> <br/>
      Selection Y distance: <b>${engagement.selectionDistanceTraveled?.y ?? '0'}px</b>`);
    },
    onLinkClick: (tabId, messageId, link, mouseEvent) => {
      if (link === '#open-diff-viewer') {
        mouseEvent?.preventDefault();
        Log(`Open diff viewer clicked`);
      }
      Log(`Link inside body clicked: <b>${link}</b>`);
    },
    onFormLinkClick: (link, mouseEvent) => {
      Log(`Link inside form clicked: <b>${link}</b>`);
    },
    onSourceLinkClick: (tabId, messageId, link, mouseEvent) => {
      Log(`Link in sources clicked: <b>${link}</b>`);
    },
    onInfoLinkClick: (tabId, link, mouseEvent) => {
      Log(`Link inside prompt info field clicked: <b>${link}</b>`);
    },
  });

  setTimeout(() => {
    mynahUI.toggleSplashLoader(false);
  }, INITIAL_STREAM_DELAY)

  const onChatPrompt = (tabId: string, prompt: ChatPrompt) => {
    if (prompt.command !== undefined && prompt.command.trim() !== '') {
      switch (prompt.command) {
        case Commands.INSERT_CODE:
          mynahUI.addToUserPrompt(tabId, exampleCodeBlockToInsert, 'code');
          break;
        case Commands.CLEAR:
          mynahUI.updateStore(tabId, {
            chatItems: [],
          });
          break;
        case Commands.CLEAR_LOGS:
          LogClear();
          break;
        case Commands.NOTIFY:
          mynahUI.notify({
            content: 'Click this notification to remove it. It does not have a duration.',
            duration: -1,
            type: NotificationType.INFO,
            title: 'Notification!!',
            onNotificationClick: () => {
              Log('Sample notification clicked.');
            },
            onNotificationHide: () => {
              Log('Sample notification removed.');
            },
          });
          break;
        case Commands.FORM_CARD:
          mynahUI.addChatItem(tabId, exampleFormChatItem);
          mynahUI.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.VOTE:
          mynahUI.addChatItem(tabId, exampleVoteChatItem);
          mynahUI.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.CARD_WITH_MARKDOWN_LIST:
          getGenerativeAIAnswer(tabId, sampleMarkdownList);
          break;
        case Commands.CARD_WITH_ALL_MARKDOWN_TAGS:
          mynahUI.addChatItem(tabId, {
            type: ChatItemType.ANSWER,
            messageId: generateUID(),
            body: sampleAllInOneList.slice(-1)[0].body,
            snapToTop: true
          });
          mynahUI.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.CARD_RENDER_MARKDOWN_TABLE:
          mynahUI.addChatItem(tabId, {
            type: ChatItemType.ANSWER,
            messageId: generateUID(),
            body: sampleTableList.slice(-1)[0].body,
            snapToTop: true
          });
          mynahUI.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.CARD_SNAPS_TO_TOP:
          mynahUI.addChatItem(tabId, {
            type: ChatItemType.ANSWER,
            messageId: generateUID(),
            body: sampleMarkdownList.slice(-1)[0].body,
            snapToTop: true
          });
          mynahUI.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.PROGRESSIVE_CARD:
          getGenerativeAIAnswer(tabId, exampleProgressCards);
          break;
        case Commands.HEADER_TYPES:
          sampleHeaderTypes.forEach(ci => mynahUI.addChatItem(tabId, ci));
          break;
        case Commands.STATUS_CARDS:
          mynahUI.addChatItem(tabId, {
            type: ChatItemType.ANSWER,
            messageId: new Date().getTime().toString(),
            body: `This is an extended card with an icon and a different border color. It also includes some action buttons.`,
            status: 'error',
            icon: MynahIcons.ERROR,
            buttons: [
              {
                text: 'I Understand',
                id: 'understood',
                status: 'error',
                icon: MynahIcons.OK,
              },
            ],
          });
          mynahUI.addChatItem(tabId, {
            type: ChatItemType.ANSWER,
            messageId: new Date().getTime().toString(),
            body: `This is an extended card with an icon and a different border color. Including some action buttons.`,
            status: 'info',
            icon: MynahIcons.INFO,
            buttons: [
              {
                text: 'Acknowledge',
                id: 'ack',
                status: 'info',
                icon: MynahIcons.OK,
              },
            ],
          });
          mynahUI.addChatItem(tabId, {
            type: ChatItemType.ANSWER,
            messageId: new Date().getTime().toString(),
            body: `This is an extended card with an icon and a different border color. Including some action buttons.`,
            status: 'warning',
            icon: MynahIcons.WARNING,
          });
          mynahUI.addChatItem(tabId, {
            type: ChatItemType.ANSWER,
            messageId: new Date().getTime().toString(),
            body: `You're doing very good. Awesome work mate!`,
            status: 'success',
            icon: MynahIcons.THUMBS_UP,
            buttons: [
              {
                text: 'Yay!',
                id: 'yay',
                status: 'success',
              },
            ],
          });
          mynahUI.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.SHOW_STICKY_CARD:
          mynahUI.updateStore(tabId, {
            promptInputStickyCard: {
              messageId: 'sticky-card',
              body: `Our [Terms and Conditions](#) are updated. Please review and read it. To accept please hit the **Acknowledge** button.`,
              buttons: [
                {
                  text: 'Acknowledge',
                  id: 'acknowledge',
                  status: 'info',
                },
              ],
            },
          });
          break;
        case Commands.FILE_LIST_CARD:
          mynahUI.addChatItem(tabId, {
            ...exampleFileListChatItem,
            messageId: `FILE_LIST_${new Date().getTime().toString()}`,
          });
          mynahUI.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.FOLLOWUPS_AT_RIGHT:
          mynahUI.addChatItem(tabId, exampleRichFollowups);
          break;
        case Commands.INFORMATION_CARDS:
          mynahUI.addChatItem(tabId, exampleInformationCard(null, null, true));
          mynahUI.addChatItem(tabId, exampleInformationCard('warning', 'You have hit the usage limit for this chat bot. Contact your admin to enable usage overages or learn more about pro license limits.'));
          mynahUI.addChatItem(tabId, exampleInformationCard('error', 'You have hit the usage limit for this chat bot. Contact your admin to enable usage overages or learn more about pro license limits.'));
          mynahUI.addChatItem(tabId, exampleInformationCard('success', 'Successfully completed this task!'));
          mynahUI.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.CONFIRMATION_BUTTONS:
          mynahUI.addChatItem(tabId, exampleConfirmationButtons);
          mynahUI.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.BUTTONS:
          mynahUI.addChatItem(tabId, exampleButtons);
          mynahUI.addChatItem(tabId, exampleStatusButtons);
          mynahUI.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.SHOW_CUSTOM_FORM:
          showCustomForm(tabId);
          break;
        case Commands.IMAGE_IN_CARD:
          mynahUI.addChatItem(tabId, exampleImageCard());
          mynahUI.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.CUSTOM_RENDERER_CARDS:
          mynahUI.addChatItem(tabId, exampleCustomRendererWithHTMLMarkup());
          mynahUI.addChatItem(tabId, exampleCustomRendererWithDomBuilderJson);
          mynahUI.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.COMMAND_WITH_PROMPT:
          const realPromptText = prompt.escapedPrompt?.trim() ?? '';
          mynahUI.addChatItem(tabId, {
            type: ChatItemType.PROMPT,
            messageId: new Date().getTime().toString(),
            body: `${Commands.COMMAND_WITH_PROMPT} => ${realPromptText}`,
          });
          getGenerativeAIAnswer(tabId);
          break;
        default:
          mynahUI.addChatItem(tabId, {
            type: ChatItemType.PROMPT,
            messageId: new Date().getTime().toString(),
            body: `**${prompt.command.replace('/', '')}**\n${prompt.escapedPrompt as string}`,
          });
          getGenerativeAIAnswer(tabId);
          break;
      }
    } else {
      if (prompt != null) {
        mynahUI.addChatItem(tabId, {
          type: ChatItemType.PROMPT,
          autoCollapse: true,
          messageId: new Date().getTime().toString(),
          body: `${prompt.escapedPrompt as string}`,
        });
      }
      getGenerativeAIAnswer(tabId);
    }
  };

  const showCustomForm = (tabId: string) => {
    mynahUI.showCustomForm(
      tabId,
      [
        {
          type: 'textinput',
          id: 'prompt-name',
          title: 'Prompt name',
          mandatory: true,
          validationPatterns: {
            patterns: [{ pattern: /^[^./\\]+$/ }],
            genericValidationErrorMessage:
                'Text cannot contain dots (.), forward slashes (/), or backslashes (\\).',
          },
          placeholder: "Enter prompt name",
          description: "Use this prompt by typing '@' followed by the prompt name.",
          autoFocus: true,
        },
      ],
      [
        {
          id: 'cancel-create-prompt',
          status: 'clear',
          text: 'Cancel',
          waitMandatoryFormItems: false,
        },
        {
          id: 'submit-create-prompt',
          text: 'Create',
          status: 'main',
          waitMandatoryFormItems: true,
        }
      ],
      'Create saved prompt',
    );
  };

  const getGenerativeAIAnswer = (tabId: string, optionalParts?: Partial<ChatItem>[]): void => {
    const messageId = generateUID();
    mynahUI.updateStore(tabId, {
      loadingChat: true,
      promptInputDisabledState: true,
    });
    connector
      .requestGenerativeAIAnswer(
        optionalParts ?? [
          {
            ...exampleStreamParts[0],
            messageId,
            header: {
              fileList: {
                collapsed: true,
                hideFileCount: true,
                flatList: true,
                rootFolderTitle: 'Context',
                folderIcon: null,
                fileTreeTitle: '',
                filePaths: ['./src/index.ts', './main', 'js_expert'],
                details: {
                  './src/index.ts': {
                    icon: MynahIcons.FILE,
                    description: `**index.ts** under **src** folder is
used as a context to generate this message.`
                  },
                  './main': {
                    icon: MynahIcons.FOLDER,
                  },
                  'js_expert': {
                    icon: MynahIcons.CHAT,
                  }
                }
              }
            }
          },
          {
            header: undefined,
          }, ...exampleStreamParts],
        (chatItem: Partial<ChatItem>, percentage: number) => {
          if (streamingMessageId != null) {
            mynahUI.updateLastChatAnswer(tabId, chatItem);
            mynahUI.updateStore(tabId, {
              ...(optionalParts != null ? {
                promptInputProgress: {
                  status: 'info',
                  ...(percentage > 50 ? { text: 'Almost done...' } : {}),
                  valueText: `${parseInt(percentage.toString())}%`,
                  value: percentage,
                }
              } : {})
            });
            return false;
          }
          return true;
        },
        () => {
          const cardDetails = mynahUI.endMessageStream(tabId, messageId, {}) as Record<string, any>;

          mynahUI.updateStore(tabId, {
            loadingChat: false,
          });
          mynahUI.updateStore(tabId, {
            promptInputDisabledState: false,
          });
          if (optionalParts != null) {
            mynahUI.updateStore(tabId, {
              promptInputProgress: {
                status: 'success',
                text: 'Completed...',
                valueText: '',
                value: 100,
                actions: []
              }
            });
            setTimeout(() => {
              mynahUI.updateStore(tabId, {
                promptInputProgress: null
              });
            }, 1500);
          }
          Log(`Stream ended with details: <br/>
          ${Object.keys(cardDetails).map(key => `${key}: <b>${cardDetails[key].toString()}</b>`).join('<br/>')}
          `);
          mynahUI.addChatItem(tabId, { ...defaultFollowUps, messageId: generateUID() });
          streamingMessageId = null;
        }
      )
      .then(() => {
        streamingMessageId = messageId;
        mynahUI.addChatItem(tabId, {
          type: ChatItemType.ANSWER_STREAM,
          body: '',
          canBeVoted: true,
          messageId: streamingMessageId,
        });
        if (optionalParts != null) {
          mynahUI.updateStore(tabId, {
            promptInputProgress: {
              status: 'default',
              text: 'Work in progress...',
              value: -1,
              actions: [{
                id: 'cancel-running-task',
                text: 'Cancel',
                icon: MynahIcons.CANCEL,
                disabled: false,
              }]
            }
          });
        }
      });
  };

  new ThemeBuilder('#theme-editor');

  return mynahUI;
};

window.mynahUI = createMynahUI();
