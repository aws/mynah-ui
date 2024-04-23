import { useEffect, useRef } from 'react';
import {
  ChatItem,
  ChatItemType,
  MynahIcons,
  MynahUIProps,
  NotificationType,
} from '@aws/mynah-ui';
import {
  ChatItemAction,
  ChatPrompt,
  FeedbackPayload,
  RelevancyVoteType,
} from '@aws/mynah-ui/dist/static';
import { MynahUIPublicFeatures, MynahUIWrapper } from '../mynahui/MynahUI';
import {
  defaultFollowUps,
  exampleCodeBlockToInsert,
  exampleCustomRendererWithDomBuilderJson,
  exampleCustomRendererWithHTMLMarkup,
  exampleFileListChatItem,
  exampleFileListChatItemForUpdate,
  exampleFormChatItem,
  exampleImageCard,
  exampleProgressCards,
  exampleRichFollowups,
  exampleStreamParts,
} from './samples/sample-data';
import escapeHTML from 'escape-html';
import { Commands } from './commands';
import { Connector } from './connector';
import { Container, Header } from '@cloudscape-design/components';
import { mynahUIDefaults } from './config';

export interface MyChatProps {
  onLog?: (message: string) => void;
  onClearLog?: () => void;
}
export const MyChat = (props: MyChatProps): JSX.Element => {
  const mynahUIRef = useRef<MynahUIPublicFeatures>(null);
  let mynahUI: MynahUIPublicFeatures | null;
  let streamingMessageId: string | null;
  const connector = new Connector();
  const tabId = 'NO_TABS_TABID';
  const handlers: Partial<MynahUIProps> = {
    onSendFeedback: (tabId: string, feedbackPayload: FeedbackPayload) => {
      Log(`Feedback sent <br/>
      type: <b>${feedbackPayload.selectedOption}</b><br/>
      comment: <b>${feedbackPayload.comment ?? 'no comment'}</b>`);
      if (feedbackPayload.comment !== undefined) {
        mynahUI?.notify({
          type: NotificationType.INFO,
          title: 'Your feedback is sent',
          content: 'Thanks for your feedback.',
        });
      }
    },
    onShowMoreWebResultsClick: (tabId, messageId) => {
      Log(`Show more sources clicked in message <b>${messageId}</b>`);
    },
    onCopyCodeToClipboard: (
      tabId: string,
      messageId,
      code,
      type,
      referenceTrackerInformation
    ) => {
      Log(`Code copied to clipboard from message <b>${messageId}</b><br/>
        type: <b>${type ?? 'unknown'}</b><br/>
        code: <b>${escapeHTML(code ?? '')}</b><br/>
        referenceTracker: <b>${referenceTrackerInformation?.map((rt) => rt.information).join('<br/>') ?? ''}</b><br/>
      `);
    },
    onCodeInsertToCursorPosition: (
      tabId,
      messageId,
      code,
      type,
      referenceTrackerInformation
    ) => {
      Log(`Clicked insert code to cursor position from message <b>${messageId}</b><br/>
        type: <b>${type ?? 'unknown'}</b><br/>
        code: <b>${escapeHTML(code ?? '')}</b><br/>
        referenceTracker: <b>${referenceTrackerInformation?.map((rt) => rt.information).join('<br/>') ?? ''}</b><br/>
      `);
    },
    onChatPrompt: (tabId: string, prompt: ChatPrompt) => {
      Log(`New prompt: <b>${prompt.prompt !== undefined && prompt.prompt !== '' ? prompt.prompt : '{command only}'}</b><br/>
      command: <b>${prompt.command ?? '{none}'}</b>`);
      onChatPrompt(tabId, prompt);
    },
    onStopChatResponse: () => {
      streamingMessageId = null;
      mynahUI?.updateStore(tabId, {
        loadingChat: false
      });
      Log(`Stop generating clicked`);
    },
    onFollowUpClicked: (
      tabId: string,
      messageId: string,
      followUp: ChatItemAction
    ) => {
      Log(`Followup click: <b>${followUp.pillText ?? ''}</b>`);
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
        mynahUI?.updateStore(tabId, { promptInputStickyCard: null });
      }
      Log(`Body action clicked in message <b>${messageId}</b>:<br/>
      Action Id: <b>${action.id}</b><br/>
      Action Text: <b>${action.text ?? ''}</b><br/>
      ${
        action.formItemValues
          ? `<br/>Options:<br/>${Object.keys(action.formItemValues)
              .map((optionId) => {
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
    onOpenDiff: (tabId: string, filePath: string) => {
      Log(`File clicked: <b>${filePath}</b>`);
    },
    onFileActionClick: (tabId, messageId, filePath, actionName) => {
      Log(`File action clicked: <b>${filePath}</b> -> ${actionName}`);
      switch (actionName) {
        case 'update-comment':
        case 'comment-to-change':
          showCustomForm(tabId);
          break;
        case 'reject-change':
          mynahUI?.updateChatAnswerWithMessageId(
            tabId,
            'file-list-message',
            exampleFileListChatItemForUpdate
          );
          break;
        default:
          break;
      }
      mynahUI?.updateChatAnswerWithMessageId(
        tabId,
        'file-list-message',
        exampleFileListChatItemForUpdate
      );
    },
    onCustomFormAction: (tabId, action) => {
      Log(`Custom form action clicked:<br/>
      Action Id: <b>${action.id}</b><br/>
      Action Text: <b>${action.text ?? ''}</b><br/>
      ${
        action.formItemValues
          ? `<br/>Options:<br/>${Object.keys(action.formItemValues)
              .map((optionId) => {
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
    onSourceLinkClick: (tabId, messageId, link) => {
      Log(`Link in sources clicked: <b>${link}</b>`);
    },
    onInfoLinkClick: (tabId, link) => {
      Log(`Link inside prompt info field clicked: <b>${link}</b>`);
    },
  };

  const onChatPrompt = (tabId: string, prompt: ChatPrompt) => {
    if (prompt.command !== undefined && prompt.command.trim() !== '') {
      switch (prompt.command) {
        case Commands.INSERT_CODE:
          mynahUI?.addToUserPrompt(tabId, exampleCodeBlockToInsert);
          break;
        case Commands.CLEAR:
          mynahUI?.updateStore(tabId, {
            chatItems: [],
          });
          break;
        case Commands.CLEAR_LOGS:
          if (props.onClearLog != null) {
            props.onClearLog();
          }
          break;
        case Commands.NOTIFY:
          mynahUI?.notify({
            content:
              'Click this notification to remove it. It does not have a duration.',
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
          mynahUI?.addChatItem(tabId, exampleFormChatItem);
          mynahUI?.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.PROGRESSIVE_CARD:
          getProgressingCard(tabId);
          break;
        case Commands.STATUS_CARDS:
          mynahUI?.addChatItem(tabId, {
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
          mynahUI?.addChatItem(tabId, {
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
          mynahUI?.addChatItem(tabId, {
            type: ChatItemType.ANSWER,
            messageId: new Date().getTime().toString(),
            body: `This is an extended card with an icon and a different border color. Including some action buttons.`,
            status: 'warning',
            icon: MynahIcons.WARNING,
          });
          mynahUI?.addChatItem(tabId, {
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
          mynahUI?.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.SHOW_STICKY_CARD:
          mynahUI?.updateStore(tabId, {
            promptInputStickyCard: {
              messageId: 'sticky-card',
              body: `Please read the [terms and conditions change](#) and after that click the **Acknowledge** button below!`,
              buttons: [
                {
                  text: 'Open transofmration hub',
                  id: 'acknowledge',
                  status: 'info',
                },
              ],
            },
          });
          break;
        case Commands.FILE_LIST_CARD:
          mynahUI?.addChatItem(tabId, exampleFileListChatItem);
          mynahUI?.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.FOLLOWUPS_AT_RIGHT:
          mynahUI?.addChatItem(tabId, exampleRichFollowups);
          break;
        case Commands.SHOW_CUSTOM_FORM:
          showCustomForm(tabId);
          break;
        case Commands.IMAGE_IN_CARD:
          mynahUI?.addChatItem(tabId, exampleImageCard());
          mynahUI?.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.CUSTOM_RENDERER_CARDS:
          mynahUI?.addChatItem(tabId, exampleCustomRendererWithHTMLMarkup());
          mynahUI?.addChatItem(
            tabId,
            exampleCustomRendererWithDomBuilderJson
          );
          mynahUI?.addChatItem(tabId, defaultFollowUps);
          break;
        case Commands.COMMAND_WITH_PROMPT:
          // eslint-disable-next-line no-case-declarations
          const realPromptText = prompt.escapedPrompt?.trim() ?? '';
          mynahUI?.addChatItem(tabId, {
            type: ChatItemType.PROMPT,
            messageId: new Date().getTime().toString(),
            body: `${Commands.COMMAND_WITH_PROMPT} => ${realPromptText}`,
          });
          getGenerativeAIAnswer(tabId);
          break;
        default:
          mynahUI?.addChatItem(tabId, {
            type: ChatItemType.PROMPT,
            messageId: new Date().getTime().toString(),
            body: `**${prompt.command.replace('/', '')}**\n${prompt.escapedPrompt as string}`,
          });
          getGenerativeAIAnswer(tabId);
          break;
      }
    } else {
      mynahUI?.addChatItem(tabId, {
        type: ChatItemType.PROMPT,
        messageId: new Date().getTime().toString(),
        body: `${prompt.escapedPrompt as string}`,
      });
      getGenerativeAIAnswer(tabId);
    }
  };

  const showCustomForm = (tabId: string) => {
    mynahUI?.showCustomForm(
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

  const getGenerativeAIAnswer = (tabId: string): void => {
    const messageId = new Date().getTime().toString();
    mynahUI?.updateStore(tabId, {
      loadingChat: true,
      promptInputDisabledState: true,
    });
    connector
      .requestGenerativeAIAnswer(
        exampleStreamParts,
        (chatItem: Partial<ChatItem>) => {
          if (streamingMessageId != null) {
            mynahUI?.updateChatAnswerWithMessageId(tabId, streamingMessageId, chatItem);
            return false;
          }
          return true;
        },
        () => {
          mynahUI?.updateStore(tabId, {
            loadingChat: false,
            promptInputDisabledState: false,
          });
          const cardDetails = mynahUI?.endMessageStream(tabId, messageId) as Record<string, any>;
          Log(`Stream ended with details: <br/>
          ${Object.keys(cardDetails).map(key=>`${key}: <b>${cardDetails[key].toString()}</b>`).join('<br/>')}
          `);
          streamingMessageId = null;
          mynahUI?.addChatItem(tabId, defaultFollowUps);
        }
      )
      .then(() => {
        streamingMessageId = messageId;
        mynahUI?.addChatItem(tabId, {
          type: ChatItemType.ANSWER_STREAM,
          body: '',
          canBeVoted: true,
          messageId: streamingMessageId,
        });
      });
  };

  const getProgressingCard = (tabId: string): void => {
    const messageId = new Date().getTime().toString();
    mynahUI?.updateStore(tabId, {
      loadingChat: true,
      promptInputDisabledState: true,
    });
    connector
      .requestGenerativeAIAnswer(
        exampleProgressCards,
        (chatItem: Partial<ChatItem>) => {
          mynahUI?.updateChatAnswerWithMessageId(tabId, messageId, chatItem);
          return false;
        },
        () => {
          mynahUI?.updateStore(tabId, {
            loadingChat: false,
            promptInputDisabledState: false,
          });
          mynahUI?.notify({
            content: 'Your refactor request is finished',
          });
          mynahUI?.addChatItem(tabId, defaultFollowUps);
        }
      )
      .then(() => {
        mynahUI?.addChatItem(tabId, {
          type: ChatItemType.ANSWER_STREAM,
          body: '',
          messageId,
        });
      })
      .finally(() => {
        //
      });
  };

  const Log = (message: string) => {
    if (props.onLog != null) {
      props.onLog(message);
    }
  };

  useEffect(() => {
    if (mynahUIRef?.current != null && mynahUI === undefined) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      mynahUI = mynahUIRef.current;
    }
    const wrapperElm = document.querySelector('.mynah-ui-chat-wrapper');
    setTimeout(() => {
      const topVal = wrapperElm?.getBoundingClientRect().top;
      if (wrapperElm != null) {
        wrapperElm.insertAdjacentHTML(
          'beforeend',
          `<style>:root{--chat-wrapper-top: ${topVal ?? 0}px}</style>`
        );
      }
    }, 100);
  }, []);

  return (
    <Container
      header={
        <Header description='It is all mocked, but showcases almost all features.'>
          Chat with Q
        </Header>
      }
      data-class='mynah-ui-chat-example-container'
      disableContentPaddings
    >
      <MynahUIWrapper
        ref={mynahUIRef}
        config={{ maxTabs: 1 }}
        tabs={{
          [tabId]: {
            isSelected: true,
            store: {
              ...mynahUIDefaults.store,
            },
          },
        }}
        defaults={mynahUIDefaults}
        {...handlers}
      />
    </Container>
  );
};
