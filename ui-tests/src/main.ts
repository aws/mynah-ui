/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { Connector } from './connector';
import {
  MynahUI,
  ChatPrompt,
  RelevancyVoteType,
  ChatItemType,
  FeedbackPayload,
  ChatItemAction,
  ChatItem,
  generateUID,
} from '@aws/mynah-ui';
import { defaultDataSet } from './defaults';
import { Commands, mockFollowups, mockStreamParts } from './mocks/mock-data';
import './styles/styles.scss';

export const createMynahUI = (): MynahUI => {
  const connector = new Connector();
  let streamingMessageId: string | null;

  const mynahUI = new MynahUI({
    rootSelector: '#mynah-ui-wrapper',
    defaults: {
      store: {
        ...(defaultDataSet.store)
      }
    },
    config: {
      noMoreTabsTooltip: 'Tabs limit.',
      autoFocus: true,
      test: true
    },
    tabs: {
      'tab-1': {
        isSelected: true,
        store: {
          ...defaultDataSet.store
        },
      },
    },
    onFocusStateChanged: (focusState: boolean) => {
      //
    },
    onTabBarButtonClick: (tabId: string, buttonId: string) => {
      //
    },
    onTabAdd: (tabId: string) => {
      //
    },
    onBeforeTabRemove: (tabId: string): boolean => {
      return !((mynahUI.getAllTabs()[tabId].store?.loadingChat) ?? true);
    },
    onTabRemove: (tabId: string) => {
      //
    },
    onTabChange: (tabId: string) => {
      //
    },
    onSendFeedback: (tabId: string, feedbackPayload: FeedbackPayload) => {
      //
    },
    onShowMoreWebResultsClick: (tabId, messageId) => {
      //
    },
    onCopyCodeToClipboard: (tabId, messageId, code, type, referenceTrackerInformation, eventId, codeBlockIndex, totalCodeBlocks) => {
      //
    },
    onCodeInsertToCursorPosition: (tabId, messageId, code, type, referenceTrackerInformation, eventId, codeBlockIndex, totalCodeBlocks) => {
      //
    },
    onCodeBlockActionClicked: (tabId, messageId, actionId, data, code, type, referenceTrackerInformation, eventId, codeBlockIndex, totalCodeBlocks) => {
      //
    },
    onChatPrompt: (tabId: string, prompt: ChatPrompt) => {
      if (tabId === 'tab-1') {
        mynahUI.updateStore(tabId, {
          tabCloseConfirmationMessage: `Working on "${prompt.prompt ?? ''}"`,
        });
      }
      onChatPrompt(tabId, prompt);
    },
    onStopChatResponse: (tabId: string) => {
      streamingMessageId = null;
      mynahUI.updateStore(tabId, {
        loadingChat: false
      });
    },
    onFollowUpClicked: (tabId: string, messageId: string, followUp: ChatItemAction) => {
      if (followUp.prompt != null || followUp.command != null) {
        onChatPrompt(tabId, {
          command: followUp.command,
          prompt: followUp.prompt,
          escapedPrompt: followUp.escapedPrompt ?? followUp.prompt,
        });
      }
    },
    onInBodyButtonClicked: (tabId: string, messageId: string, action) => {
      //
    },
    onVote: (tabId: string, messageId: string, vote: RelevancyVoteType) => {
      //
    },
    onFileClick: (tabId: string, filePath: string, deleted: boolean, messageId?: string) => {
      //
    },
    onFileActionClick: (tabId, messageId, filePath, actionName) => {
      //
    },
    onCustomFormAction: (tabId, action) => {
      //
    },
    onChatItemEngagement: (tabId, messageId, engagement) => {
      //
    },
    onLinkClick: (tabId, messageId, link, mouseEvent) => {
      //
    },
    onSourceLinkClick: (tabId, messageId, link, mouseEvent) => {
      //
    },
    onInfoLinkClick: (tabId, link, mouseEvent) => {
      //
    },
  });

  const onChatPrompt = (tabId: string, prompt: ChatPrompt): void => {
    if (prompt.command !== undefined && prompt.command.trim() !== '') {
      switch (prompt.command) {
        case Commands.HELP:
          mynahUI.addChatItem(tabId, {
            type: ChatItemType.ANSWER,
            messageId: generateUID(),
            body: 'Help Text',
          });
          break;
        case Commands.CLEAR:
          mynahUI.updateStore(tabId, {
            chatItems: [],
          });
          break;
        default:
          mynahUI.addChatItem(tabId, {
            type: ChatItemType.PROMPT,
            messageId: generateUID(),
            body: `**${prompt.command.replace('/', '')}**\n${prompt.escapedPrompt as string}`,
          });
          getGenerativeAIAnswer(tabId);
          break;
      }
    } else {
      mynahUI.addChatItem(tabId, {
        type: ChatItemType.PROMPT,
        messageId: generateUID(),
        body: `${prompt.escapedPrompt as string}`,
      });
      getGenerativeAIAnswer(tabId);
    }
  };

  const getGenerativeAIAnswer = (tabId: string, optionalParts?: Array<Partial<ChatItem>>): void => {
    const messageId = new Date().getTime().toString();
    mynahUI.updateStore(tabId, {
      loadingChat: true,
      promptInputDisabledState: true,
    });
    connector
      .requestGenerativeAIAnswer(
        optionalParts ?? mockStreamParts,
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
          mynahUI.endMessageStream(tabId, messageId) as Record<string, any>;
          streamingMessageId = null;
          mynahUI.addChatItem(tabId, mockFollowups);
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

  return mynahUI;
};

window.mynahUI = createMynahUI();
