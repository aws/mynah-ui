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
} from './samples/sample-data';
import escapeHTML from 'escape-html';
import './styles/styles.scss';
import { ThemeBuilder } from './theme-builder/theme-builder';
import { Commands } from './commands';

export const createMynahUI = (initialData?: MynahUIDataModel): MynahUI => {
  const connector = new Connector();
  let streamingMessageId: string | null;

  const mynahUI = new MynahUI({
    rootSelector: '#amzn-mynah-website-wrapper',
    defaults: mynahUIDefaults,
    config: {
      maxTabs: 5,
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
          tabCloseConfirmationMessage: 'Only this tab has a different message than others!',
          ...mynahUIDefaults.store,
          ...initialData,
        },
      },
    },
    onTabBarButtonClick: (tabId: string, buttonId: string) => {
      if (buttonId === 'clear') {
        mynahUI.updateStore(tabId, {
          chatItems: [],
        });
      } else if (buttonId === 'show-code-diff') {
        mynahUI.addChatItem(tabId, {
          type: ChatItemType.ANSWER,
          body: exampleCodeDiff
        });
      } else if (buttonId === 'insert-code') {
        mynahUI.addToUserPrompt(tabId, exampleCodeBlockToInsert, 'code');
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
    onAcceptDiff: (tabId, messageId, code, type, referenceTrackerInformation, eventId, codeBlockIndex, totalCodeBlocks) => {
      Log(`Code insert to position clicked on tab <b>${tabId}</b> inside message <b>${messageId}</b><br/>
        type: <b>${type ?? 'unknown'}</b><br/>
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
        onChatPrompt(tabId, {
          command: followUp.command,
          prompt: followUp.prompt,
          escapedPrompt: followUp.escapedPrompt ?? followUp.prompt,
        });
      }
    },
    onInBodyButtonClicked: (tabId: string, messageId: string, action) => {
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
        case Commands.CARD_SNAPS_TO_TOP:
          getGenerativeAIAnswer(tabId, [...sampleMarkdownList.slice(0,-1), {body: sampleMarkdownList.slice(-1)[0].body, snapToTop: true}]);
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
      mynahUI.addChatItem(tabId, {
        type: ChatItemType.PROMPT,
        messageId: new Date().getTime().toString(),
        body: `${prompt.escapedPrompt as string}`,
      });
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
          status: 'info',
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
        (chatItem: Partial<ChatItem>) => {
          if (streamingMessageId != null) {
            mynahUI.updateChatAnswerWithMessageId(tabId, streamingMessageId, chatItem);
            return false;
          }
          return true;
        },
        () => {
          mynahUI.updateStore(tabId, {
            loadingChat: false,
            promptInputDisabledState: false,
          });
          const cardDetails = mynahUI.endMessageStream(tabId, messageId) as Record<string, any>;
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
      });
  };

  new ThemeBuilder('#theme-editor');

  return mynahUI;
};

window.mynahUI = createMynahUI();
