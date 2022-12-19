/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { MainContainer } from './components/main-container'
import { Notification, NotificationType } from './components/notification/notification'
import { SearchCard } from './components/search-block/search-card'
import { MynahConfig } from './helper/config'
import { ContextManager } from './helper/context-manager'
import { DomBuilder, ExtendedHTMLElement } from './helper/dom'
import {
    SuggestionEngagement,
    MynahPortalNames,
    Suggestion,
    SearchPayload,
    MynahEventNames,
    LiveSearchState,
    ContextChangeType,
    SuggestionEventName,
    RelevancyVoteType,
    FeedbackPayload,
    ServiceConnector,
    StateManager
} from './static'
import { I18N } from './translations/i18n'
import './styles/styles.scss'

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
} from "./static"

export interface MynahUIProps {
    serviceConnector: ServiceConnector,
    stateManager: StateManager
}
export class MynahUI {
    private readonly wrapper: ExtendedHTMLElement
    private readonly searchCard: SearchCard
    private readonly mainContainer: MainContainer
    private readonly config: MynahConfig;
    private connector: ServiceConnector;

    constructor(props: MynahUIProps) {
        DomBuilder.getInstance('body');
        ContextManager.getInstance();
        this.connector = props.serviceConnector;
        this.config = new MynahConfig({ stateManager: props.stateManager });

        I18N.getInstance(this.config.getConfig('language'));

        const isLiveSearchOn =
            this.config.getConfig('live') !== undefined &&
            this.config.getConfig('live') !== false &&
            this.config.getConfig('live') !== ''

        const listenPayloadChanges =
            this.config.getConfig('listen-payloads') !== undefined &&
            this.config.getConfig('listen-payloads') !== false &&
            this.config.getConfig('listen-payloads') !== ''

        if (isLiveSearchOn) {
            this.connector.liveSearchHandler = this.handleLiveSearch;
            this.connector.liveSearchStateExternalChangeHandler = this.handleLiveSearchExternalCommand;
        }

        if (listenPayloadChanges) {
            this.connector.liveSearchHandler = this.handlePayloadChange;
        }

        this.wrapper = DomBuilder.getInstance().createPortal(
            MynahPortalNames.WRAPPER,
            {
                type: 'div',
                attributes: { id: 'mynah-wrapper' },
            },
            'afterbegin'
        )

        const codeQuery = (() => {
            try {
                return JSON.parse(this.config.getConfig('code-query'))
            } catch (err) {
                console.warn('Cannot parse code-query data from config.')
            }
        })()

        this.searchCard = new SearchCard({
            liveSearch: isLiveSearchOn,
            onHistoryOpen: this.connector.requestHistoryRecords,
            onAutocompleteRequest: this.connector.requestAutocomplete,
            onFeedbackSet: (feedbackPayload: FeedbackPayload) => {
                this.connector.sendFeedback(feedbackPayload);
            },
            onLiveSearchToggle: (value: LiveSearchState) => {
                if (this.connector.toggleLiveSearch) {
                    this.connector.toggleLiveSearch(value, this.handleLiveSearch)
                }
            },
            onSearch: this.handleSearch,
            onHistoryChange: (suggestions: Suggestion[], payload: SearchPayload) => {
                if (suggestions !== undefined && suggestions.length > 0) {
                    this.wrapper.addClass('mynah-showing-suggestions-from-history')
                    this.mainContainer.updateCards(suggestions)

                    void this.connector.requestSuggestions(payload, true).then(() => {
                        // event sent
                    })
                } else {
                    this.wrapper.removeClass('mynah-showing-suggestions-from-history')
                    this.mainContainer.updateCards([])
                    const notification = new Notification({
                        title: "Can't show suggestions",
                        content: 'It seems like there was no suggestion on this search.',
                        type: NotificationType.WARNING,
                        onNotificationClick: () => { },
                    })
                    notification.notify()
                }
            },
            onCodeDetailsClicked: this.connector.clickCodeDetails,
            codeSelection: (() => {
                try {
                    return JSON.parse(this.config.getConfig('code-selection'))
                } catch (err) {
                    console.warn('Cannot parse code-selection data from config.')
                }
            })(),
            codeQuery,
            initText: this.config.getConfig('query-text'),
            initContextList: (() => {
                try {
                    return JSON.parse(this.config.getConfig('context'))
                } catch (err) {
                    console.warn('Cannot parse context from config.')
                }
            })(),
        })
        this.mainContainer = new MainContainer({
            onVoteChange: (suggestion: Suggestion, vote: RelevancyVoteType) => {
                this.connector.updateVoteOfSuggestion(suggestion, vote)
            },
            onSuggestionOpen: (suggestion: Suggestion) => {
                this.connector.triggerSuggestionEvent(SuggestionEventName.CLICK, suggestion)
            },
            onSuggestionLinkClick: (suggestion: Suggestion) => {
                this.connector.triggerSuggestionEvent(SuggestionEventName.OPEN, suggestion)
            },
            onSuggestionLinkCopy: (suggestion: Suggestion) => {
                this.connector.triggerSuggestionEvent(SuggestionEventName.COPY, suggestion)
            },
            onSuggestionEngaged: (engagement: SuggestionEngagement) => {
                this.connector.triggerSuggestionEngagement(engagement)
            },
            onScroll: (e: Event) => this.searchCard.setFolded((e.target as HTMLElement).scrollTop > 0),
            onCopiedToClipboard: this.connector.triggerSuggestionClipboardInteraction,
        })

        this.wrapper
            .insertChild('beforeend', this.searchCard.render)
            .insertChild('beforeend', this.mainContainer.render)

        DomBuilder.getInstance().root.addEventListener(
            MynahEventNames.CONTEXT_VISIBILITY_CHANGE as keyof HTMLElementEventMap,
            this.recordContextChange.bind(this) as EventListener
        )

        if (
            (this.config.getConfig('query-text') !== undefined && this.config.getConfig('query-text') !== '') ||
            (codeQuery !== undefined && codeQuery.simpleNames.length !== 0)
        ) {
            const initSuggestions = this.config.getConfig('suggestions')
            if (initSuggestions !== undefined && initSuggestions !== '') {
                this.handleContentUpdate(JSON.parse(initSuggestions))
            } else {
                if (
                    this.config.getConfig('loading') !== undefined &&
                    this.config.getConfig('loading') !== '' &&
                    this.config.getConfig('loading') !== 'true'
                ) {
                    this.searchCard.setWaitState(true)
                    this.mainContainer.clearCards()
                }
                this.connector
                    .once()
                    .then(this.handleContentUpdate)
                    .catch((reason: Error) => {
                        console.warn(reason)
                        this.searchCard.setWaitState(false)
                        this.mainContainer.updateCards([])
                    })
            }
        }
        this.connector.uiReady()
        this.searchCard.addFocusOnInput()
    }

