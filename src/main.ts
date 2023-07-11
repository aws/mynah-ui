/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { MainContainer } from './components/main-container';
import { Notification } from './components/notification/notification';
import { SearchCard } from './components/search-block/search-card';
import { MynahConfig } from './helper/config';
import { DomBuilder, ExtendedHTMLElement } from './helper/dom';
import {
  SuggestionEngagement,
  MynahPortalNames,
  Suggestion,
  SearchPayload,
  LiveSearchState,
  SuggestionEventName,
  RelevancyVoteType,
  FeedbackPayload,
  MynahUIDataModel,
  ContextChangeType,
  ContextType,
  SearchHistoryFilters,
  MynahEventNames,
  SearchHistoryItem,
  SearchPayloadMatchPolicy,
  ContextTypes,
  AutocompleteItem,
  NotificationType,
  ChatItem,
  ChatPrompt,
} from './static';
import { I18N } from './translations/i18n';
import './styles/styles.scss';
import { EmptyMynahUIDataModel, MynahUIDataStore } from './helper/store';
import { MynahUIGlobalEvents } from './helper/events';
import { getTimeDiff } from './helper/date-time';
import { getSelectedTabValueFromStore, NavivationTabs } from './components/navigation-tabs';
import { ToggleOption } from './components/toggle';

export {
  AutocompleteItem,
  SearchPayloadCodeSelection,
  FeedbackPayload,
  RelevancyVoteType,
  LiveSearchState,
  SearchPayload,
  Suggestion,
  ContextType,
  SearchHistoryItem,
  EngagementType,
  SuggestionEngagement,
  SuggestionEventName,
  SearchHistoryFilters,
  MynahUIDataModel,
  ContextChangeType,
  ContextSource,
  ContextTypes,
  NotificationType,
  MynahMode,
  ChatItem,
  ChatItemFollowUp,
  ChatItemType,
  ChatPrompt
} from './static';

export {
  transformPayloadData,
  validateRulesOnPayloadData,
  PayloadTransformRule,
} from './helper/payload-transformer';

export interface MynahUIProps {
  rootSelector?: string;
  storeData?: MynahUIDataModel;
  onSearch?: ((
    searchPayload: SearchPayload,
    isFromHistory?: boolean,
    isFromAutocomplete?: boolean
  ) => void) | ((
    searchPayload: SearchPayload,
    isFromHistory?: boolean,
    isFromAutocomplete?: boolean
  ) => MynahUIDataModel);
  onReady?: () => void;
  onClickSuggestionVote?: (suggestion: Suggestion, vote: RelevancyVoteType) => void;
  onClickCodeDetails?: (
    code: string,
    fileName?: string,
    range?: {
      start: { row: string; column?: string };
      end?: { row: string; column?: string };
    }
  ) => void;
  onClearChat?: () => void;
  onResetStore?: () => void;
  onChangeContext?: (changeType: ContextChangeType, queryContext: ContextType) => void;
  onChatPrompt?: (prompt: ChatPrompt) => void;
  onSuggestionAttachedToChatPrompt?: (attachment: Suggestion) => void;
  onNavigationTabChange?: (selectedTab: string) => void;
  onSuggestionEngagement?: (engagement: SuggestionEngagement) => void;
  onSuggestionClipboardInteraction?: (suggestionId: string, type?: string, text?: string) => void;
  onSuggestionInteraction?: (eventName: SuggestionEventName, suggestion: Suggestion, mouseEvent?: MouseEvent) => void;
  onSendFeedback?: (feedbackPayload: FeedbackPayload) => void;
  onRequestHistoryRecords?: (filterPayload: SearchHistoryFilters) => void;
  onInputQueryChange?: (input: string) => void;
  onChangeLiveSearchState?: (liveSearchState: LiveSearchState) => void;
  onClickAutocompleteItem?: (
    text: string,
    currSelected?: number,
    suggestionCount?: number
  ) => void;
}
export class MynahUI {
  private readonly props: MynahUIProps;
  private readonly wrapper: ExtendedHTMLElement;
  private readonly searchCard: SearchCard;
  private readonly navTabs: NavivationTabs;
  private readonly mainContainer: MainContainer;
  private readonly config: MynahConfig;

