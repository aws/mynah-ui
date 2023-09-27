/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { MainContainer } from './components/main-container';
import { Notification } from './components/notification/notification';
import { MynahConfig } from './helper/config';
import { DomBuilder, ExtendedHTMLElement } from './helper/dom';
import {
  SuggestionEngagement,
  MynahPortalNames,
  Suggestion,
  SearchPayload,
  SuggestionEventName,
  RelevancyVoteType,
  FeedbackPayload,
  MynahUIDataModel,
  MynahEventNames,
  NotificationType,
  ChatItem,
  ChatItemFollowUp,
  ChatPrompt,
  ChatItemType,
  MynahMode,
} from './static';
import { I18N } from './translations/i18n';
import './styles/styles.scss';
import { MynahUIDataStore } from './helper/store';
import { MynahUIGlobalEvents } from './helper/events';
import { getSelectedTabValueFromStore } from './components/navigation-tabs';
import { ChatWrapper } from './components/chat-item/chat-wrapper';
import { NavivationTabsVertical } from './components/navigation-tabs-vertical';
import { ToggleOption } from './components/toggle';
import { FeedbackForm } from './components/feedback-form/feedback-form';

export {
  SearchPayloadCodeSelection,
  FeedbackPayload,
  RelevancyVoteType,
  SearchPayload,
  Suggestion,
  EngagementType,
  SuggestionEngagement,
  SuggestionEventName,
  MynahUIDataModel,
  NotificationType,
  MynahMode,
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

export {
  transformPayloadData,
  validateRulesOnPayloadData,
  PayloadTransformRule,
} from './helper/payload-transformer';

export interface MynahUIProps {
  rootSelector?: string;
  storeData?: MynahUIDataModel;
  onSearch?: ((
    searchPayload: SearchPayload
  ) => void) | ((
    searchPayload: SearchPayload
  ) => MynahUIDataModel);
  onShowMoreWebResultsClick?: () => void;
  onReady?: () => void;
  onClickSuggestionVote?: (suggestion: Suggestion, vote: RelevancyVoteType) => void;
  onClearChat?: () => void;
  onStopChatResponse?: () => void;
  onResetStore?: () => void;
  onChatPrompt?: (prompt: ChatPrompt) => void;
  onFollowUpClicked?: (followUp: ChatItemFollowUp) => void;
  onSuggestionAttachedToChatPrompt?: (attachment: Suggestion) => void;
  onNavigationTabChange?: (selectedTab: string) => void;
  onSideNavigationTabChange?: (selectedTab: string) => void;
  onSuggestionEngagement?: (engagement: SuggestionEngagement) => void;
  onCopyCodeToClipboard?: (code?: string, type?: 'selection' | 'block') => void;
  onCodeInsertToCursorPosition?: (code?: string, type?: 'selection' | 'block') => void;
  onSuggestionInteraction?: (eventName: SuggestionEventName, suggestion: Suggestion, mouseEvent?: MouseEvent) => void;
  onSendFeedback?: (feedbackPayload: FeedbackPayload) => void;
}
export class MynahUI {
  private readonly props: MynahUIProps;
  private readonly wrapper: ExtendedHTMLElement;
  private readonly sideNav: ExtendedHTMLElement;
  private readonly feedbackForm?: FeedbackForm;

  private readonly mainContainer: MainContainer;
  private readonly chatWrapper: ChatWrapper;
  private readonly config: MynahConfig;

  constructor (props: MynahUIProps) {
    this.props = props;
    MynahUIGlobalEvents.getInstance();
    MynahUIDataStore.getInstance(props.storeData);
    DomBuilder.getInstance(props.rootSelector);
    this.config = new MynahConfig();

    I18N.getInstance(this.config.getConfig('language'));

    this.chatWrapper = new ChatWrapper({
      onStopChatResponse: props.onStopChatResponse,
      onShowAllWebResultsClick: (this.props.onSearch !== undefined)
        ? () => {
            this.sideNavigationTabChanged(MynahMode.SEARCH, true);
          }
        : undefined,
      showFeedbackButton: props.onSendFeedback !== undefined
    });
    this.mainContainer = new MainContainer({
      onNavigationTabChange: props.onNavigationTabChange,
      onCloseButtonClick: () => {
        this.sideNavigationTabChanged(MynahMode.CHAT, true);
      }
    });

    if (props.onSendFeedback !== undefined) {
      this.feedbackForm = new FeedbackForm();
    }

    const sideNavTabItems = MynahUIDataStore.getInstance().getValue('sideNavigationTabs');
    this.sideNav = DomBuilder.getInstance().build(
      {
        type: 'div',
        classNames: [
          ...(sideNavTabItems.length === 0 ? [ 'mynah-no-tabs' ] : []),
        ],
        attributes: {
          id: 'mynah-side-nav'
        },
        children: [
          new NavivationTabsVertical({
            onChange: this.sideNavigationTabChanged
          }).render
        ]
      }
    );
    MynahUIDataStore.getInstance().subscribe('sideNavigationTabs', (newTabs: ToggleOption[]) => {
      if (newTabs.length === 0) {
        this.sideNav.addClass('mynah-no-tabs');
      } else {
        this.sideNav.removeClass('mynah-no-tabs');
      }
    });

    this.wrapper = DomBuilder.getInstance().createPortal(
      MynahPortalNames.WRAPPER,
      {
        type: 'div',
        attributes: {
          id: 'mynah-wrapper',
          mode: MynahUIDataStore.getInstance().getValue('mode')
        },
        children: [
          this.sideNav,
          this.chatWrapper.render,
          this.mainContainer.render
        ]
      },
      'afterbegin'
    );

    MynahUIDataStore.getInstance().subscribe('mode', (newMode) => {
      this.wrapper.setAttribute('mode', newMode);
    });

    this.addGlobalListeners();
    setTimeout(() => {
      if (this.props.onReady !== undefined) {
        this.props.onReady();
      }
    }, 1000);
  }

  private readonly sideNavigationTabChanged = (selectedTab: string, informSubscribers?: boolean): void => {
    if (this.props.onSideNavigationTabChange !== undefined) {
      MynahUIDataStore.getInstance().updateStore({
        sideNavigationTabs: MynahUIDataStore.getInstance().getValue('sideNavigationTabs').map((navTab: ToggleOption) => (
          { ...navTab, selected: navTab.value === selectedTab }
        ))
      }, informSubscribers !== true);
      this.props.onSideNavigationTabChange(selectedTab);
    }
  };

  private readonly addGlobalListeners = (): void => {
    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.CHAT_PROMPT, (data: ChatPrompt) => {
      if (this.props.onChatPrompt !== undefined) {
        this.props.onChatPrompt(data);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.FOLLOW_UP_CLICKED, (data: ChatItemFollowUp) => {
      if (this.props.onFollowUpClicked !== undefined) {
        this.props.onFollowUpClicked(data);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.CLEAR_CHAT, () => {
      if (this.props.onClearChat !== undefined) {
        this.props.onClearChat();
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SHOW_MORE_WEB_RESULTS_CLICK, () => {
      if (this.props.onShowMoreWebResultsClick !== undefined) {
        this.props.onShowMoreWebResultsClick();
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SUGGESTION_ATTACHED_TO_CHAT, (data: Suggestion) => {
      if (this.props.onSuggestionAttachedToChatPrompt !== undefined) {
        this.props.onSuggestionAttachedToChatPrompt(data);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.FEEDBACK_SET, (feedbackData) => {
      if (this.props.onSendFeedback !== undefined) {
        this.props.onSendFeedback(feedbackData);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SEARCH, () => {
      let directStoreDataReturn: MynahUIDataModel = {};
      if (this.props.onSearch !== undefined) {
        directStoreDataReturn = this.props.onSearch({
          selectedTab: getSelectedTabValueFromStore(),
        }) ?? {};
      }

      if (directStoreDataReturn !== undefined && Object.keys(directStoreDataReturn).length > 0) {
        MynahUIDataStore.getInstance().updateStore({
          ...directStoreDataReturn
        });
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SUGGESTION_ENGAGEMENT, (engagement: SuggestionEngagement) => {
      if (this.props.onSuggestionEngagement !== undefined) {
        this.props.onSuggestionEngagement(
          engagement
        );
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.COPY_CODE_TO_CLIPBOARD, (data) => {
      if (this.props.onCopyCodeToClipboard !== undefined) {
        this.props.onCopyCodeToClipboard(
          data.text,
          data.type,
        );
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.INSERT_CODE_TO_CURSOR_POSITION, (data) => {
      if (this.props.onCodeInsertToCursorPosition !== undefined) {
        this.props.onCodeInsertToCursorPosition(
          data.text,
          data.type,
        );
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SUGGESTION_OPEN, (data) => {
      if (this.props.onSuggestionInteraction !== undefined) {
        this.props.onSuggestionInteraction(
          SuggestionEventName.OPEN,
          data.suggestion,
          data.event
        );
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SUGGESTION_VOTE, (data) => {
      if (this.props.onClickSuggestionVote !== undefined) {
        this.props.onClickSuggestionVote(
          data.suggestion,
          data.vote
        );
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SUGGESTION_LINK_COPY, (data) => {
      if (this.props.onSuggestionInteraction !== undefined) {
        this.props.onSuggestionInteraction(
          SuggestionEventName.COPY,
          data.suggestion
        );
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.RESET_STORE, () => {
      if (this.props.onResetStore !== undefined) {
        this.props.onResetStore();
      }
    });
  };

  /**
   * Adds a new answer on the chat window
   * @param anwer An ChatItem object.
   */
  public addChatAnswer = (answer: ChatItem): void => {
    const chatItems: ChatItem[] = MynahUIDataStore.getInstance().getValue('chatItems');
    chatItems.push(answer);
    MynahUIDataStore.getInstance().updateStore({
      chatItems
    });
  };

  public getLastChatAnswer = (): ChatItem | undefined => {
    const chatItems: ChatItem[] = MynahUIDataStore.getInstance().getValue('chatItems');
    for (let i = chatItems.length - 1; i >= 0; i--) {
      if (chatItems[i].type === ChatItemType.ANSWER) {
        return chatItems[i];
      }
    }
    return undefined;
  };

  /**
   * Updates the body of the last ChatItemType.ANSWER_STREAM chat item
   * @param body new body stream as string.
   */
  public updateLastChatAnswerStream = (body: string): void => {
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.UPDATE_LAST_CHAT_ANSWER_STREAM, body);
  };

  /**
   * Updates only the UI with the given data.
   * @param data A full or partial set of data with values.
   */
  public updateStore = (data: MynahUIDataModel): void => {
    MynahUIDataStore.getInstance().updateStore({ ...data });
  };

  public getMode = (): MynahMode | undefined => {
    return MynahUIDataStore.getInstance().getValue('mode');
  };

  /**
   * Sets store defaults to use while clearing the store
   * To clear the defaults, send `null`
   * @param defaults partial set of MynahUIDataModel for defaults
   */
  public setStoreDefaults = (defaults: MynahUIDataModel | null): void => {
    MynahUIDataStore.getInstance().setDefaults(defaults);
  };

  /**
   * Returns the current search payload
   */
  public getSearchPayload = (): SearchPayload => ({
    selectedTab: getSelectedTabValueFromStore(),
  });

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
      onNotificationClick: () => { }
    }).notify();
  };
}
