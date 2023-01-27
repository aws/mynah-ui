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
} from './static';
import { I18N } from './translations/i18n';
import './styles/styles.scss';
import { EmptyMynahUIDataModel, MynahUIDataStore } from './helper/store';
import { MynahUIGlobalEvents } from './helper/events';
import { getTimeDiff } from './helper/date-time';

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
} from './static';

export interface MynahUIProps {
  storeData?: MynahUIDataModel;
  onSearch?: (
    searchPayload: SearchPayload,
    isFromHistory?: boolean,
    isFromAutocomplete?: boolean
  ) => void;
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
  onResetStore?: () => void;
  onChangeContext?: (changeType: ContextChangeType, queryContext: ContextType) => void;
  onSuggestionEngagement?: (engagement: SuggestionEngagement) => void;
  onSuggestionClipboardInteraction?: (suggestionId: string, type?: string, text?: string) => void;
  onSuggestionInteraction?: (eventName: SuggestionEventName, suggestion: Suggestion, mouseEvent?: MouseEvent) => void;
  onSendFeedback?: (feedbackPayload: FeedbackPayload) => void;
  onRequestHistoryRecords?: (filterPayload: SearchHistoryFilters) => void;
  onRequestAutocompleteList?: (input: string) => void;
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
  private readonly mainContainer: MainContainer;
  private readonly config: MynahConfig;

  constructor (props: MynahUIProps) {
    this.props = props;
    MynahUIGlobalEvents.getInstance();
    MynahUIDataStore.getInstance(props.storeData);
    DomBuilder.getInstance('body');
    this.config = new MynahConfig();

    I18N.getInstance(this.config.getConfig('language'));

    this.wrapper = DomBuilder.getInstance().createPortal(
      MynahPortalNames.WRAPPER,
      {
        type: 'div',
        attributes: { id: 'mynah-wrapper' },
      },
      'afterbegin'
    );

    this.searchCard = new SearchCard();
    this.mainContainer = new MainContainer({
      onScroll: (e: Event) => this.searchCard.setFolded((e.target as HTMLElement).scrollTop > 0),
    });

    this.wrapper
      .insertChild('beforeend', this.searchCard.render)
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
    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.REQUEST_SEARCH_HISTORY, (data) => {
      if (this.props.onRequestHistoryRecords !== undefined) {
        this.props.onRequestHistoryRecords(data.filters);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.REQUEST_AUTOCOMPLETE_SUGGESTIONS, (data) => {
      if (this.props.onRequestAutocompleteList !== undefined) {
        this.props.onRequestAutocompleteList(data.input);
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
      if (this.props.onSearch !== undefined) {
        this.props.onSearch({
          query: data.query,
          code: MynahUIDataStore.getInstance().getValue('code'),
          codeSelection: MynahUIDataStore.getInstance().getValue('codeSelection'),
          matchPolicy: MynahUIDataStore.getInstance().getValue('matchPolicy'),
          codeQuery: MynahUIDataStore.getInstance().getValue('codeQuery'),
        }, false, data.isFromAutocomplete);
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
        this.props.onSearch({
          query: MynahUIDataStore.getInstance().getValue('query'),
          code: MynahUIDataStore.getInstance().getValue('code'),
          codeSelection: MynahUIDataStore.getInstance().getValue('codeSelection'),
          matchPolicy: currentMatchPolicy,
          codeQuery: MynahUIDataStore.getInstance().getValue('codeQuery'),
        });

        if (MynahUIDataStore.getInstance().getValue('showingHistoricalSearch') === true) {
          MynahUIDataStore.getInstance().updateStore({
            showingHistoricalSearch: false,
            headerInfo: MynahUIDataStore.getInstance().getDefaultValue('headerInfo')
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
      if (this.props.onSearch !== undefined) {
        this.props.onSearch({
          query: data.historyItem.query.input,
          codeSelection: data.historyItem.query.codeSelection,
          matchPolicy: data.historyItem.query.queryContext,
          codeQuery: data.historyItem.query.codeQuery,
          code: data.historyItem.query.code,
        }, true);
      }
      const fullStoreData: Required<MynahUIDataModel> = Object.assign((new EmptyMynahUIDataModel()).data, {
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
        }
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
      onNotificationClick: () => {}
    }).notify();
  };
}