  constructor (props: MynahUIProps) {
    this.props = props;
    MynahUIGlobalEvents.getInstance();
    MynahUIDataStore.getInstance(props.storeData);
    DomBuilder.getInstance(props.rootSelector);
    this.config = new MynahConfig();

    I18N.getInstance(this.config.getConfig('language'));

    this.wrapper = DomBuilder.getInstance().createPortal(
      MynahPortalNames.WRAPPER,
      {
        type: 'div',
        classNames: [ 'chat' ],
        attributes: {
          id: 'mynah-wrapper',
          mode: MynahUIDataStore.getInstance().getValue('mode')
        },
      },
      'afterbegin'
    );

    MynahUIDataStore.getInstance().subscribe('mode', (newMode) => {
      this.wrapper.setAttribute('mode', newMode);
    });

    this.searchCard = new SearchCard();
    this.navTabs = new NavivationTabs({
      onChange: (selectedTab: string) => {
        if (props.onNavigationTabChange !== undefined) {
          MynahUIDataStore.getInstance().updateStore({
            navigationTabs: MynahUIDataStore.getInstance().getValue('navigationTabs').map((navTab: ToggleOption) => ({ ...navTab, selected: navTab.value === selectedTab }))
          }, true);
          props.onNavigationTabChange(selectedTab);
        }

        MynahUIDataStore.getInstance().updateStore({
          ...(MynahUIDataStore.getInstance().getValue('showingHistoricalSearch') === true
            ? {
                headerInfo: {
                  content: ''
                },
                showingHistoricalSearch: false,
              }
            : {}),
        });
      }
    });
    this.mainContainer = new MainContainer({
      onScroll: (e: Event) => this.searchCard.setFolded((e.target as HTMLElement).scrollTop > 0),
    });

    this.wrapper
      .insertChild('beforeend', this.searchCard.render)
      .insertChild('beforeend', this.navTabs.render)
      .insertChild('beforeend', this.mainContainer.render);

    this.searchCard.addFocusOnInput();
    this.addGlobalListeners();
    setTimeout(() => {
      if (this.props.onReady !== undefined) {
        this.props.onReady();
      }
    }, 1000);
  }

