/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Notification } from './components/notification';
import { DomBuilder, ExtendedHTMLElement } from './helper/dom';
import {
  MynahPortalNames,
  RelevancyVoteType,
  FeedbackPayload,
  MynahUIDataModel,
  MynahEventNames,
  NotificationType,
  ChatItem,
  ChatItemAction,
  ChatPrompt,
  MynahUITabStoreModel,
  MynahUITabStoreTab,
  ConfigModel,
  ReferenceTrackerInformation,
  CodeSelectionType,
  Engagement,
} from './static';
import { MynahUIGlobalEvents } from './helper/events';
import { Tabs } from './components/navigation-tabs';
import { ChatWrapper } from './components/chat-item/chat-wrapper';
import { FeedbackForm } from './components/feedback-form/feedback-form';
import { MynahUITabsStore } from './helper/tabs-store';
import { Config } from './helper/config';
import { marked } from 'marked';
import './styles/styles.scss';

export {
  FeedbackPayload,
  RelevancyVoteType,
  EngagementType,
  Engagement,
  MynahUIDataModel,
  NotificationType,
  ChatItem,
  ChatItemAction,
  ChatItemType,
  ChatPrompt,
  SourceLink
} from './static';
export {
  ToggleOption
} from './components/toggle';
export {
  MynahIcons
} from './components/icon';

export interface MynahUIProps {
  rootSelector?: string;
  defaults?: MynahUITabStoreTab;
  tabs?: MynahUITabStoreModel;
  config?: Partial<ConfigModel>;
  onShowMoreWebResultsClick?: (tabId: string, messageId: string) => void;
  onReady?: () => void;
  onVote?: (tabId: string, messageId: string, vote: RelevancyVoteType) => void;
  onStopChatResponse?: (tabId: string) => void;
  onResetStore?: (tabId: string) => void;
  onChatPrompt?: (tabId: string, prompt: ChatPrompt) => void;
  onFollowUpClicked?: (tabId: string, messageId: string, followUp: ChatItemAction) => void;
  onInBodyButtonClicked?: (tabId: string, messageId: string, action: {
    id: string;
    text?: string;
    formItemValues?: Record<string, string>;
  }) => void;
  onTabChange?: (tabId: string) => void;
  onTabAdd?: (tabId: string) => void;
  onTabRemove?: (tabId: string) => void;
  onChatItemEngagement?: (tabId: string, messageId: string, engagement: Engagement) => void;
  onCopyCodeToClipboard?: (tabId: string, messageId: string, code?: string, type?: CodeSelectionType, referenceTrackerInformation?: ReferenceTrackerInformation[]) => void;
  onCodeInsertToCursorPosition?: (tabId: string, messageId: string, code?: string, type?: CodeSelectionType, referenceTrackerInformation?: ReferenceTrackerInformation[]) => void;
  onSourceLinkClick?: (tabId: string, messageId: string, link: string, mouseEvent?: MouseEvent) => void;
  onLinkClick?: (tabId: string, messageId: string, link: string, mouseEvent?: MouseEvent) => void;
  onInfoLinkClick?: (tabId: string, link: string, mouseEvent?: MouseEvent) => void;
  onSendFeedback?: (tabId: string, feedbackPayload: FeedbackPayload) => void;
  onOpenDiff?: (tabId: string, filePath: string, deleted: boolean, messageId?: string) => void;
}

export class MynahUI {
  private readonly props: MynahUIProps;
  private readonly wrapper: ExtendedHTMLElement;
  private readonly tabsWrapper: ExtendedHTMLElement;
  private readonly tabContentsWrapper: ExtendedHTMLElement;
  private readonly feedbackForm?: FeedbackForm;
  private readonly chatWrappers: Record<string, ChatWrapper> = {};

