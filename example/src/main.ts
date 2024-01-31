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
import './styles/styles.scss';
import { Commands, mynahUIDefaults } from './config';
import { Log, LogClear } from './logger';
import { exampleCodeBlockToInsert, exampleFileListChatItem, exampleRichFollowups, followupTypes } from './samples/sample-data';
import escapeHTML from 'escape-html';

export const createMynahUI = (initialData?: MynahUIDataModel): MynahUI => {
  const connector = new Connector();

  const mynahUI = new MynahUI({
    rootSelector: '#amzn-mynah-website-wrapper',
    defaults: mynahUIDefaults,
    config: {
      maxTabs: 5,
    },
    tabs: {
      'tab-1': {
        isSelected: true,
        store: {
          ...mynahUIDefaults.store,
          ...initialData,
        }
      }
    },
    onTabAdd: (tabId: string) => {
      Log(`New tab added: <b>${tabId}</b>`);
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
    onCopyCodeToClipboard: (tabId, messageId, code, type, referenceTrackerInformation) => {
      Log(`Code copied to clipboard from tab <b>${tabId}</b> inside message <b>${messageId}</b><br/>
        type: <b>${type ?? 'unknown'}</b><br/>
        code: <b>${escapeHTML(code ?? '')}</b><br/>
        referenceTracker: <b>${referenceTrackerInformation?.map(rt => rt.information).join('<br/>') ?? ''}</b>
      `);
    },
    onCodeInsertToCursorPosition: (tabId, messageId, code, type, referenceTrackerInformation) => {
      Log(`Code insert to position clicked on tab <b>${tabId}</b> inside message <b>${messageId}</b><br/>
        type: <b>${type ?? 'unknown'}</b><br/>
        code: <b>${escapeHTML(code ?? '')}</b><br/>
        referenceTracker: <b>${referenceTrackerInformation?.map(rt => rt.information).join('<br/>') ?? ''}</b>
      `);
    },
    onChatPrompt: (tabId: string, prompt: ChatPrompt) => {
      Log(`New prompt on tab: <b>${tabId}</b><br/>
      prompt: <b>${prompt.prompt !== undefined && prompt.prompt !== '' ? prompt.prompt : '{command only}'}</b><br/>
      command: <b>${prompt.command ?? '{none}'}</b>`);
      if (prompt.command !== undefined && prompt.command.trim() !== '') {
        switch (prompt.command) {
          case Commands.INSERT_CODE:
            mynahUI.addToUserPrompt(tabId, exampleCodeBlockToInsert);
            break;
          case Commands.CLEAR:
            mynahUI.updateStore(tabId, {
              chatItems: []
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
              }
            });
            break;
          case Commands.CARD_WITH_OPTIONS:
            mynahUI.addChatItem(tabId, {
              type: ChatItemType.ANSWER,
              messageId: new Date().getTime().toString(),
              body: `Hi! I have identified your project to be in **Java8**. Your project is _eligible for upgrade_. Please specify the following information to trigger the transformation job!`,
              formItems: [
                {
                  id: 'module',
                  title: `Please select the module you're currently using`,
                  options: [{
                    label: 'Module 1',
                    value: 'module-1'
                  },
                  {
                    label: 'Module 2',
                    value: 'module-2'
                  }]
                },
                {
                  id: 'version',
                  title: `Please select the target version`,
                  options: [{
                    label: 'JDK17',
                    value: 'jdk17'
                  },
                  {
                    label: 'JDK18',
                    value: 'jdk18'
                  }]
                },
                {
                  id: 'instructions',
                  title: `Any other instructions (optional)`,
                  input: ''
                }
              ],
              buttons: [
                {
                  id: 'accept-transform',
                  keepCardAfterClick: true,
                  text: 'Transform',
                  status: 'info',
                },
                {
                  id: 'cancel-transform',
                  text: 'Cancel',
                  keepCardAfterClick: true,
                }
              ],
            });
            break;
          case Commands.EXTENDED_CARDS:
            mynahUI.addChatItem(tabId, {
              type: ChatItemType.ANSWER,
              messageId: new Date().getTime().toString(),
              body: `This is an extended card with an icon and a different border color. It also includes some action buttons.
              But beware that these action buttons will remove the card itself when they are clicked!`,
              status: 'error',
              icon: MynahIcons.ERROR,
              buttons: [
                {
                  text: 'I Understand',
                  id: 'understood',
                  status: 'error',
                  icon: MynahIcons.OK
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
                  icon: MynahIcons.OK
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
                  status: 'success'
                },
              ],
            });
            break;
          case Commands.COMMAND_WITH_PROMPT:
            const realPromptText = prompt.escapedPrompt?.trim() ?? '';
            mynahUI.addChatItem(tabId, {
              type: ChatItemType.PROMPT,
              messageId: new Date().getTime().toString(),
              body: `${Commands.COMMAND_WITH_PROMPT} => ${realPromptText}`
            });
            getGenerativeAIAnswer(tabId, {
              prompt: realPromptText
            });
            break;
          default:
            mynahUI.addChatItem(tabId, {
              type: ChatItemType.PROMPT,
              messageId: new Date().getTime().toString(),
              body: `**${prompt.command.replace('/', '')}**\n${prompt.escapedPrompt as string}`,
            });
            getGenerativeAIAnswer(tabId, prompt);
            break;
        }
      } else {
        mynahUI.addChatItem(tabId, {
          type: ChatItemType.PROMPT,
          messageId: new Date().getTime().toString(),
          body: `${prompt.escapedPrompt as string}`
        });
        getGenerativeAIAnswer(tabId, prompt);
      }
    },
    onStopChatResponse: (tabId: string) => {
      Log(`Stop generating clicked: <b>${tabId}</b>`);
    },
    onFollowUpClicked: (tabId: string, messageId: string, followUp: ChatItemAction) => {
      Log(`Followup click: <b>${followUp.pillText}</b>`);
      if (followUp.prompt !== undefined) {
        mynahUI.addChatItem(tabId, {
          type: ChatItemType.PROMPT,
          messageId: new Date().getTime().toString(),
          body: followUp.prompt,
        });
        getGenerativeAIAnswer(tabId, {
          prompt: followUp.prompt
        });
      } else {
        switch (followUp.type) {
          case followupTypes.FOLLOWUPS_ON_RIGHT:
            mynahUI.addChatItem(tabId, exampleRichFollowups);
            break;
          case followupTypes.FILE_LIST:
            mynahUI.addChatItem(tabId, exampleFileListChatItem);
            break;
        }
      }
    },
    onInBodyButtonClicked: (tabId: string, messageId: string, action) => {
      Log(`Body action clicked in message <b>${messageId}</b>:<br/>
      Action Id: <b>${action.id}</b><br/>
      Action Text: <b>${action.text}</b><br/>
      ${action.formItemValues ? `<br/>Options:<br/>${
        Object.keys(action.formItemValues).map(optionId=>{
          return `<b>${optionId}</b>: ${(action.formItemValues as Record<string, string>)[optionId] ?? ''}`;
        }).join('<br/>')}` : ''}
      `);
    },
    onVote: (tabId: string, messageId: string, vote: RelevancyVoteType) => {
      Log(`Message <b>${messageId}</b> is <b>${vote}d</b>.`);
    },
    onOpenDiff: (tabId: string, filePath: string, deleted: boolean, messageId?: string) => {
      Log(`File clicked: <b>${filePath}</b>`);
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
      Log(`Link inside body clicked: <b>${link}</b>`);
    },
    onSourceLinkClick: (tabId, messageId, link, mouseEvent) => {
      Log(`Link in sources clicked: <b>${link}</b>`);
    },
    onInfoLinkClick: (tabId, link, mouseEvent) => {
      Log(`Link inside prompt info field clicked: <b>${link}</b>`);
    },
  });

  const getGenerativeAIAnswer = (tabId: string, prompt: ChatPrompt): void => {
    mynahUI.updateStore(tabId, {
      loadingChat: true,
      promptInputDisabledState: true
    });
    connector.requestGenerativeAIAnswer(
      prompt,
      (chatItem: Partial<ChatItem>) => {
        mynahUI.updateLastChatAnswer(tabId, chatItem);
      }, (chatItem: ChatItem) => {
        mynahUI.updateStore(tabId, {
          loadingChat: false,
          promptInputDisabledState: false
        });
        mynahUI.addChatItem(tabId, chatItem);
      }).then(chatItem => {
        mynahUI.addChatItem(tabId, chatItem);
      });
  };

  /**
   * Below field is to simulate this example feels like an extension inside an IDE
   */

  const resizeHandler = document.querySelector('.size-handler') as HTMLSpanElement;
  let initPos = 0;
  let initWidth = 0;
  const handleResize = (e: MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    (resizeHandler.parentNode as HTMLElement).style.minWidth = `${initWidth + (initPos - e.pageX)}px`;
    (resizeHandler.parentNode as HTMLElement).style.maxWidth = `${initWidth + (initPos - e.pageX)}px`;
  };
  const handleResizeMouseUp = (): void => {
    window.removeEventListener('mousemove', handleResize);
    window.removeEventListener('mouseup', handleResizeMouseUp);
  };
  if (resizeHandler !== undefined) {
    resizeHandler.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      initPos = e.pageX;
      initWidth = ((e.currentTarget as HTMLElement).parentNode as HTMLElement).getBoundingClientRect().width;
      window.addEventListener('mousemove', handleResize, false);
      window.addEventListener('mouseup', handleResizeMouseUp);
    });
  }

  return mynahUI;
};

window.mynahUI = createMynahUI();
