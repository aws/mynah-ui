/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { Connector } from './connector';
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
          ],
        },
      ],
    },
    tabs: {
      'tab-1': {
        isSelected: true,
        store: {
          ...mynahUIDefaults.store,
          ...welcomeScreenTabData.store
        }
      },
    },
    onFocusStateChanged: (focusState:boolean) => {
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
        Object.keys(mynahUI.getAllTabs()).forEach(tabIdFromStore=>mynahUI.updateStore(tabIdFromStore, {
          showChatAvatars: showChatAvatars
        }));
      } else if (buttonId === 'splash-loader') {
        mynahUI.toggleSplashLoader(true, 'Showing splash loader...');
        setTimeout(()=>{
          mynahUI.toggleSplashLoader(false);
        }, 10000);
      } else if (buttonId === 'custom-data-check') {
        // Use for custom temporary checks
      } else if (buttonId === 'new-welcome-screen') {
        mynahUI.updateStore('', {
          ...mynahUIDefaults.store,
          ...welcomeScreenTabData.store
        });
      }
      Log(`Tab bar button clicked when tab ${tabId} is selected: <b>${buttonId}</b>`);
    },
    onTabAdd: (tabId: string) => {
      Log(`New tab added: <b>${tabId}</b>`);
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
      context: <b>${(prompt.context??[]).join('</b>, <b>')}`);
      if (tabId === 'tab-1') {
        mynahUI.updateStore(tabId, {
          tabCloseConfirmationMessage: `Working on "${prompt.prompt}"`,
        });
      }
      if(mynahUI.getAllTabs()[tabId].store?.compactMode){
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
        if(followUp.command === Commands.REPLACE_FOLLOWUPS) {

          mynahUI.addChatItem(tabId, {
            type: ChatItemType.ANSWER,
            messageId: 'my-message-id',
            body: 'Hello',
          });

          setTimeout(()=>{
            mynahUI.updateChatAnswerWithMessageId(tabId, 'my-message-id', {
              followUp: exampleRichFollowups.followUp
            });
            setTimeout(()=>{
              mynahUI.updateChatAnswerWithMessageId(tabId, 'my-message-id', {
                followUp: defaultFollowUps.followUp,
              })
            },1500)
          },1500);
        } else {
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

      if(action.id === 'cancel-running-task'){
        streamingMessageId = null;
        mynahUI.updateStore(tabId, {
          loadingChat: false
        });
        Log(`Stop generating code: <b>${tabId}</b>`);        
      }
    },
    onTabbedContentTabChange: (tabId: string, messageId: string, contentTabId: string) =>{
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
      if (action.id.match('quick-start-')){
          mynahUI.updateStore('',{
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
      ${
        action.formItemValues
          ? `<br/>Options:<br/>${Object.keys(action.formItemValues)
              .map(optionId => {
                return `<b>${optionId}</b>: ${(action.formItemValues as Record<string, string>)[optionId] ?? ''}`;
              })
              .join('<br/>')}`
          : ''
      }
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
          mynahUI.updateChatAnswerWithMessageId(tabId, messageId, {fileList: exampleFileListChatItem.fileList});
          break;
        default:
          break;
      }
    },
    onCustomFormAction: (tabId, action) => {
      Log(`Custom form action clicked for tab <b>${tabId}</b>:<br/>
      Action Id: <b>${action.id}</b><br/>
      Action Text: <b>${action.text}</b><br/>
      ${
        action.formItemValues
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
    onSourceLinkClick: (tabId, messageId, link, mouseEvent) => {
      Log(`Link in sources clicked: <b>${link}</b>`);
    },
    onInfoLinkClick: (tabId, link, mouseEvent) => {
      Log(`Link inside prompt info field clicked: <b>${link}</b>`);
    },
  });

  setTimeout(()=>{
    mynahUI.toggleSplashLoader(false);
  }, 2750)

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
          break;
        case Commands.CARD_RENDER_MARKDOWN_TABLE:
          mynahUI.addChatItem(tabId, {
            type: ChatItemType.ANSWER,
            messageId: generateUID(),
            body: sampleTableList.slice(-1)[0].body,
            snapToTop: true
          });
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
      if(prompt != null){
        mynahUI.addChatItem(tabId, {
          type: ChatItemType.PROMPT,
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
          type: 'radiogroup',
          id: 'like',
          mandatory: true,
          options: [
            {
              label: 'Yes',
              value: 'yes',
            },
            {
              label: 'No',
              value: 'no',
            },
            {
              label: "Don't know",
              value: 'dunno',
            },
          ],
          title: 'Do you like it so far?',
        },
        {
          type: 'textarea',
          id: 'comment',
          title: 'Any comments?',
        },
      ],
      [
        {
          id: 'save-comment',
          text: 'Send',
          status: 'primary',
          waitMandatoryFormItems: true,
        },
        {
          id: 'cancel-comment',
          text: 'Cancel',
          waitMandatoryFormItems: false,
        },
      ],
      'You opinions are so valuable!',
      'Please give us your 2 mins to help us out. This form is not real by the way, it is just for demonstration.'
    );
  };

  const getGenerativeAIAnswer = (tabId: string, optionalParts?: Partial<ChatItem>[]): void => {
    const messageId = new Date().getTime().toString();
    mynahUI.updateStore(tabId, {
      loadingChat: true,
      promptInputDisabledState: true,
    });
    connector
      .requestGenerativeAIAnswer(
        optionalParts ?? exampleStreamParts,
        (chatItem: Partial<ChatItem>, percentage: number) => {
          if (streamingMessageId != null) {
            mynahUI.updateChatAnswerWithMessageId(tabId, streamingMessageId, chatItem);
            mynahUI.updateStore(tabId, {
              ...(optionalParts != null ? {promptInputProgress: {
                  status: 'info',
                  ...(percentage > 50 ? {text: 'Almost done...'} : {}),
                  valueText: `${parseInt(percentage.toString())}%`,
                  value: percentage,
              }}: {})
            });
            return false;
          }
          return true;
        },
        () => {
          const cardDetails = mynahUI.endMessageStream(tabId, messageId, {
            footer: {
              fileList: {
                rootFolderTitle: undefined,
                fileTreeTitle: '',
                filePaths: ['./src/index.ts'],
                details: {
                  './src/index.ts': {
                    icon: MynahIcons.FILE,
                    clickable: false,
                    description: `Files used for this response: **index.ts**
Use \`@\` to mention a file, folder, or method.`
                  }
                }
              }
            }
          }) as Record<string, any>;

          mynahUI.updateStore(tabId, {
            loadingChat: false,
          });
          mynahUI.updateStore(tabId, {
            promptInputDisabledState: false,
          });
          if(optionalParts != null){
            mynahUI.updateStore(tabId, {
              promptInputProgress: {
                  status: 'success',
                  text: 'Completed...',
                  valueText: '',
                  value: 100,
                  actions: []
              }
            });
            setTimeout(()=>{
              mynahUI.updateStore(tabId, {
                promptInputProgress: null
              });
            },1500);
          }
          Log(`Stream ended with details: <br/>
          ${Object.keys(cardDetails).map(key=>`${key}: <b>${cardDetails[key].toString()}</b>`).join('<br/>')}
          `);
          streamingMessageId = null;
          mynahUI.addChatItem(tabId, defaultFollowUps);
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
        if(optionalParts != null){
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