    public updateSearchPayload = (searchPayload: SearchPayload): void => {

    }

    private readonly handleLiveSearchExternalCommand = (state: LiveSearchState): void => {
        switch (state) {
            case LiveSearchState.PAUSE:
            case LiveSearchState.RESUME:
                this.searchCard.changeLiveSearchState(state)
                break
            case LiveSearchState.STOP:
                this.searchCard.removeLiveSearchToggle()
                break
        }
    }

    private readonly handlePayloadChange = (searchPayload?: SearchPayload): void => {
        this.searchCard.setSearchQuery('');
        ContextManager.getInstance().removeAll();

        if (searchPayload !== undefined) {
            this.searchCard.setSearchQuery(searchPayload.query)
            this.searchCard.setContextItems(searchPayload?.matchPolicy)
            this.handleSearch(searchPayload, false);
        }
    }

    private readonly handleLiveSearch = (searchPayload?: SearchPayload, suggestions?: Suggestion[]): void => {
        this.searchCard.onLiveSearchDataReceived()
        if (suggestions !== undefined) {
            this.handleContentUpdate(suggestions)
        }

        this.searchCard.setSearchQuery('')
        ContextManager.getInstance().removeAll()

        if (searchPayload !== undefined) {
            this.searchCard.setSearchQuery(searchPayload.query)
            this.searchCard.setContextItems(searchPayload?.matchPolicy)
        }
    }

    private readonly handleContentUpdate = (suggestions: Suggestion[]): void => {
        ContextManager.getInstance().clear()
        this.mainContainer.updateCards(suggestions)
        this.config.setConfig('suggestions', JSON.stringify(suggestions))
        this.searchCard.setWaitState(false)
    }

    public handleSearch = (
        payload: SearchPayload,
        isFromAutocomplete: boolean,
        currAutocompleteSuggestionSelected?: number,
        autocompleteSuggestionsCount?: number
    ): void => {
        this.wrapper.removeClass('mynah-showing-suggestions-from-history')
        this.searchCard.setWaitState(true)
        this.mainContainer.clearCards()

        this.config.setConfig('query-text', payload.query)
        this.config.setConfig('context', JSON.stringify(payload.matchPolicy))
        this.config.setConfig('code-selection', JSON.stringify(payload.codeSelection))
        this.config.setConfig('code-query', JSON.stringify(payload.codeQuery))

        if (isFromAutocomplete) {
            this.connector.clickAutocompleteSuggestionItem(
                payload.query,
                currAutocompleteSuggestionSelected,
                autocompleteSuggestionsCount
            )
        }

        this.connector
            .requestSuggestions(payload, false, isFromAutocomplete)
            .then((suggestions?: Suggestion[]) => {
                if (suggestions != undefined) {
                    this.handleContentUpdate(suggestions)
                }
            })
            .catch((error: Error) => {
                this.searchCard.setWaitState(false)
                this.mainContainer.updateCards([]);
                console.warn(error);
                new Notification({
                    content: error.message ?? "An error occured",
                    title: "Something went wrong",
                    duration: 5000,
                    onNotificationClick: () => { },
                    type: NotificationType.ERROR
                }).notify();
            })
    }

    private readonly recordContextChange = (e: CustomEvent | { detail: { context: string } }): void => {
        const context = ContextManager.getInstance().getContextObjectFromKey(e.detail.context)
        if (context.visible !== undefined && context.visible) {
            this.connector.recordContextChange(ContextChangeType.ADD, context)
        } else {
            this.connector.recordContextChange(ContextChangeType.REMOVE, context)
        }
    }
}