  private readonly addGlobalListeners = (): void => {
    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.CHAT_PROMPT, (data: ChatPrompt) => {
      if (this.props.onChatPrompt !== undefined) {
        this.props.onChatPrompt(data);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.CLEAR_CHAT, () => {
      if (this.props.onClearChat !== undefined) {
        this.props.onClearChat();
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SUGGESTION_ATTACHED_TO_CHAT, (data: Suggestion) => {
      if (this.props.onSuggestionAttachedToChatPrompt !== undefined) {
        this.props.onSuggestionAttachedToChatPrompt(data);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.REQUEST_SEARCH_HISTORY, (data) => {
      if (this.props.onRequestHistoryRecords !== undefined) {
        this.props.onRequestHistoryRecords(data.filters);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.INPUT_QUERY_CHANGE, (data) => {
      if (this.props.onInputQueryChange !== undefined) {
        this.props.onInputQueryChange(data.input);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.AUTOCOMPLETE_SUGGESTION_CLICK, (data: {
      autocompleteQuery: AutocompleteItem;
      index: number;
      count: number;
    }) => {
      if (this.props.onClickAutocompleteItem !== undefined) {
        this.props.onClickAutocompleteItem(data.autocompleteQuery.suggestion, data.index, data.count);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.FEEDBACK_SET, (feedbackData) => {
      if (this.props.onSendFeedback !== undefined) {
        this.props.onSendFeedback(feedbackData);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.LIVE_SEARCH_STATE_CHANGED, (data) => {
      if (this.props.onChangeLiveSearchState !== undefined) {
        this.props.onChangeLiveSearchState(data.liveSearchState);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SEARCH, (data: {
      query: string;
      isFromAutocomplete?: boolean;
    }) => {
      let directStoreDataReturn: MynahUIDataModel = {};
      if (this.props.onSearch !== undefined) {
        directStoreDataReturn = this.props.onSearch({
          query: data.query,
          code: MynahUIDataStore.getInstance().getValue('code'),
          codeSelection: MynahUIDataStore.getInstance().getValue('codeSelection'),
          matchPolicy: MynahUIDataStore.getInstance().getValue('matchPolicy'),
          codeQuery: MynahUIDataStore.getInstance().getValue('codeQuery'),
          selectedTab: getSelectedTabValueFromStore(),
        }, false, data.isFromAutocomplete) ?? {};
      }
      if (this.props.onChangeLiveSearchState != null) {
        this.props.onChangeLiveSearchState(LiveSearchState.STOP);
        MynahUIDataStore.getInstance().updateStore({
          liveSearchState: MynahUIDataStore.getInstance().getDefaultValue('liveSearchState'),
          ...(MynahUIDataStore.getInstance().getValue('showingHistoricalSearch') === true
            ? {
                headerInfo: {
                  content: ''
                },
                showingHistoricalSearch: false,
              }
            : {}),
          ...directStoreDataReturn
        });
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.CONTEXT_VISIBILITY_CHANGE, (data: {
      type: ContextChangeType;
      context: ContextType;
      oldPolicyType?: ContextTypes;
    }) => {
      const currentMatchPolicy = Object.assign({}, MynahUIDataStore.getInstance().getValue('matchPolicy') as SearchPayloadMatchPolicy);
      if (data.type === ContextChangeType.ADD) {
        if (data.oldPolicyType !== undefined && data.oldPolicyType !== data.context.type) {
          currentMatchPolicy[data.oldPolicyType] = currentMatchPolicy[data.oldPolicyType]
            .filter((contextKey: string) => contextKey !== data.context.context);
        }
        currentMatchPolicy[data.context.type as ContextTypes].push(data.context.context);
      } else if (data.type === ContextChangeType.REMOVE) {
        currentMatchPolicy[data.context.type as ContextTypes] = currentMatchPolicy[data.context.type as ContextTypes]
          .filter((contextKey: string) => contextKey !== data.context.context);
      }
      MynahUIDataStore.getInstance().updateStore({
        matchPolicy: { ...currentMatchPolicy }
      });

      if (this.props.onSearch !== undefined && (
        MynahUIDataStore.getInstance().getValue('query') !== '' ||
        MynahUIDataStore.getInstance().getValue('codeSelection').selectedCode !== ''
      )) {
        const directStoreDataReturn: MynahUIDataModel = this.props.onSearch({
          query: MynahUIDataStore.getInstance().getValue('query'),
          code: MynahUIDataStore.getInstance().getValue('code'),
          codeSelection: MynahUIDataStore.getInstance().getValue('codeSelection'),
          matchPolicy: currentMatchPolicy,
          codeQuery: MynahUIDataStore.getInstance().getValue('codeQuery'),
          selectedTab: getSelectedTabValueFromStore(),
        }) ?? {};

        if (MynahUIDataStore.getInstance().getValue('showingHistoricalSearch') === true) {
          MynahUIDataStore.getInstance().updateStore({
            showingHistoricalSearch: false,
            headerInfo: MynahUIDataStore.getInstance().getDefaultValue('headerInfo'),
            ...directStoreDataReturn
          });
        }
      }

      if (this.props.onChangeContext != null) {
        this.props.onChangeContext(data.type, data.context);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SEARCH_HISTORY_ITEM_CLICK, (data: {
      historyItem: SearchHistoryItem;
    }) => {
      let directStoreDataReturn: MynahUIDataModel = {};
      if (this.props.onSearch !== undefined) {
        directStoreDataReturn = this.props.onSearch({
          query: data.historyItem.query.input,
          codeSelection: data.historyItem.query.codeSelection,
          matchPolicy: data.historyItem.query.queryContext,
          codeQuery: data.historyItem.query.codeQuery,
          code: data.historyItem.query.code,
          selectedTab: data.historyItem.query.selectedTab
        }, true) ?? {};
      }
      const fullStoreData: Required<MynahUIDataModel> = Object.assign((new EmptyMynahUIDataModel(MynahUIDataStore.getInstance().getDefaults())).data, {
        ...(data.historyItem.query.input !== undefined ? { query: data.historyItem.query.input } : {}),
        ...(data.historyItem.query.queryContext !== undefined ? { matchPolicy: data.historyItem.query.queryContext } : {}),
        ...(data.historyItem.suggestions !== undefined ? { suggestions: data.historyItem.suggestions } : {}),
        ...(data.historyItem.query.codeQuery !== undefined ? { codeQuery: data.historyItem.query.codeQuery } : {}),
        ...(data.historyItem.query.codeSelection !== undefined ? { codeSelection: data.historyItem.query.codeSelection } : {}),
        ...(data.historyItem.query.code !== undefined ? { code: data.historyItem.query.code } : {}),
        showingHistoricalSearch: true,
        headerInfo: {
          content: data.historyItem.recordDate !== undefined
            ? `Showing the search you've performed ${getTimeDiff(
              new Date().getTime() - data.historyItem.recordDate
            ).toString()} ago.`
            : ''
        },
        ...directStoreDataReturn
      });
      MynahUIDataStore.getInstance().updateStore(fullStoreData);
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.CODE_DETAILS_CLICK, (data) => {
      if (this.props.onClickCodeDetails !== undefined) {
        this.props.onClickCodeDetails(
          data.code,
          data.fileName,
          data.range
        );
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SUGGESTION_ENGAGEMENT, (engagement: SuggestionEngagement) => {
      if (this.props.onSuggestionEngagement !== undefined) {
        this.props.onSuggestionEngagement(
          engagement
        );
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SUGGESTION_COPY_TO_CLIPBOARD, (data) => {
      if (this.props.onSuggestionClipboardInteraction !== undefined) {
        this.props.onSuggestionClipboardInteraction(
          data.suggestionId,
          data.type,
          data.text
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
    if (answer.incremental === true && chatItems.length > 0) {
      chatItems.pop();
    }
    chatItems.push(answer);
    MynahUIDataStore.getInstance().updateStore({
      chatItems
    });
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
    query: MynahUIDataStore.getInstance().getValue('query'),
    matchPolicy: MynahUIDataStore.getInstance().getValue('matchPolicy'),
    codeSelection: MynahUIDataStore.getInstance().getValue('codeSelection'),
    codeQuery: MynahUIDataStore.getInstance().getValue('codeQuery'),
    code: MynahUIDataStore.getInstance().getValue('code'),
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