  constructor (props: MynahUIProps) {
    // Fixes for marked
    marked.use({
      renderer: {
        listitem: (src) => `<li> ${src.replace(/\[\[([^[]+)\]\](\(([^)]*))\)/gim, '<a href="$3">[$1]</a>')}</li>`
      },
    });

    this.props = props;
    Config.getInstance(props.config);
    DomBuilder.getInstance(props.rootSelector);
    MynahUITabsStore.getInstance(this.props.tabs, this.props.defaults);
    MynahUIGlobalEvents.getInstance();

    const initTabs = MynahUITabsStore.getInstance().getAllTabs();
    this.tabContentsWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-ui-tab-contents-wrapper' ],
      children: Object.keys(initTabs).slice(0, Config.getInstance().config.maxTabs).map((tabId: string) => {
        this.chatWrappers[tabId] = new ChatWrapper({
          tabId,
          onStopChatResponse: props.onStopChatResponse,
        });
        return this.chatWrappers[tabId].render;
      })
    });

    if (props.onSendFeedback !== undefined) {
      this.feedbackForm = new FeedbackForm();
    }

    if (Config.getInstance().config.maxTabs > 1) {
      this.tabsWrapper = new Tabs({
        onChange: (selectedTabId: string) => {
          if (this.props.onTabChange !== undefined) {
            this.props.onTabChange(selectedTabId);
          }
        }
      }).render;

      this.tabsWrapper.setAttribute('selected-tab', MynahUITabsStore.getInstance().getSelectedTabId());
    }

    this.wrapper = DomBuilder.getInstance().createPortal(
      MynahPortalNames.WRAPPER,
      {
        type: 'div',
        attributes: {
          id: 'mynah-wrapper'
        },
        children: [
          this.tabsWrapper ?? '',
          this.tabContentsWrapper,
        ]
      },
      'afterbegin'
    );

    MynahUITabsStore.getInstance().addListener('add', (tabId: string) => {
      this.chatWrappers[tabId] = new ChatWrapper({
        tabId,
        onStopChatResponse: props.onStopChatResponse,
      });
      this.tabContentsWrapper.appendChild(this.chatWrappers[tabId].render);
      if (this.props.onTabAdd !== undefined) {
        this.props.onTabAdd(tabId);
      }
    });
    MynahUITabsStore.getInstance().addListener('remove', (tabId: string) => {
      this.chatWrappers[tabId].render.remove();
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.chatWrappers[tabId];
      if (this.props.onTabRemove !== undefined) {
        this.props.onTabRemove(tabId);
      }
    });

    this.addGlobalListeners();
    if (this.props.onReady !== undefined) {
      this.props.onReady();
    }
  }

  private readonly addGlobalListeners = (): void => {
    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.CHAT_PROMPT, (data: {tabId: string; prompt: ChatPrompt}) => {
      if (this.props.onChatPrompt !== undefined) {
        this.props.onChatPrompt(data.tabId, data.prompt);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.FOLLOW_UP_CLICKED, (data: {
      tabId: string;
      messageId: string;
      followUpOption: ChatItemAction;
    }) => {
      if (this.props.onFollowUpClicked !== undefined) {
        this.props.onFollowUpClicked(data.tabId, data.messageId, data.followUpOption);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.BODY_ACTION_CLICKED, (data: {
      tabId: string;
      messageId: string;
      actionId: string;
      actionText?: string;
      formItemValues?: Record<string, string>;
    }) => {
      if (this.props.onInBodyButtonClicked !== undefined) {
        this.props.onInBodyButtonClicked(data.tabId, data.messageId, {
          id: data.actionId,
          text: data.actionText,
          formItemValues: data.formItemValues
        });
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SHOW_MORE_WEB_RESULTS_CLICK, (data: {messageId: string}) => {
      if (this.props.onShowMoreWebResultsClick !== undefined) {
        this.props.onShowMoreWebResultsClick(MynahUITabsStore.getInstance().getSelectedTabId(), data.messageId);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.FEEDBACK_SET, (feedbackData) => {
      if (this.props.onSendFeedback !== undefined) {
        this.props.onSendFeedback(MynahUITabsStore.getInstance().getSelectedTabId(), feedbackData);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.CHAT_ITEM_ENGAGEMENT, (data: { engagement: Engagement; messageId: string }) => {
      if (this.props.onChatItemEngagement !== undefined) {
        this.props.onChatItemEngagement(MynahUITabsStore.getInstance().getSelectedTabId(), data.messageId, data.engagement);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.COPY_CODE_TO_CLIPBOARD, (data) => {
      if (this.props.onCopyCodeToClipboard !== undefined) {
        this.props.onCopyCodeToClipboard(
          MynahUITabsStore.getInstance().getSelectedTabId(),
          data.messageId,
          data.text,
          data.type,
          data.referenceTrackerInformation
        );
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.INSERT_CODE_TO_CURSOR_POSITION, (data) => {
      if (this.props.onCodeInsertToCursorPosition !== undefined) {
        this.props.onCodeInsertToCursorPosition(
          MynahUITabsStore.getInstance().getSelectedTabId(),
          data.messageId,
          data.text,
          data.type,
          data.referenceTrackerInformation
        );
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SOURCE_LINK_CLICK, (data) => {
      if (this.props.onSourceLinkClick !== undefined) {
        this.props.onSourceLinkClick(
          MynahUITabsStore.getInstance().getSelectedTabId(),
          data.messageId,
          data.link,
          data.event
        );
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.LINK_CLICK, (data) => {
      if (this.props.onLinkClick !== undefined) {
        this.props.onLinkClick(
          MynahUITabsStore.getInstance().getSelectedTabId(),
          data.messageId,
          data.link,
          data.event
        );
      }
    });
    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.INFO_LINK_CLICK, (data) => {
      if (this.props.onInfoLinkClick !== undefined) {
        this.props.onInfoLinkClick(
          MynahUITabsStore.getInstance().getSelectedTabId(),
          data.link,
          data.event
        );
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.CARD_VOTE, (data) => {
      if (this.props.onVote !== undefined) {
        this.props.onVote(
          data.tabId,
          data.messageId,
          data.vote
        );
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.RESET_STORE, (data: {tabId: string}) => {
      if (this.props.onResetStore !== undefined) {
        this.props.onResetStore(data.tabId);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.OPEN_DIFF, (data) => {
      if (this.props.onOpenDiff !== undefined) {
        this.props.onOpenDiff(data.tabId, data.filePath, data.deleted, data.messageId);
      }
    });
  };

  public addToUserPrompt = (tabId: string, prompt: string): void => {
    if (Config.getInstance().config.showPromptField && MynahUITabsStore.getInstance().getTab(tabId) !== null) {
      this.chatWrappers[tabId].addToPrompt(prompt);
    }
  };

  /**
   * Adds a new item to the chat window
   * @param tabId Corresponding tab ID.
   * @param answer An ChatItem object.
   */
  public addChatItem = (tabId: string, chatItem: ChatItem): void => {
    if (MynahUITabsStore.getInstance().getTab(tabId) !== null) {
      MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CHAT_ITEM_ADD, { tabId, chatItem });
      MynahUITabsStore.getInstance().getTabDataStore(tabId).updateStore({
        chatItems: [
          ...MynahUITabsStore.getInstance().getTabDataStore(tabId).getValue('chatItems'),
          chatItem
        ]
      });
    }
  };

  /**
   * Updates the body of the last ChatItemType.ANSWER_STREAM chat item
   * @param body new body stream as string.
   */
  public updateLastChatAnswer = (tabId: string, updateWith: Partial<ChatItem>): void => {
    if (MynahUITabsStore.getInstance().getTab(tabId) !== null) {
      this.chatWrappers[tabId].updateLastChatAnswer(updateWith);
    }
  };

  /**
   * Updates only the UI with the given data for the given tab
   * Send tab id as an empty string to open a new tab!
   * If max tabs reached, will not return tabId
   * @param data A full or partial set of data with values.
   */
  public updateStore = (tabId: string | '', data: MynahUIDataModel): string | undefined => {
    if (tabId === '') {
      return MynahUITabsStore.getInstance().addTab({ store: { ...data } });
    } else if (MynahUITabsStore.getInstance().getTab(tabId) !== null) {
      MynahUITabsStore.getInstance().updateTab(tabId, { store: { ...data } });
    }
    return tabId;
  };

  /**
   * This function returns the selected tab id if there is any, otherwise returns undefined
   * @returns string selectedTabId or undefined
   */
  public getSelectedTabId = (): string | undefined => {
    const selectedTabId = MynahUITabsStore.getInstance().getSelectedTabId();
    return selectedTabId === '' ? undefined : selectedTabId;
  };

  /**
   * Returns all tabs with their store information
   * @returns string selectedTabId or undefined
   */
  public getAllTabs = (): MynahUITabStoreModel => MynahUITabsStore.getInstance().getAllTabs();

  /**
   * Simply creates and shows a notification
   * @param props NotificationProps
   */
  public notify = (props: {
    duration?: number;
    type?: NotificationType;
    title?: string;
    content: string;
    onNotificationClick?: () => void;
    onNotificationHide?: () => void;
  }): void => {
    new Notification({
      ...props,
      onNotificationClick: props.onNotificationClick ?? (() => {}),
    }).notify();
  };
}
