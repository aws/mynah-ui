/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Notification } from './components/notification/notification';
import { DomBuilder, ExtendedHTMLElement } from './helper/dom';
import {
  SuggestionEngagement,
  MynahPortalNames,
  Suggestion,
  SuggestionEventName,
  RelevancyVoteType,
  FeedbackPayload,
  MynahUIDataModel,
  MynahEventNames,
  NotificationType,
  ChatItem,
  ChatItemFollowUp,
  ChatPrompt,
  MynahUITabStoreModel,
  MynahUITabStoreTab,
  ConfigModel,
  ReferenceTrackerInformation,
} from './static';
import { MynahUIGlobalEvents } from './helper/events';
import { Tabs } from './components/navigation-tabs';
import { ChatWrapper } from './components/chat-item/chat-wrapper';
import { FeedbackForm } from './components/feedback-form/feedback-form';
import { MynahUITabsStore } from './helper/tabs-store';
import './styles/styles.scss';
import { Config } from './helper/config';

export {
  FeedbackPayload,
  RelevancyVoteType,
  Suggestion,
  EngagementType,
  SuggestionEngagement,
  SuggestionEventName,
  MynahUIDataModel,
  NotificationType,
  ChatItem,
  ChatItemFollowUp,
  ChatItemType,
  ChatPrompt
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
  config?: ConfigModel;
  onShowMoreWebResultsClick?: (tabId: string, messageId: string) => void;
  onReady?: () => void;
  onVote?: (tabId: string, messageId: string, vote: RelevancyVoteType) => void;
  onStopChatResponse?: (tabId: string) => void;
  onResetStore?: (tabId: string) => void;
  onChatPrompt?: (tabId: string, prompt: ChatPrompt) => void;
  onFollowUpClicked?: (tabId: string, followUp: ChatItemFollowUp) => void;
  onTabChange?: (tabId: string) => void;
  onTabAdd?: (tabId: string) => void;
  onTabRemove?: (tabId: string) => void;
  onSuggestionEngagement?: (tabId: string, engagement: SuggestionEngagement) => void;
  onCopyCodeToClipboard?: (tabId: string, code?: string, type?: 'selection' | 'block', referenceTrackerInformation?: ReferenceTrackerInformation[]) => void;
  onCodeInsertToCursorPosition?: (tabId: string, code?: string, type?: 'selection' | 'block', referenceTrackerInformation?: ReferenceTrackerInformation[]) => void;
  onSuggestionInteraction?: (tabId: string, eventName: SuggestionEventName, suggestion: Suggestion, mouseEvent?: MouseEvent) => void;
  onSendFeedback?: (tabId: string, feedbackPayload: FeedbackPayload) => void;
  onOpenDiff?: (tabId: string, leftPath: string, rightPath: string, messageId?: string) => void;
}

export class MynahUI {
  private readonly props: MynahUIProps;
  private readonly wrapper: ExtendedHTMLElement;
  private readonly tabsWrapper: ExtendedHTMLElement;
  private readonly tabContentsWrapper: ExtendedHTMLElement;
  private readonly feedbackForm?: FeedbackForm;
  private readonly chatWrappers: Record<string, ChatWrapper> = {};

  constructor (props: MynahUIProps) {
    this.props = props;
    MynahUITabsStore.getInstance(this.props.tabs, this.props.defaults);
    MynahUIGlobalEvents.getInstance();

    DomBuilder.getInstance(props.rootSelector);

    Config.getInstance(props.config);

    const initTabs = MynahUITabsStore.getInstance().getAllTabs();
    this.tabContentsWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-ui-tab-contents-wrapper' ],
      children: Object.keys(initTabs).map((tabId: string) => {
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

    this.tabsWrapper = new Tabs({
      onChange: (selectedTabId: string) => {
        if (this.props.onTabChange !== undefined) {
          this.props.onTabChange(selectedTabId);
        }
      }
    }).render;

    this.tabsWrapper.setAttribute('selected-tab', MynahUITabsStore.getInstance().getSelectedTabId());

    this.wrapper = DomBuilder.getInstance().createPortal(
      MynahPortalNames.WRAPPER,
      {
        type: 'div',
        attributes: {
          id: 'mynah-wrapper'
        },
        children: [
          this.tabsWrapper,
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
    setTimeout(() => {
      if (this.props.onReady !== undefined) {
        this.props.onReady();
      }
    }, 100);
  }

  private readonly addGlobalListeners = (): void => {
    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.CHAT_PROMPT, (data: {tabId: string; prompt: ChatPrompt}) => {
      if (this.props.onChatPrompt !== undefined) {
        this.props.onChatPrompt(data.tabId, data.prompt);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.FOLLOW_UP_CLICKED, (data: {
      tabId: string;
      followUpOption: ChatItemFollowUp;
    }) => {
      if (this.props.onFollowUpClicked !== undefined) {
        this.props.onFollowUpClicked(data.tabId, data.followUpOption);
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

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SUGGESTION_ENGAGEMENT, (engagement: SuggestionEngagement) => {
      if (this.props.onSuggestionEngagement !== undefined) {
        this.props.onSuggestionEngagement(
          MynahUITabsStore.getInstance().getSelectedTabId(),
          engagement
        );
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.COPY_CODE_TO_CLIPBOARD, (data) => {
      if (this.props.onCopyCodeToClipboard !== undefined) {
        this.props.onCopyCodeToClipboard(
          MynahUITabsStore.getInstance().getSelectedTabId(),
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
          data.text,
          data.type,
          data.referenceTrackerInformation
        );
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SUGGESTION_OPEN, (data) => {
      if (this.props.onSuggestionInteraction !== undefined) {
        this.props.onSuggestionInteraction(
          MynahUITabsStore.getInstance().getSelectedTabId(),
          SuggestionEventName.OPEN,
          data.suggestion,
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

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SUGGESTION_LINK_COPY, (data) => {
      if (this.props.onSuggestionInteraction !== undefined) {
        this.props.onSuggestionInteraction(
          MynahUITabsStore.getInstance().getSelectedTabId(),
          SuggestionEventName.COPY,
          data.suggestion
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
        this.props.onOpenDiff(data.tabId, data.leftPath, data.rightPath, data.messageId);
      }
    });
  };

  /**
   * Create a new tab and set it to the currently-selected tab
   * @param initialTabData Data used to initialize the new tab.
   * @returns The tab ID of the created tab.
   */
  public createNewTab = (initialTabData: MynahUIDataModel): string => {
    return MynahUITabsStore.getInstance().addTab({ store: { ...initialTabData } });
  };

  /**
   * Update a tab's data
   * @param tabData Tab data to update to.
   */
  public updateTab = (tabId: string, tabData: MynahUIDataModel): void => {
    MynahUITabsStore.getInstance().updateTab(tabId, { store: { ...tabData } });
  };

  /**
   * Set the loading state for chat window. When loading, a loading bubble will show
   * and user input will be disabled
   * @param tabId Corresponding tab ID.
   * @param isLoading True if is loading, false otherwise.
   */
  public setChatLoadingState = (tabId: string, isLoading: boolean): void => {
    MynahUITabsStore.getInstance().getTabDataStore(tabId).updateStore({
      loadingChat: isLoading,
      promptInputDisabledState: isLoading,
    });
  };

  // TODO
  public addToUserPrompt = (tabId: string, prompt: string): void => {
    if (MynahUITabsStore.getInstance().getTab(tabId) !== null) {
      this.chatWrappers[tabId].addToPrompt(prompt);
    }
  };

  /**
   * Adds a new answer on the chat window
   * @param tabId Corresponding tab ID.
   * @param answer An ChatItem object.
   */
  public addChatItem = (tabId: string, chatItem: ChatItem): void => {
    if (MynahUITabsStore.getInstance().getTab(tabId) !== null) {
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
   * @param data A full or partial set of data with values.
   */
  public updateStore = (tabId: string | '', data: MynahUIDataModel): string => {
    if (tabId === '') {
      return MynahUITabsStore.getInstance().addTab({ store: { ...data } });
    } else if (MynahUITabsStore.getInstance().getTab(tabId) !== null) {
      MynahUITabsStore.getInstance().updateTab(tabId, { store: { ...data } });
    }
    return tabId;
  };

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
      onNotificationClick: () => {},
    }).notify();
  };
}
